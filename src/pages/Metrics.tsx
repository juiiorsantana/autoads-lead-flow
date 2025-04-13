import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CampaignData } from "@/types/metrics";
import { MetricsUploadDialog } from "@/components/metrics/MetricsUploadDialog";
import { PlaceholderMetrics } from "@/components/metrics/PlaceholderMetrics";
import { MetricsOverview } from "@/components/metrics/MetricsOverview";
import { MetricsDetails } from "@/components/metrics/MetricsDetails";

export default function Metrics() {
  const [csvData, setCsvData] = useState<CampaignData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('campaign_metrics')
      .select('*');

    setIsLoading(false);
    if (error) {
      console.error("Error fetching metrics:", error);
      toast({
        title: "Erro ao carregar métricas",
        description: "Ocorreu um erro ao buscar os dados do banco de dados.",
        variant: "destructive",
      });
    } else {
      setCsvData(data as CampaignData[]);
      setHasFile(data && data.length > 0);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  const handleFileUpload = (file: File) => {
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');

        // Detect delimiter (comma or semicolon)
        const firstLine = rows[0];
        const delimiter = firstLine.includes(',') ? ',' : ';';

        const headers = firstLine.split(delimiter);

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

            const values = rows[i].split(delimiter);
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

        const formattedData = parsedData.map(item => {
          const formattedItem: Record<string, any> = {};
          for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
              formattedItem[key] = item[key];
            }
          }
          return formattedItem;
        });

        if (formattedData.length > 0) {
          supabase
            .from('campaign_metrics')
            .insert(formattedData)
            .then(({ data, error }) => {
              if (error) {
                console.error('Error inserting data:', Error);
                toast({
                  title: 'Erro ao salvar métricas',
                  description:
                    'Ocorreu um erro ao salvar os dados no banco de dados.',
                  variant: 'destructive',
                });
              } else {
                console.log('Data inserted successfully:', data);
                setHasFile(true);
                toast({
                  title: 'Métricas salvas com sucesso',
                  description:
                    'Os dados das métricas foram salvos no banco de dados.',
                });
                toast({
                  description:
                    'Os dados das métricas foram salvos no banco de dados.',
                });
                fetchMetrics();
              }
            })
            .catch((err) => {
              console.error('Error during insertion:', err);
              toast({
                title: 'Erro ao salvar métricas',
                description: 'Ocorreu um erro inesperado ao salvar os dados.',
                variant: 'destructive',
              });
            })
            .finally(() => setIsLoading(false));
        }
      } catch (error) {
        console.error("Error parsing CSV:", Error);
        toast({
          title: "Erro ao processar arquivo",
          description: "O formato do arquivo não é compatível.",
          variant: "destructive",
        }); 
        setIsLoading(false); // Ensure setIsLoading(false) is called in catch
      }
    };

    reader.onerror = (Error) => {
      setIsLoading(false);
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive",
      });
    };
    
    if (file) {
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <Header title="Métricas Gerais">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden md:flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            11 de abril de 2025
          </Button>
          {hasFile ? (
            <MetricsUploadDialog onUpload={handleFileUpload} isLoading={isLoading} />
          ) : (
            <Button onClick={() => {}}>Atualizar</Button>
          )}
        </div>
      </Header>

      {!hasFile ? (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Prévia de métricas</h2>
            <PlaceholderMetrics />
            <div className="flex justify-center mt-6">
              <MetricsUploadDialog onUpload={handleFileUpload} isLoading={isLoading} />
            </div>
          </div>
          
          <Card className="p-8 bg-white border border-gray-200 text-center">
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Importe seus dados de campanhas para métricas detalhadas</h3>
              <p className="text-gray-500">
                Para visualizar suas métricas completas, faça o upload de um arquivo CSV com os dados das suas campanhas publicitárias.
              </p>
            </div>
          </Card>
        </>
      ) : (
        <>
          {csvData && <MetricsOverview csvData={csvData} />}
          {csvData && <MetricsDetails csvData={csvData} />}
        </>
      )}
    </div>
  );
}
