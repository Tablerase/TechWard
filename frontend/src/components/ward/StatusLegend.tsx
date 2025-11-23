import { getProblemColor } from "@utils/problemStatus";

interface StatusLegendProps {
  className?: string;
}

const StatusLegend = ({ className }: StatusLegendProps) => {
  const statuses = [
    { key: "critical", label: "Critical" },
    { key: "serious", label: "Serious" },
    { key: "processing", label: "Processing" },
    { key: "resolved", label: "Resolved" },
    { key: "stable", label: "Stable" },
  ] as const;

  return (
    <div className={className}>
      <div className="space-y-3">
        {statuses.map((status) => (
          <div key={status.key} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getProblemColor(status.key) }}
            />
            <span className="text-sm text-foreground">{status.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusLegend;
