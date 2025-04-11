
interface FunnelStepProps {
  label: string;
  value: number;
  color: string;
  percent: number;
}

export function FunnelStep({ label, value, color, percent }: FunnelStepProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-medium">{value.toLocaleString()}</span>
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
