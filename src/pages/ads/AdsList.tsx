import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // certifique-se de que esse caminho está certo

export default function AdsList() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAds() {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar anúncios:", error);
      } else {
        setAds(data || []);
      }
      setLoading(false);
    }

    fetchAds();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Header title="Meus Anúncios">
        <Link to="/anuncios/novo">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Novo Anúncio
          </Button>
        </Link>
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
              <AdsListGrid ads={filterAdsByStatus(ads, status)} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function filterAdsByStatus(ads: any[], status: string) {
  if (status === "todos") return ads;
  if (status === "em-analise") return ads.filter((ad) => ad.status === "em análise");
  return ads.filter((ad) => ad.status === status);
}

function AdsListGrid({ ads }: { ads: any[] }) {
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
          <div className="p-4 space-y-2">
            <h4 className="text-lg font-semibold text-gray-900">{ad.titulo}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{ad.descricao}</p>
            <p className="text-xs text-gray-500">Status: <strong>{ad.status}</strong></p>

            <div className="flex gap-2 mt-3">
              <Link to={`/anuncios/editar/${ad.id}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>

              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => console.log("Excluir anúncio", ad.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="p-8 bg-white border border-gray-200 text-center">
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Nenhum anúncio encontrado</h3>
        <p className="text-gray-500">Você ainda não tem nenhum anúncio cadastrado.</p>
        <p className="text-center text-gray-600 mt-4">
          Comece a anunciar seus veículos e atraia mais clientes!
        </p>

        <div className="flex justify-center mt-4">
          <Link to="/anuncios/novo">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Criar meu primeiro anúncio
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
