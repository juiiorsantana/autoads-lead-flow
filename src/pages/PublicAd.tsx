import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { AdCarousel } from "@/components/ads/AdCarousel";
import { AdHeader } from "@/components/ads/AdHeader";
import { AdDetails } from "@/components/ads/AdDetails";
import { AdVideo } from "@/components/ads/AdVideo";
import { SellerOtherAds } from "@/components/ads/SellerOtherAds";
export default function PublicAd() {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [sellerAds, setSellerAds] = useState<any[]>([]);
  useEffect(() => {
    const fetchAdData = async () => {
      try {
        if (!slug) {
          throw new Error("Anúncio não encontrado");
        }
        console.log("Fetching ad with slug:", slug);

        // Fetch ad data
        const {
          data: adData,
          error: adError
        } = await supabase.from('anuncios').select('*').eq('slug', slug).maybeSingle();
        if (adError) {
          console.error("Error fetching ad data:", adError);
          throw adError;
        }
        if (!adData) {
          console.error("No ad found with slug:", slug);
          throw new Error("Anúncio não encontrado");
        }
        console.log("Ad data retrieved:", adData);
        setAd(adData);

        // Register view after confirming the ad exists
        const userAgent = navigator.userAgent;
        const viewResponse = await supabase.rpc('register_view', {
          anuncio_slug: slug,
          viewer_ip: '127.0.0.1',
          // In production, you'd get the real IP from a server
          viewer_agent: userAgent
        });
        if (viewResponse.error) {
          console.error("Error registering view:", viewResponse.error);
        }

        // Fetch seller profile
        if (adData.user_id) {
          const {
            data: userData,
            error: userError
          } = await supabase.from('profiles').select('*').eq('id', adData.user_id).single();
          if (userError) {
            console.error("Error fetching seller profile:", userError);
          } else if (userData) {
            setSeller(userData);

            // Fetch other ads from same seller
            const {
              data: otherAds,
              error: otherAdsError
            } = await supabase.from('anuncios').select('id, titulo, preco, imagens, slug').eq('user_id', adData.user_id).neq('id', adData.id).limit(4);
            if (otherAdsError) {
              console.error("Error fetching other seller ads:", otherAdsError);
            } else if (otherAds) {
              setSellerAds(otherAds);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching ad:", error);
        setError(error instanceof Error ? error.message : "Erro ao carregar o anúncio");
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchAdData();
    }
  }, [slug]);
  const handleWhatsAppClick = async () => {
    try {
      if (!ad || !slug) return;

      // Register WhatsApp click
      const userAgent = navigator.userAgent;
      await supabase.rpc('register_whatsapp_click', {
        anuncio_slug: slug,
        clicker_ip: '127.0.0.1',
        // In production, you'd get the real IP
        clicker_agent: userAgent
      });

      // Get WhatsApp number from ad details
      const whatsappNumber = ad.detalhes?.whatsappLink;
      if (!whatsappNumber) throw new Error("Número do WhatsApp não encontrado");

      // Format message
      const message = `Olá! Vi seu anúncio do ${ad.titulo} por R$ ${ad.preco} no AutoLink e tenho interesse!`;
      const encodedMessage = encodeURIComponent(message);

      // Open WhatsApp
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      toast({
        title: "Erro ao abrir WhatsApp",
        description: "Não foi possível conectar com o vendedor. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  const handleShareClick = async () => {
    if (!ad) return;
    const shareUrl = window.location.href;
    const shareTitle = `${ad.titulo} - R$ ${ad.preco.toLocaleString('pt-BR')}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Confira este ${ad.titulo} à venda!`,
          url: shareUrl
        });
        toast({
          title: "Link compartilhado",
          description: "Obrigado por compartilhar este anúncio!"
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copiado!",
          description: "Link do anúncio copiado para a área de transferência."
        });
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>;
  }
  if (error || !ad) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Anúncio não encontrado</h1>
        <p className="text-gray-500 mb-6">{error || "O anúncio que você procura não existe ou foi removido."}</p>
        <Button onClick={() => navigate('/')}>Voltar para a página inicial</Button>
      </div>;
  }
  return <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Back button for mobile */}
      

      <div className="container max-w-lg mx-auto p-0 md:p-4">
        <Card className="overflow-hidden bg-white rounded-lg shadow-sm md:shadow border-0 md:border">
          {/* Header */}
          <AdHeader seller={seller} ad={ad} onShareClick={handleShareClick} />

          {/* Image carousel */}
          <AdCarousel images={ad.imagens} title={ad.titulo} />

          {/* Ad details */}
          <AdDetails ad={ad} onWhatsAppClick={handleWhatsAppClick} />

          {/* Video (if provided) */}
          <div className="p-4">
            <AdVideo videoUrl={ad.video_do_anuncio || ad.video_url} />

            {/* Other seller ads */}
            <SellerOtherAds sellerAds={sellerAds} sellerId={seller?.id} />

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 text-xs text-gray-500">
              <p>© 2025 AutoAds LeadFlow</p>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/')}>
                Ver mais anúncios
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>;
}