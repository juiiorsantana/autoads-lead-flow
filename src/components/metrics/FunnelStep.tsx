
interface FunnelStepProps {
  label: string;
  value?: number;
  color: string;
  percent?: number;
  isCurrency?: boolean;
}

export function FunnelStep({
  label,
  value = 0,
  color,
  percent = 0,
  isCurrency = false,
}: FunnelStepProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-medium">
          {isCurrency ? `R$ ${value}` : value.toLocaleString()}
        </span>
      </div>
      <div className="h-10 w-full bg-gray-100 rounded-md relative overflow-hidden">
        <div
          className={`h-full ${color} rounded-md transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(percent, 5))}%` }}
        ></div>
      </div>
    </div>
  );
}
