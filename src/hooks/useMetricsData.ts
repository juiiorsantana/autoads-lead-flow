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
      setCsvData(data as CampaignData[]);
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

      const dataWithUserId = data.map(item => ({
        ...item,
        user_id: user.id
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
