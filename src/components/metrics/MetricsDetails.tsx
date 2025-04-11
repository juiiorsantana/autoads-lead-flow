
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Download } from "lucide-react";
import { CampaignGroup } from "./CampaignGroup";

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

interface MetricsDetailsProps {
  csvData: CampaignData[];
}

export function MetricsDetails({ csvData }: MetricsDetailsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const uniqueDates = Array.from(new Set(csvData.map(item => item.day))).sort();

  const filteredData = csvData.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ad_set_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ad_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = selectedDate === "" || item.day === selectedDate;
    
    return matchesSearch && matchesDate;
  });

  const campaignGroups = filteredData.reduce((groups: Record<string, CampaignData[]>, item) => {
    const campaign = item.campaign_name;
    if (!groups[campaign]) {
      groups[campaign] = [];
    }
    groups[campaign].push(item);
    return groups;
  }, {});

  return (
    <Card className="bg-white p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-lg font-medium">Resultados Detalhados</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar campanhas..."
                className="pl-9 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="w-[160px] h-10 rounded-md border border-input bg-background px-3 py-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="">Todas as datas</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
            
            <Button variant="outline">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-y">
                <th className="p-3 text-left font-medium">Campanha</th>
                <th className="p-3 text-left font-medium">Conjunto</th>
                <th className="p-3 text-left font-medium">Anúncio</th>
                <th className="p-3 text-right font-medium">Investimento</th>
                <th className="p-3 text-right font-medium">Alcance</th>
                <th className="p-3 text-right font-medium">Impressões</th>
                <th className="p-3 text-right font-medium">Conversas</th>
                <th className="p-3 text-right font-medium">Cliques</th>
                <th className="p-3 text-right font-medium">Visualizações</th>
                <th className="p-3 text-right font-medium">Leads</th>
                <th className="p-3 text-right font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(campaignGroups).map(([campaign, items], campaignIndex) => (
                <CampaignGroup 
                  key={campaignIndex}
                  campaign={campaign}
                  items={items}
                />
              ))}
              
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-4 text-center text-gray-500">
                    Nenhum dado encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
