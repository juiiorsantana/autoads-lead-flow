
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CampaignData } from "@/types/metrics";

export const useMetricsData = () => {
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
      // Map the database fields to our type, handling the field name discrepancy
      const mappedData: CampaignData[] = data.map(item => ({
        campaign_name: item.campaign_name || '',
        ad_set_name: item.ad_set_name || '',
        ad_name: item.ad_name || '',
        amount_spent: item.amount_spent || 0,
        reach: item.reach || 0,
        impressions: item.impressions || 0,
        cpm: item.cpm || 0,
        conversations: item.messaging_conversations || 0, // Corrected field name
        link_clicks: item.link_clicks || 0,
        landing_page_views: item.landing_page_views || 0,
        leads: item.leads || 0,
        day: item.day || ''
      }));
      
      setCsvData(mappedData);
      setHasFile(data && data.length > 0);
    }
  };

  const processAndSaveData = async (data: Record<string, any>[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar autenticado para salvar dados.",
          variant: "destructive"
        });
        return;
      }

      // Prepare data for the database, ensuring all required fields are present
      const dataWithUserId = data.map(item => ({
        ...item,
        user_id: user.id,
        // Make sure field name matches the database schema
        messaging_conversations: item.conversations || 0
      }));

      const { error } = await supabase
        .from('campaign_metrics')
        .insert(dataWithUserId);

      if (error) throw error;

      toast({
        title: "Dados importados com sucesso",
        description: `${data.length} registros foram salvos.`
      });
      
      fetchMetrics();
    } catch (error: any) {
      console.error("Error saving data:", error);
      toast({
        title: "Erro ao salvar dados",
        description: error.message || "Ocorreu um erro ao salvar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMetrics = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from('campaign_metrics')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCsvData(null);
      setHasFile(false);
    } catch (error: any) {
      console.error("Error clearing metrics:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    csvData,
    isLoading,
    hasFile,
    fetchMetrics,
    processAndSaveData,
    setCsvData,
    setHasFile,
    setIsLoading,
    clearMetrics
  };
};
