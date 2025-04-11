
import { Card } from "@/components/ui/card";
import { DollarSign, Users, MousePointerClick, ClipboardList, AreaChart, BarChart } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <Card className="p-4 bg-white opacity-70">
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

export function PlaceholderMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard 
        title="Investimento Total" 
        value="R$ 5.280,00" 
        icon={<DollarSign className="h-5 w-5 text-blue-500" />} 
      />
      
      <MetricCard 
        title="Alcance" 
        value="125.465" 
        icon={<Users className="h-5 w-5 text-purple-500" />} 
      />
      
      <MetricCard 
        title="Cliques" 
        value="3.215" 
        icon={<MousePointerClick className="h-5 w-5 text-green-500" />} 
      />
      
      <MetricCard 
        title="Leads" 
        value="842" 
        icon={<ClipboardList className="h-5 w-5 text-yellow-500" />} 
      />
      
      <MetricCard 
        title="CTR" 
        value="2.56%" 
        icon={<AreaChart className="h-5 w-5 text-pink-500" />} 
      />
      
      <MetricCard 
        title="CPC" 
        value="R$ 1.64" 
        icon={<BarChart className="h-5 w-5 text-indigo-500" />} 
      />
    </div>
  );
}
