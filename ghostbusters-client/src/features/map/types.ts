export type ProjectStatus = "on_track" | "delayed" | "completed";
export type ProjectType = "road" | "bridge" | "flood_control" | "building";

export interface ProjectImage {
  url: string;
  takenAt: string;
  source: "dpwh" | "citizen";
  caption?: string;
}

export type ProjectDocumentType = "advertisement" | "contract" | "notice_of_award" | "notice_to_proceed";

export interface ProjectDocument {
  type: ProjectDocumentType;
  url: string;
}

export interface ProjectComponent {
  id: string;
  description: string;
  type: string;
  work: string;
  coordinates: [number, number];
}

export interface VariationOrder {
  id: string;
  type: "change_order" | "extra_work_order" | "suspension_order";
  description: string;
  amount: number;       // positive = cost increase, negative = reduction
  status: "pending" | "approved" | "rejected";
  issuedDate: string;
  approvedDate?: string;
}

export interface Project {
  // Identity
  id: string;
  contractId: string;

  // What it is
  title: string;
  contractName: string;
  type: ProjectType;
  infrastructureType: string;
  program?: string;
  department: string;

  // Where (flat — GeoJSON properties must be flat)
  coordinates: [number, number];
  barangay?: string;
  city?: string;
  province: string;
  region: string;

  // Status
  status: ProjectStatus;
  statusCode?: string;
  progress: number;

  // Money
  abc: number;
  cost: number;
  revisedCost?: number;
  fundingSource: string;
  fundingInstrument?: string;
  variationOrders?: VariationOrder[];

  // Contractor
  contractor: string;
  contractorId?: string;

  // Dates
  advertisementDate?: string;
  bidDeadline?: string;
  awardDate?: string;
  startDate: string;
  targetDate: string;
  endDate?: string;
  infrastructureYear: number;

  // Media
  images: ProjectImage[];
  biddingVideoUrl?: string;
  documents: ProjectDocument[];

  // Citizen layer
  verificationStatus: "unverified" | "verified" | "disputed";
  rating?: number;
  reportCount: number;
  openReportCount: number;

  // Sub-components (optional — most projects have one)
  components?: ProjectComponent[];
}

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  on_track: "On Track",
  delayed: "Delayed",
  completed: "Completed",
};

export const TYPE_LABEL: Record<ProjectType, string> = {
  road: "Road",
  bridge: "Bridge",
  flood_control: "Flood Control",
  building: "Building",
};

export const STATUS_CSS_VAR: Record<ProjectStatus, string> = {
  on_track: "var(--color-support-blue)",
  delayed: "var(--color-support-orange)",
  completed: "var(--color-support-green)",
};

export const STATUS_CSS_VAR_LIGHT: Record<ProjectStatus, string> = {
  on_track: "var(--color-support-blue-light)",
  delayed: "var(--color-support-yellow-light)",
  completed: "var(--color-support-green-light)",
};

// MapLibre GL paint properties are JavaScript — CSS vars can't be used there.
// These are the resolved hex equivalents of the support colors.
export const STATUS_HEX: Record<ProjectStatus, string> = {
  on_track:  "#155DFC", // --color-support-blue  (Blue-600)
  delayed:   "#FF8904", // --color-support-orange (Orange-400)
  completed: "#00C951", // --color-support-green  (Green-400)
};
export const REPORT_HEX = "#E7000B"; // --color-support-red (Red-600)
