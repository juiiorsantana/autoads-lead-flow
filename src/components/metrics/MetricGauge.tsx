
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MetricGaugeProps {
  title: string;
  subtitle?: string; // Make subtitle optional
  value: string;
  unit: string;
  min: string;
  max: string;
}

export function MetricGauge({ 
  title, 
  subtitle, 
  value, 
  unit, 
  min, 
  max 
}: MetricGaugeProps) {
  const minValue = parseFloat(min);
  const maxValue = parseFloat(max);
  const currentValue = parseFloat(value);
  const progress = Math.min(((currentValue - minValue) / (maxValue - minValue)) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{title}</h4>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <span className="text-lg font-semibold">
          {unit}{value}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{unit}{min}</span>
        <span>{unit}{max}</span>
      </div>
    </div>
  );
}
