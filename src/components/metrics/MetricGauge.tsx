
interface MetricGaugeProps {
  title: string;
  value: string;
  unit: string;
  min: string;
  max: string;
}

export function MetricGauge({ title, value, unit, min, max }: MetricGaugeProps) {
  const valueNum = parseFloat(value);
  const maxNum = parseFloat(max);
  const percentValue = (valueNum / maxNum) * 100;
  const clampedPercent = Math.min(100, Math.max(0, percentValue));
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-sm">{title}</span>
        <span className="text-xl font-semibold">{unit}{value}</span>
      </div>
      <div className="h-8 bg-gray-100 rounded-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-300 rounded-full"
          style={{
            clipPath: `polygon(0 0, ${clampedPercent}% 0, ${clampedPercent}% 100%, 0 100%)`,
          }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{unit}{min}</span>
        <span>{unit}{max}</span>
      </div>
    </div>
  );
}
