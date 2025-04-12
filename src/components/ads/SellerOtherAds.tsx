
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatters";

interface SellerOtherAdsProps {
  sellerAds: any[];
  sellerId: string;
}

export function SellerOtherAds({ sellerAds, sellerId }: SellerOtherAdsProps) {
  const navigate = useNavigate();
  
  if (sellerAds.length === 0) return null;
  
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-medium mb-3">Mais anúncios deste vendedor</h3>
      <div className="grid grid-cols-2 gap-3">
        {sellerAds.map(otherAd => (
          <div 
            key={otherAd.id}
            className="group overflow-hidden rounded-lg border cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(`/${otherAd.slug}`)}
          >
            <div className="aspect-square overflow-hidden">
              <img 
                src={otherAd.imagens[0]} 
                alt={otherAd.titulo}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-2">
              <p className="text-xs font-medium truncate">{otherAd.titulo}</p>
              <p className="text-sm font-bold text-primary">{formatPrice(otherAd.preco)}</p>
            </div>
          </div>
        ))}
      </div>
      {sellerAds.length > 3 && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3"
          onClick={() => navigate(`/vendedor/${sellerId}`)}
        >
          Ver todos os anúncios
        </Button>
      )}
    </div>
  );
}
