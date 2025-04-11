import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, MapPin, Eye, ArrowLeft } from "lucide-react";

export default function PublicAd() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [viewCount, setViewCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const fetchAdData = async () => {
      try {
        if (!slug) {
          throw new Error("Anúncio não encontrado");
        }

        // Register view
        const userAgent = navigator.userAgent;
        const viewResponse = await supabase.rpc('register_view', { 
          anuncio_slug: slug,
          viewer_ip: '127.0.0.1', // In production, you'd get the real IP from a server
          viewer_agent: userAgent
        });

        if (viewResponse.error) {
          console.error("Error registering view:", viewResponse.error);
        }

        // Fetch ad data
        const { data: adData, error: adError } = await supabase
          .from('anuncios')
          .select(`
            *,
            visualizacoes:visualizacoes(count),
            whatsapp_cliques:whatsapp_cliques(count)
          `)
          .eq('slug', slug)
          .single();

        if (adError) throw adError;
        if (!adData) throw new Error("Anúncio não encontrado");

        setAd(adData);
        
        // Get view and click counts
        setViewCount(adData.visualizacoes?.[0]?.count || 0);
        setClickCount(adData.whatsapp_cliques?.[0]?.count || 0);

        // Fetch seller profile
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', adData.user_id)
          .single();

        if (!userError && userData) {
          setSeller(userData);
        }
      } catch (error) {
        console.error("Error fetching ad:", error);
        setError(error instanceof Error ? error.message : "Erro ao carregar o anúncio");
      } finally {
        setLoading(false);
      }
    };

    fetchAdData();
  }, [slug]);

  const handleWhatsAppClick = async () => {
    try {
      if (!ad || !slug) return;

      // Register WhatsApp click
      const userAgent = navigator.userAgent;
      await supabase.rpc('register_whatsapp_click', {
        anuncio_slug: slug,
        clicker_ip: '127.0.0.1', // In production, you'd get the real IP
        clicker_agent: userAgent
      });

      // Update local click count for immediate UI feedback
      setClickCount(prev => prev + 1);

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
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Anúncio não encontrado</h1>
        <p className="text-gray-500 mb-6">{error || "O anúncio que você procura não existe ou foi removido."}</p>
        <Button onClick={() => navigate('/')}>Voltar para a página inicial</Button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Back button for mobile */}
      <div className="p-4 md:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
      </div>

      <div className="container max-w-3xl mx-auto p-4">
        <Card className="overflow-hidden bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-4 flex items-center border-b">
            <Avatar className="h-12 w-12">
              <AvatarImage src={seller?.avatar_url} />
              <AvatarFallback>{seller?.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="font-medium text-sm">{seller?.full_name || "Usuário"}</p>
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{ad.localizacao || "Brasil"}</span>
              </div>
            </div>
          </div>

          {/* Image carousel */}
          <div className="bg-black">
            <Carousel className="w-full">
              <CarouselContent>
                {Array.isArray(ad.imagens) && ad.imagens.map((img: string, i: number) => (
                  <CarouselItem key={i}>
                    <div className="flex aspect-square items-center justify-center p-0">
                      <img 
                        src={img} 
                        alt={`${ad.titulo} - Imagem ${i+1}`} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          {/* Video (if provided) */}
          {ad.video_url && (
            <div className="p-4 border-t">
              <h3 className="font-medium mb-2">Vídeo</h3>
              <div className="aspect-video w-full">
                <iframe
                  src={ad.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  title="Video do anúncio"
                />
              </div>
            </div>
          )}

          {/* Ad details */}
          <div className="p-4 space-y-4">
            <h1 className="text-xl font-bold">{ad.titulo}</h1>
            <p className="text-3xl font-bold text-primary">{formatPrice(ad.preco)}</p>
            
            <div className="py-4 border-t border-b">
              <p className="text-gray-700 whitespace-pre-line">{ad.descricao}</p>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{viewCount} visualizações</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{clickCount} contatos</span>
              </div>
            </div>

            {/* WhatsApp button */}
            <Button 
              className="w-full py-6 text-lg gap-2" 
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="h-5 w-5" />
              Conversar pelo WhatsApp
            </Button>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 text-sm">
              <p className="text-gray-500">© 2025 AutoAds LeadFlow</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
              >
                Ver mais anúncios
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
