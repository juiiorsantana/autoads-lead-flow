
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { MetricsOverview } from "@/components/metrics/MetricsOverview";
import { MetricsDetails } from "@/components/metrics/MetricsDetails";
import { EmptyMetricsState } from "@/components/metrics/EmptyMetricsState";
import { useMetricsData } from "@/hooks/useMetricsData";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function Metrics() {
  const {
    csvData,
    isLoading,
    hasFile,
    fetchMetrics,
    processAndSaveData,
    setIsLoading,
    clearMetrics,
  } = useMetricsData();

  const { handleFileUpload } = useFileHandler(processAndSaveData);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRemoveData = async () => {
    try {
      await clearMetrics();
      toast({
        title: "Dados removidos",
        description: "Todos os dados foram removidos com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover dados",
        description: "Ocorreu um erro ao tentar remover os dados.",
        variant: "destructive",
      });
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
        </div>
      </Header>

      {!hasFile ? (
        <EmptyMetricsState onUpload={handleFileUpload} isLoading={isLoading} />
      ) : (
        <>
          {csvData && (
            <MetricsOverview 
              csvData={csvData} 
              onUpload={handleFileUpload} 
              onRemoveData={handleRemoveData}
              isLoading={isLoading}
            />
          )}
          {csvData && <MetricsDetails csvData={csvData} />}
        </>
      )}
    </div>
  );
}
