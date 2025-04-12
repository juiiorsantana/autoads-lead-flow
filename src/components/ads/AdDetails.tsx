import { Eye, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
interface AdDetailsProps {
  ad: any;
  onWhatsAppClick: () => void;
}
export function AdDetails({
  ad,
  onWhatsAppClick
}: AdDetailsProps) {
  return <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{ad.titulo}</h1>
      <p className="text-3xl font-bold text-primary">{formatPrice(ad.preco)}</p>
      
      <div className="py-4 border-t border-b">
        <p className="text-gray-700 whitespace-pre-line">{ad.descricao}</p>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <Eye className="h-4 w-4 mr-1" />
          <span>{ad.visualizacoes || 0} visualizações</span>
        </div>
        <div className="flex items-center">
          <MessageCircle className="h-4 w-4 mr-1" />
          <span>{ad.clics_whatsapp || 0} contatos</span>
        </div>
      </div>

      {/* Link Público */}
      

      {/* WhatsApp button */}
      <Button className="w-full py-6 text-lg gap-2 bg-green-500 hover:bg-green-600 rounded-full animate-pulse" onClick={onWhatsAppClick}>
        <MessageCircle className="h-5 w-5" />
        Conversar pelo WhatsApp
      </Button>
    </div>;
}