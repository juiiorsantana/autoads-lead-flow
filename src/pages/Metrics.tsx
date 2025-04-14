
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { MetricsUploadDialog } from "@/components/metrics/MetricsUploadDialog";
import { MetricsOverview } from "@/components/metrics/MetricsOverview";
import { MetricsDetails } from "@/components/metrics/MetricsDetails";
import { EmptyMetricsState } from "@/components/metrics/EmptyMetricsState";
import { useMetricsData } from "@/hooks/useMetricsData";
import { useFileHandler } from "@/hooks/useFileHandler";
import { useEffect } from "react";

export default function Metrics() {
  const {
    csvData,
    isLoading,
    hasFile,
    fetchMetrics,
    processAndSaveData,
    setIsLoading
  } = useMetricsData();

  const { handleFileUpload } = useFileHandler(processAndSaveData);

  useEffect(() => {
    fetchMetrics();
  }, []);

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
        <EmptyMetricsState onUpload={handleFileUpload} isLoading={isLoading} />
      ) : (
        <>
          {csvData && <MetricsOverview csvData={csvData} />}
          {csvData && <MetricsDetails csvData={csvData} />}
        </>
      )}
    </div>
  );
}
