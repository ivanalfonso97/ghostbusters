import { STATUS_CSS_VAR, STATUS_LABEL, TYPE_LABEL } from "@/features/map/types";
import type { ProjectStatus, ProjectType } from "@/features/map/types";

interface SidebarProject {
  id: string;
  contractId: string;
  title: string;
  type: ProjectType;
  status: ProjectStatus;
  progress: number;
  department: string;
  barangay?: string;
  city?: string;
  province: string;
  region: string;
  contractor: string;
  abc: number;
  cost: number;
  revisedCost?: number;
  fundingSource: string;
  startDate: string;
  targetDate: string;
  endDate?: string;
  infrastructureYear: number;
  verificationStatus: string;
  rating?: number;
  reportCount: number;
  openReportCount: number;
}

interface ProjectSidebarProps {
  project: Record<string, unknown> | null;
  onClose: () => void;
}

function formatPHP(amount: number): string {
  if (amount >= 1_000_000_000) return `₱${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(2)}M`;
  return `₱${amount.toLocaleString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export function ProjectSidebar({ project, onClose }: ProjectSidebarProps) {
  const p = project as unknown as SidebarProject | null;

  return (
    <div
      className={`absolute left-0 top-0 z-20 h-full w-80 overflow-y-auto bg-white shadow-xl transition-transform duration-300 ${
        p ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {p && (
        <>
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-2 border-b border-gray-100 bg-white p-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">{p.contractId}</p>
              <h2 className="mt-0.5 text-sm font-semibold leading-snug text-gray-900 line-clamp-3">
                {p.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <i className="bi bi-x-lg text-sm" />
            </button>
          </div>

          <div className="flex flex-col gap-5 p-4">
            {/* Status + type */}
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: STATUS_CSS_VAR[p.status] }}
              >
                {STATUS_LABEL[p.status]}
              </span>
              <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-500">
                {TYPE_LABEL[p.type]}
              </span>
            </div>

            {/* Progress */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-semibold text-gray-800">{p.progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${p.progress}%`,
                    backgroundColor: STATUS_CSS_VAR[p.status],
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Location</p>
              <p className="text-sm text-gray-700">
                {[p.barangay, p.city, p.province].filter(Boolean).join(", ")}
              </p>
              <p className="text-xs text-gray-400">{p.region}</p>
            </div>

            {/* Cost */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Budget</p>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ABC</span>
                  <span className="font-medium text-gray-800">{formatPHP(p.abc)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Awarded</span>
                  <span className="font-medium text-gray-800">{formatPHP(p.cost)}</span>
                </div>
                {p.revisedCost && p.revisedCost !== p.cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Revised</span>
                    <span className="font-medium" style={{ color: "var(--color-support-orange)" }}>
                      {formatPHP(p.revisedCost)}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-xs text-gray-400">{p.fundingSource}</p>
            </div>

            {/* Contractor */}
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Contractor</p>
              <p className="text-sm text-gray-700">{p.contractor}</p>
              <p className="text-xs text-gray-400">{p.department}</p>
            </div>

            {/* Timeline */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Timeline</p>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Started</span>
                  <span className="text-gray-800">{formatDate(p.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Target</span>
                  <span className="text-gray-800">{formatDate(p.targetDate)}</span>
                </div>
                {p.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed</span>
                    <span style={{ color: "var(--color-support-green)" }}>{formatDate(p.endDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reports + rating */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-lg font-bold text-gray-800">{p.reportCount}</p>
                <p className="text-xs text-gray-400">Reports</p>
                {p.openReportCount > 0 && (
                  <p className="mt-0.5 text-xs" style={{ color: "var(--color-support-red)" }}>
                    {p.openReportCount} open
                  </p>
                )}
              </div>
              {p.rating != null && (
                <div className="flex-1 rounded-xl border border-gray-100 p-3 text-center">
                  <p className="text-lg font-bold text-gray-800">{p.rating.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">Rating</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pb-2">
              <button
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-support-red)" }}
              >
                <i className="bi bi-flag" />
                Report a problem
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400">
                <i className="bi bi-bell" />
                Follow this project
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
