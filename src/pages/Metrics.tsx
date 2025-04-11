import { useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, Users, MousePointerClick, ClipboardList, 
  AreaChart, BarChart, Upload, Calendar, Search, ArrowUpDown, Download 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

export default function Metrics() {
  const [csvData, setCsvData] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        const headerMap: Record<string, string> = {
          'Campaign Name': 'campaign_name',
          'Ad Set Name': 'ad_set_name',
          'Ad Name': 'ad_name',
          'Amount Spent (BRL)': 'amount_spent',
          'Reach': 'reach',
          'Impressions': 'impressions',
          'CPM (Cost per 1,000 Impressions) (BRL)': 'cpm',
          'Messaging Conversations Started': 'conversations',
          'Link Clicks': 'link_clicks',
          'Landing Page Views': 'landing_page_views',
          'Leads': 'leads',
          'Day': 'day'
        };

        const parsedData: CampaignData[] = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          const values = rows[i].split(',');
          const rowData: any = {};
          
          headers.forEach((header, index) => {
            const key = headerMap[header.trim()] || header.trim();
            let value: any = values[index]?.trim() || '';
            
            if (['amount_spent', 'reach', 'impressions', 'cpm', 'conversations', 'link_clicks', 'landing_page_views', 'leads'].includes(key)) {
              value = parseFloat(value) || 0;
            }
            
            rowData[key] = value;
          });
          
          parsedData.push(rowData as CampaignData);
        }

        setCsvData(parsedData);
        setHasFile(true);
        toast({
          title: "Arquivo importado com sucesso",
          description: `${parsedData.length} registros de campanhas carregados.`,
        });
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast({
          title: "Erro ao processar arquivo",
          description: "O formato do arquivo não é compatível.",
          variant: "destructive",
        });
      }

      setIsLoading(false);
    };

    reader.onerror = () => {
      setIsLoading(false);
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
  };

  const totalInvestment = csvData.reduce((sum, item) => sum + item.amount_spent, 0);
  const totalReach = csvData.reduce((sum, item) => sum + item.reach, 0);
  const totalClicks = csvData.reduce((sum, item) => sum + item.link_clicks, 0);
  const totalLeads = csvData.reduce((sum, item) => sum + item.leads, 0);
  const averageCTR = totalReach > 0 ? (totalClicks / totalReach) * 100 : 0;
  const averageCPC = totalClicks > 0 ? totalInvestment / totalClicks : 0;

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

  const uniqueDates = Array.from(new Set(csvData.map(item => item.day))).sort();

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <Header title="Métricas Gerais">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden md:flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            11 de abril de 2025
          </Button>
          <Button>Atualizar</Button>
        </div>
      </Header>

      {!hasFile ? (
        <Card className="p-8 bg-white border border-gray-200 text-center">
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Importe seus dados de campanhas</h3>
            <p className="text-gray-500">
              Para visualizar suas métricas, faça o upload de um arquivo CSV com os dados das suas campanhas publicitárias.
            </p>
            
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 mt-6 mx-auto max-w-md">
              <div className="flex flex-col items-center justify-center gap-4">
                <Upload className="h-10 w-10 text-gray-300" />
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Arraste e solte seu arquivo CSV aqui ou
                  </p>
                  <p className="text-sm text-gray-500">
                    Clique para selecionar
                  </p>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  {isLoading ? "Processando..." : "Selecionar arquivo"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MetricCard 
              title="Investimento Total" 
              value={`R$ ${totalInvestment.toFixed(2)}`} 
              icon={<DollarSign className="h-5 w-5 text-blue-500" />} 
            />
            
            <MetricCard 
              title="Alcance" 
              value={totalReach.toLocaleString()} 
              icon={<Users className="h-5 w-5 text-purple-500" />} 
            />
            
            <MetricCard 
              title="Cliques" 
              value={totalClicks.toLocaleString()} 
              icon={<MousePointerClick className="h-5 w-5 text-green-500" />} 
            />
            
            <MetricCard 
              title="Leads" 
              value={totalLeads.toLocaleString()} 
              icon={<ClipboardList className="h-5 w-5 text-yellow-500" />} 
            />
            
            <MetricCard 
              title="CTR" 
              value={`${averageCTR.toFixed(2)}%`} 
              icon={<AreaChart className="h-5 w-5 text-pink-500" />} 
            />
            
            <MetricCard 
              title="CPC" 
              value={`R$ ${averageCPC.toFixed(2)}`} 
              icon={<BarChart className="h-5 w-5 text-indigo-500" />} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="col-span-1 p-6 bg-white">
              <h3 className="text-lg font-medium mb-4">Métricas de Custo</h3>
              <div className="space-y-6">
                <MetricGauge 
                  title="CPM" 
                  value={(csvData.reduce((sum, item) => sum + item.cpm, 0) / csvData.length).toFixed(1)}
                  unit="R$"
                  min="0"
                  max="30"
                />
                <MetricGauge 
                  title="CPC" 
                  value={averageCPC.toFixed(2)}
                  unit="R$"
                  min="0"
                  max="5"
                />
                <MetricGauge 
                  title="CTR" 
                  value={averageCTR.toFixed(1)}
                  unit="%"
                  min="0"
                  max="2"
                />
              </div>
            </Card>
            
            <Card className="col-span-1 p-6 bg-white">
              <h3 className="text-lg font-medium mb-4">Funil de Conversão</h3>
              <div className="space-y-2 mt-6">
                <FunnelStep 
                  label="Alcance" 
                  value={totalReach} 
                  color="bg-emerald-500" 
                  percent={100} 
                />
                <FunnelStep 
                  label="Cliques" 
                  value={totalClicks} 
                  color="bg-blue-500" 
                  percent={totalReach > 0 ? (totalClicks / totalReach) * 100 : 0} 
                />
                <FunnelStep 
                  label="Leads" 
                  value={totalLeads} 
                  color="bg-yellow-500" 
                  percent={totalReach > 0 ? (totalLeads / totalReach) * 100 : 0}
                />
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
        </>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
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

interface MetricGaugeProps {
  title: string;
  value: string;
  unit: string;
  min: string;
  max: string;
}

function MetricGauge({ title, value, unit, min, max }: MetricGaugeProps) {
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

interface FunnelStepProps {
  label: string;
  value: number;
  color: string;
  percent: number;
}

function FunnelStep({ label, value, color, percent }: FunnelStepProps) {
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

interface CampaignGroupProps {
  campaign: string;
  items: CampaignData[];
}

function CampaignGroup({ campaign, items }: CampaignGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalSpent = items.reduce((sum, item) => sum + item.amount_spent, 0);
  const totalReach = items.reduce((sum, item) => sum + item.reach, 0);
  const totalImpressions = items.reduce((sum, item) => sum + item.impressions, 0);
  const totalConversations = items.reduce((sum, item) => sum + item.conversations, 0);
  const totalClicks = items.reduce((sum, item) => sum + item.link_clicks, 0);
  const totalViews = items.reduce((sum, item) => sum + item.landing_page_views, 0);
  const totalLeads = items.reduce((sum, item) => sum + item.leads, 0);

  return (
    <>
      <tr 
        className="border-b hover:bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
              {isExpanded ? (
                <ArrowUpDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </Button>
            <span className="font-medium">{campaign}</span>
          </div>
        </td>
        <td className="p-3">-</td>
        <td className="p-3">-</td>
        <td className="p-3 text-right">R$ {totalSpent.toFixed(2)}</td>
        <td className="p-3 text-right">{totalReach.toLocaleString()}</td>
        <td className="p-3 text-right">{totalImpressions.toLocaleString()}</td>
        <td className="p-3 text-right">{totalConversations.toLocaleString()}</td>
        <td className="p-3 text-right">{totalClicks.toLocaleString()}</td>
        <td className="p-3 text-right">{totalViews.toLocaleString()}</td>
        <td className="p-3 text-right">{totalLeads.toLocaleString()}</td>
        <td className="p-3 text-right">-</td>
      </tr>
      
      {isExpanded && items.map((item, index) => (
        <tr key={index} className="bg-gray-50 border-b">
          <td className="p-3 pl-10">{campaign}</td>
          <td className="p-3">{item.ad_set_name}</td>
          <td className="p-3">{item.ad_name}</td>
          <td className="p-3 text-right">R$ {item.amount_spent.toFixed(2)}</td>
          <td className="p-3 text-right">{item.reach.toLocaleString()}</td>
          <td className="p-3 text-right">{item.impressions.toLocaleString()}</td>
          <td className="p-3 text-right">{item.conversations.toLocaleString()}</td>
          <td className="p-3 text-right">{item.link_clicks.toLocaleString()}</td>
          <td className="p-3 text-right">{item.landing_page_views.toLocaleString()}</td>
          <td className="p-3 text-right">{item.leads.toLocaleString()}</td>
          <td className="p-3 text-right">{item.day}</td>
        </tr>
      ))}
    </>
  );
}
