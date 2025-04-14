
import { CampaignData } from "@/types/metrics";
import { toast } from "@/hooks/use-toast";

export const useFileHandler = (processAndSaveData: (data: Record<string, any>[]) => Promise<void>) => {
  const handleFileUpload = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const firstLine = rows[0];
        const delimiter = firstLine.includes(',') ? ',' : ';';
        const headers = firstLine.split(delimiter);

        // Fixed the duplicate property keys by removing duplicates
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
          'Day': 'day',
          // Portuguese headers - no duplicates with English headers
          'Nome da campanha': 'campaign_name',
          'Nome do conjunto de anúncios': 'ad_set_name',
          'Nome do anúncio': 'ad_name',
          'Valor gasto (BRL)': 'amount_spent',
          'Alcance': 'reach',
          'Impressões': 'impressions',
          'CPM (Custo por 1.000 impressões) (BRL)': 'cpm',
          'Conversas de mensagem iniciadas': 'conversations',
          'Cliques no link': 'link_clicks',
          'Visualizações de página de destino': 'landing_page_views',
          'Dia': 'day'
        };

        const parsedData: CampaignData[] = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;

          const values = rows[i].split(delimiter);
          const rowData: any = {};

          headers.forEach((header, index) => {
            const cleanHeader = header.trim();
            const key = headerMap[cleanHeader] || cleanHeader;
            let value: any = values[index]?.trim() || '';

            if (['amount_spent', 'reach', 'impressions', 'cpm', 'conversations', 'link_clicks', 'landing_page_views', 'leads'].includes(key)) {
              value = parseFloat(value) || 0;
            }

            rowData[key] = value;
          });

          parsedData.push(rowData as CampaignData);
        }

        if (parsedData.length > 0) {
          processAndSaveData(parsedData);
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast({
          title: "Erro ao processar arquivo",
          description: "O formato do arquivo não é compatível.",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive",
      });
    };
    
    reader.readAsText(file);
  };

  return { handleFileUpload };
};
