
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

export function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <Card className="p-4 bg-white">
      <div className="flex items-center gap-3">
        <div className="bg-gray-50 p-2 rounded-full">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold mt-1">{value}</p>
        </div>
      </div>
    </Card>
  );
}
