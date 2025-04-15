import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Pencil, Upload, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function AdsList() {
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setLoading(true);
    const { data, error } = await supabase
      .from("anuncios")
      .select(`
        *,
        visualizacoes:visualizacoes(count),
        whatsapp_cliques:whatsapp_cliques(count)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar anúncios:", error);
    } else {
      console.log("Anúncios carregados:", data);
      setAds(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(adId: string) {
    const confirmDelete = confirm("Tem certeza que deseja excluir este anúncio?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("anuncios").delete().eq("id", adId);

      if (error) {
        toast({
          title: "Erro ao excluir anúncio",
          description: error.message,
          variant: "destructive",
        });
        console.error(error);
      } else {
        toast({
          title: "Anúncio excluído",
          description: "O anúncio foi excluído com sucesso.",
        });
        setAds((prev) => prev.filter((ad) => ad.id !== adId));
      }
    } catch (error) {
      console.error("Erro ao excluir o anúncio:", error);
      toast({
        title: "Erro ao excluir anúncio",
        description: "Ocorreu um erro inesperado ao excluir o anúncio.",
        variant: "destructive",
      });
    }
  }

  const handleCreateNewAd = () => {
    navigate('/anuncios/novo');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Header title="Meus Anúncios">
        <Button
          onClick={handleCreateNewAd}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Novo Anúncio
        </Button>
      </Header>

      <Tabs defaultValue="todos">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
          <TabsTrigger value="pausados">Pausados</TabsTrigger>
          <TabsTrigger value="em-analise">Em Análise</TabsTrigger>
          <TabsTrigger value="deletados">Deletados</TabsTrigger>
        </TabsList>

        {["todos", "aprovados", "pausados", "em-analise", "deletados"].map((status) => (
          <TabsContent key={status} value={status} className="mt-4">
            {loading ? (
              <p>Carregando anúncios...</p>
            ) : (
              <AdsListGrid ads={filterAdsByStatus(ads, status)} onDelete={handleDelete} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function normalizeStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function filterAdsByStatus(ads: any[], status: string) {
  if (status === "todos") return ads;
  const normalizedStatus = normalizeStatus(status);
  return ads.filter((ad) => normalizeStatus(ad.status) === normalizedStatus);
}

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function AdsListGrid({ 
  ads, 
  onDelete,
}: { 
  ads: any[]; 
  onDelete: (id: string) => void; 
}) {
  const navigate = useNavigate();
  
  if (ads.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ads.map((ad) => (
        <Card
          key={ad.id} 
          className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
          {ad.imagens?.[0] && (
            <img
              src={ad.imagens[0]}
              alt={ad.titulo}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="relative">
            <div className="p-4 space-y-2">
              <h4 className="text-lg font-semibold text-gray-900">{ad.titulo}</h4>
              <p className="text-md font-bold text-primary">{formatPrice(ad.preco)}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{ad.descricao}</p>
              <p className="text-xs text-gray-500">Localização: <strong>{ad.localizacao || "Não informada"}</strong></p>
              <p className="text-xs text-gray-500">Status: <strong>{ad.status}</strong></p>
              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{ad.visualizacoes?.[0]?.count || 0} visualizações</span>
                </div>
                <div className="flex items-center">
                  <span>{ad.whatsapp_cliques?.[0]?.count || 0} contatos</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 justify-end">
                <Link to={`/anuncios/publico/${ad.slug}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Anúncio Público
                  </Button>
                </Link>
                <Button variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(ad.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 rounded-full hover:bg-gray-200"
              onClick={() => navigate(`/anuncios/editar/${ad.id}`)}
            >
              <Pencil className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  
  return (
    <Card className="p-8 bg-white border border-gray-200 text-center">
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Nenhum anúncio encontrado</h3>
        <p className="text-gray-500">Você ainda não tem nenhum anúncio cadastrado.</p>
        <p className="text-center text-gray-600 mt-4">
          Comece a anunciar seus veículos e atraia mais clientes!
        </p>

        <div className="flex justify-center mt-4">
          <Button
            onClick={() => navigate('/anuncios/novo')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Criar meu primeiro anúncio
          </Button>
        </div>
      </div>
    </Card>
  );
}
