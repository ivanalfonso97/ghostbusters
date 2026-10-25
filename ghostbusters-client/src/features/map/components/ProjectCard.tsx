import type { Project } from "../types";
import { STATUS_CSS_VAR, STATUS_LABEL, TYPE_LABEL } from "../types";

export function ProjectCard({ project }: { project: Project }) {
  const { title, type, status, progress, contractor, cost } = project;
  const color = STATUS_CSS_VAR[status];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
      {/* Status color bar */}
      <div className="h-1.5" style={{ background: color }} />

      <div className="p-4">
        {/* Status + type row */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color }}>
            {STATUS_LABEL[status]}
          </span>
          <span className="text-xs text-gray-400">{TYPE_LABEL[type]}</span>
        </div>

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
          {title}
        </h3>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: color }}
            />
          </div>
        </div>

        {/* Contractor + cost */}
        <p className="truncate text-xs text-gray-500">{contractor}</p>
        <p className="mt-0.5 text-xs text-gray-400">₱{(cost / 1_000_000).toFixed(1)}M</p>
      </div>
    </div>
  );
}
