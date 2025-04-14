
import { Card } from "@/components/ui/card";
import { MetricsUploadDialog } from "./MetricsUploadDialog";
import { PlaceholderMetrics } from "./PlaceholderMetrics";

interface EmptyMetricsStateProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function EmptyMetricsState({ onUpload, isLoading }: EmptyMetricsStateProps) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Prévia de métricas</h2>
        <PlaceholderMetrics />
        <div className="flex justify-center mt-6">
          <MetricsUploadDialog onUpload={onUpload} isLoading={isLoading} />
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
  );
}
