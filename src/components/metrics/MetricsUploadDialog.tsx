
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Upload, Table, Lock } from "lucide-react";

interface MetricsUploadDialogProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function MetricsUploadDialog({ onUpload, isLoading }: MetricsUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Dados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar dados de métricas</DialogTitle>
          <DialogDescription>
            Escolha o método de importação para suas métricas de campanhas
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="csv" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv">Arquivo CSV</TabsTrigger>
            <TabsTrigger value="sheets" disabled>Google Sheets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv" className="mt-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
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
                  onChange={handleFileSelection}
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
          </TabsContent>
          
          <TabsContent value="sheets" className="mt-4">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
              <div className="flex flex-col items-center justify-center gap-4">
                <Lock className="h-10 w-10 text-gray-300" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Recurso em desenvolvimento
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    A integração com o Google Sheets estará disponível em breve.
                  </p>
                </div>
                <Input
                  type="text"
                  placeholder="ID da planilha"
                  disabled
                  className="max-w-xs"
                />
                <Button disabled>
                  Conectar Planilha
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
