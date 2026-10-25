import { useEffect, useRef } from "react";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection } from "geojson";

import { REPORT_HEX, STATUS_HEX } from "@/features/map/types";
import type { ProjectStatus } from "@/features/map/types";

const MANILA: [number, number] = [120.9842, 14.5995];
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;

const PIN_STATUSES = [...(Object.keys(STATUS_HEX) as ProjectStatus[]), "report"] as const;

function pinSvg(color: string): string {
  return `<svg width="36" height="48" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 30 18 30S36 31.5 36 18C36 8.059 27.941 0 18 0z" fill="${color}"/>
    <circle cx="18" cy="17" r="12" fill="white"/>
  </svg>`;
}

function loadPinImages(map: maplibregl.Map): Promise<void[]> {
  const entries: [string, string][] = [
    ...PIN_STATUSES.filter((s) => s !== "report").map(
      (s) => [`pin-${s}`, STATUS_HEX[s as ProjectStatus]] as [string, string]
    ),
    ["pin-report", REPORT_HEX],
  ];

  return Promise.all(
    entries.map(
      ([name, color]) =>
        new Promise<void>((resolve) => {
          const img = new Image(36, 48);
          img.onload = () => { map.addImage(name, img); resolve(); };
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(pinSvg(color))}`;
        })
    )
  );
}

async function initLayers(map: maplibregl.Map, data: FeatureCollection) {
  await loadPinImages(map);

  map.addSource("projects", {
    type: "geojson",
    data,
    cluster: true,
    clusterRadius: 50,
    clusterMaxZoom: 14,
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "projects",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": STATUS_HEX.on_track,
      "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 50, 30],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "projects",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-size": 13,
      "text-font": ["Noto Sans Bold"],
    },
    paint: { "text-color": "#fff" },
  });

  map.addLayer({
    id: "project-pins",
    type: "symbol",
    source: "projects",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": ["concat", "pin-", ["get", "status"]],
      "icon-size": 1,
      "icon-anchor": "bottom",
      "icon-allow-overlap": true,
    },
  });

  map.addLayer({
    id: "project-progress",
    type: "symbol",
    source: "projects",
    filter: ["!", ["has", "point_count"]],
    minzoom: 13,
    layout: {
      "text-field": ["concat", ["to-string", ["get", "progress"]], "%"],
      "text-size": 10,
      "text-offset": [0, 0.5],
      "text-anchor": "top",
      "text-font": ["Noto Sans Bold"],
    },
    paint: {
      "text-color": "#1e293b",
      "text-halo-color": "#fff",
      "text-halo-width": 1,
    },
  });
}

interface MapViewProps {
  data: FeatureCollection;
  onProjectClick?: (properties: Record<string, unknown>) => void;
}

export function MapView({ data, onProjectClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/dataviz-v4/style.json?key=${MAPTILER_KEY}`,
      center: MANILA,
      zoom: 11,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    map.on("load", () => { void initLayers(map, data); });

    map.on("click", "clusters", async (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      if (!features[0]) return;
      const clusterId = features[0].properties.cluster_id as number;
      const source = map.getSource("projects") as maplibregl.GeoJSONSource;
      const zoom = await source.getClusterExpansionZoom(clusterId);
      const coords = (features[0].geometry as unknown as { coordinates: [number, number] }).coordinates;
      map.easeTo({ center: coords, zoom });
    });

    map.on("click", "project-pins", (e) => {
      if (!e.features?.[0]?.properties) return;
      onProjectClick?.(e.features[0].properties as Record<string, unknown>);
    });

    map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
    map.on("mouseenter", "project-pins", () => { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "project-pins", () => { map.getCanvas().style.cursor = ""; });

    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update source data when filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("projects") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(data);
  }, [data]);

  return <div ref={containerRef} className="h-full w-full" />;
}
