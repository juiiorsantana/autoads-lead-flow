import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, MapPin, Eye, ArrowLeft, Share2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

export default function PublicAd() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [viewCount, setViewCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [sellerAds, setSellerAds] = useState<any[]>([]);

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
          
          // Fetch other ads from same seller
          const { data: otherAds } = await supabase
            .from('anuncios')
            .select('id, titulo, preco, imagens, slug')
            .eq('user_id', adData.user_id)
            .neq('id', adData.id)
            .limit(4);
          
          if (otherAds) {
            setSellerAds(otherAds);
          }
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
          url: shareUrl,
        });
        toast({
          title: "Link compartilhado",
          description: "Obrigado por compartilhar este anúncio!",
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
          description: "Link do anúncio copiado para a área de transferência.",
        });
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
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

      <div className="container max-w-lg mx-auto p-0 md:p-4">
        <Card className="overflow-hidden bg-white rounded-lg shadow-sm md:shadow border-0 md:border">
          {/* Header */}
          <div className="p-4 flex items-center border-b">
            <Avatar className="h-12 w-12">
              <AvatarImage src={seller?.avatar_url} />
              <AvatarFallback>{seller?.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1">
              <p className="font-medium text-sm">{seller?.full_name || "Usuário"}</p>
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{ad.localizacao || "Brasil"}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full h-9 w-9 p-0"
              onClick={handleShareClick}
            >
              <Share2 className="h-5 w-5" />
            </Button>
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
              <CarouselPrevious className={isMobile ? "left-2" : "-left-12"} />
              <CarouselNext className={isMobile ? "right-2" : "-right-12"} />
            </Carousel>
          </div>

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
              className="w-full py-6 text-lg gap-2 bg-green-500 hover:bg-green-600 animate-pulse" 
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="h-5 w-5" />
              Conversar pelo WhatsApp
            </Button>

            {/* Video (if provided) */}
            {ad.video_url && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-3">Vídeo do veículo</h3>
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <iframe
                    src={ad.video_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video do anúncio"
                  />
                </div>
              </div>
            )}

            {/* Other seller ads */}
            {sellerAds.length > 0 && (
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
                    onClick={() => navigate(`/vendedor/${seller.id}`)}
                  >
                    Ver todos os anúncios
                  </Button>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 text-xs text-gray-500">
              <p>© 2025 AutoAds LeadFlow</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
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
