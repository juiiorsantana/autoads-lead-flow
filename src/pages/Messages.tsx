
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Messages() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Header title="Mensagens" />
      
      <Card className="p-8 bg-white border border-gray-200 text-center">
        <div className="space-y-4 flex flex-col items-center">
          <div className="bg-gray-100 p-4 rounded-full">
            <MessageSquare className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium">Nenhuma mensagem ainda</h3>
          <p className="text-gray-500 max-w-md">
            Quando seus anúncios começarem a gerar interações, suas conversas vão aparecer aqui.
          </p>
        </div>
      </Card>
    </div>
  );
}
