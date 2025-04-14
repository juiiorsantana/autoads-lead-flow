import { Card } from "@/components/ui/card";
import { DollarSign, Users, MousePointerClick, ClipboardList, AreaChart, BarChart } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { MetricGauge } from "./MetricGauge";
import { FunnelStep } from "./FunnelStep";
interface CampaignData {
  campaign_name: string;
  ad_set_name: string;
  ad_name: string;
  amount_spent: number;
  reach: number;
  impressions: number;
  cpm: number;
  conversations: number;
  link_clicks: number;
  landing_page_views: number;
  leads: number;
  day: string;
}
interface MetricsOverviewProps {
  csvData: CampaignData[];
}
export function MetricsOverview({
  csvData
}: MetricsOverviewProps) {
  const totalInvestment = csvData.reduce((sum, item) => sum + (item.amount_spent || 0), 0);
  const totalReach = csvData.reduce((sum, item) => sum + (item.reach || 0), 0);
  const totalClicks = csvData.reduce((sum, item) => sum + (item.link_clicks || 0), 0);
  const totalLeads = csvData.reduce((sum, item) => sum + (item.leads || 0), 0);
  const averageCTR = totalReach > 0 ? totalClicks / totalReach * 100 : 0;
  const averageCPC = totalClicks > 0 ? totalInvestment / totalClicks : 0;
  return <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Investimento Total" value={`R$ ${totalInvestment.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-blue-500" />} />
        
        <MetricCard title="Alcance" value={totalReach.toLocaleString()} icon={<Users className="h-5 w-5 text-purple-500" />} />
        
        <MetricCard title="Cliques" value={totalClicks.toLocaleString()} icon={<MousePointerClick className="h-5 w-5 text-green-500" />} />
        
        <MetricCard title="Leads" value={totalLeads.toLocaleString()} icon={<ClipboardList className="h-5 w-5 text-yellow-500" />} />
        
        <MetricCard title="CTR" value={`${averageCTR.toFixed(2)}%`} icon={<AreaChart className="h-5 w-5 text-pink-500" />} />
        
        <MetricCard title="CPC" value={`R$ ${averageCPC.toFixed(2)}`} icon={<BarChart className="h-5 w-5 text-indigo-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-1 p-6 bg-white">
          <h3 className="text-lg font-medium mb-4">Métricas de Custo</h3>
          <div className="space-y-6 mx-[24px]">
            <MetricGauge title="CPM" value={(csvData.reduce((sum, item) => sum + (item.cpm || 0), 0) / (csvData.length || 1)).toFixed(1)} unit="R$" min="0" max="30" subtitle="Custo por mil impressões" />
            <MetricGauge title="CPC" value={averageCPC.toFixed(2)} unit="R$" min="0" max="5" subtitle="Custo por clique" />
            <MetricGauge title="CTR" value={averageCTR.toFixed(1)} unit="%" min="0" max="2" subtitle="Taxa de cliques" />
          </div>
        </Card>
        
        <Card className="col-span-1 p-6 bg-white">
          <h3 className="text-lg font-medium mb-4">Funil de Conversão</h3>
          <div className="space-y-2 mt-6">
            <FunnelStep label="Alcance" value={totalReach} color="bg-emerald-500" percent={100} />
            <FunnelStep label="Cliques" value={totalClicks} color="bg-blue-500" percent={totalReach > 0 ? totalClicks / totalReach * 100 : 0} />
            <FunnelStep label="Leads" value={totalLeads} color="bg-yellow-500" percent={totalReach > 0 ? totalLeads / totalReach * 100 : 0} />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Impressões</span>
              <span>Conversões</span>
            </div>
          </div>
        </Card>
        
        <Card className="col-span-1 p-6 bg-white">
          <h3 className="text-lg font-medium mb-4">Campanhas por Leads</h3>
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-gray-400 text-sm">Gráfico de campanhas por desempenho</p>
          </div>
        </Card>
      </div>
    </>;
}