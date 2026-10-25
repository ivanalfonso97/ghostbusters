import { useCallback, useMemo, useState } from "react";

import { createFileRoute } from "rivvy-ui/router/route";

import { mockProjects } from "@/data/mockProjects";
import { FilterChips } from "@/features/map/components/FilterChips";
import { MapView } from "@/features/map/components/MapView";
import { ProjectSidebar } from "@/features/map/components/ProjectSidebar";
import type { StatusFilter, TypeFilter } from "@/features/map/components/FilterChips";

export const Route = createFileRoute("/_map/")({
  eager: true,
  component: MapPage,
});

// eslint-disable-next-line react-refresh/only-export-components
function MapPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [selectedProject, setSelectedProject] = useState<Record<string, unknown> | null>(null);

  const filteredData = useMemo(() => ({
    ...mockProjects,
    features: mockProjects.features.filter((f) => {
      const p = f.properties as { status: string; type: string };
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      return true;
    }),
  }), [statusFilter, typeFilter]);

  const handleProjectClick = useCallback((properties: Record<string, unknown>) => {
    setSelectedProject(properties);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Floating top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex flex-col gap-2 p-3">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-md">
          <i className="bi bi-search text-sm text-gray-400" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            placeholder="Search barangay, city, or road name…"
          />
        </div>

        {/* Filter chips */}
        <FilterChips
          status={statusFilter}
          type={typeFilter}
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
        />
      </div>

      {/* Full-screen map */}
      <MapView data={filteredData} onProjectClick={handleProjectClick} />

      {/* Project detail sidebar */}
      <ProjectSidebar
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
