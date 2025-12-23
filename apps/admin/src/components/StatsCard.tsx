interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
}: StatsCardProps) {
  const changeColors = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-zinc-400",
  };

  return (
    <div className="bg-surface-100 rounded-xl p-6 border border-surface-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400 mb-1">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${changeColors[changeType]}`}>
              {changeType === "positive" && "↑ "}
              {changeType === "negative" && "↓ "}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-surface-200 rounded-lg text-zinc-400">{icon}</div>
        )}
      </div>
    </div>
  );
}

