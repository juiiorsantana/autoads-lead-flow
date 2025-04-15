
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Upload } from "lucide-react";

interface MetricsConfigDialogProps {
  children: React.ReactNode;
  onUpload: (file: File) => void;
  onRemoveData: () => void;
  isLoading: boolean;
}

export function MetricsConfigDialog({ children, onUpload, onRemoveData, isLoading }: MetricsConfigDialogProps) {
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
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Métricas</DialogTitle>
          <DialogDescription>
            Gerencie seus dados de métricas
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar Novos Dados
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelection}
          />
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-600"
            onClick={() => {
              onRemoveData();
              setOpen(false);
            }}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover Dados Atuais
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
