export type StatusFilter = "all" | "on_track" | "delayed" | "completed";
export type TypeFilter = "all" | "road" | "bridge" | "flood_control" | "building";

const STATUS_CHIPS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "on_track", label: "On Track" },
  { value: "delayed", label: "Delayed" },
  { value: "completed", label: "Completed" },
];

const TYPE_CHIPS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "road", label: "Roads" },
  { value: "bridge", label: "Bridges" },
  { value: "flood_control", label: "Flood Control" },
  { value: "building", label: "Buildings" },
];

interface FilterChipsProps {
  status: StatusFilter;
  type: TypeFilter;
  onStatusChange: (v: StatusFilter) => void;
  onTypeChange: (v: TypeFilter) => void;
}

export function FilterChips({ status, type, onStatusChange, onTypeChange }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {STATUS_CHIPS.map((chip) => (
        <Chip
          key={chip.value}
          label={chip.label}
          active={status === chip.value}
          onClick={() => onStatusChange(chip.value)}
        />
      ))}

      <div className="h-4 w-px shrink-0 bg-gray-200" />

      {TYPE_CHIPS.map((chip) => (
        <Chip
          key={chip.value}
          label={chip.label}
          active={type === chip.value}
          onClick={() => onTypeChange(chip.value)}
        />
      ))}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition-colors ${
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
      }`}
    >
      {label}
    </button>
  );
}
