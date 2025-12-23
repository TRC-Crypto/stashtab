type Status = "pending" | "completed" | "failed" | "approved" | "declined" | "not_started";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500/20 text-yellow-400",
  },
  completed: {
    label: "Completed",
    className: "bg-green-500/20 text-green-400",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/20 text-red-400",
  },
  approved: {
    label: "Approved",
    className: "bg-green-500/20 text-green-400",
  },
  declined: {
    label: "Declined",
    className: "bg-red-500/20 text-red-400",
  },
  not_started: {
    label: "Not Started",
    className: "bg-zinc-500/20 text-zinc-400",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

