
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Car, DollarSign, ChevronsRight, PlusCircle, Waypoints, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Anuncio {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  status: string;
  imagens: string[];
}

export default function Dashboard() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error("Erro ao verificar sua sessão. Por favor, faça login novamente.");
      }

      if (!session?.user) {
        throw new Error("Usuário não autenticado.");
      }

      const userId = session.user.id;

      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        throw new Error("Não foi possível carregar os anúncios. Tente novamente mais tarde.");
      }

      setAnuncios(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
      setError(error.message || "Erro ao carregar os anúncios");
      
      // Apenas mostrar toast nos primeiros erros para não sobrecarregar o usuário
      if (retryCount < 2) {
        toast({
          title: "Erro ao carregar dados",
          description: error.message || "Ocorreu um erro ao carregar seus anúncios.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchData();
  };

  useEffect(() => {
    // Implementar exponential backoff nos retries para melhorar performance
    const retryWithBackoff = async () => {
      const timeout = retryCount > 0 ? Math.min(1000 * Math.pow(2, retryCount - 1), 30000) : 0;
      
      if (timeout > 0) {
        await new Promise(resolve => setTimeout(resolve, timeout));
      }
      
      fetchData();
    };
    
    retryWithBackoff();
    
    // Atualizar dados periodicamente apenas quando a aba estiver ativa
    const updateInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && !loading) {
        fetchData();
      }
    }, 5 * 60 * 1000); // Atualizar a cada 5 minutos
    
    return () => clearInterval(updateInterval);
  }, [retryCount]);

  const renderAnunciosPorStatus = (status: string | null = null) => {
    const filtrados = status ? anuncios.filter(a => a.status === status) : anuncios;

    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-5 w-1/4 mb-1" />
              <Skeleton className="h-4 w-1/3" />
            </Card>
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (filtrados.length === 0) {
      return <EmptyStateCard message="Nenhum anúncio encontrado." />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map(anuncio => (
          <Card key={anuncio.id} className="p-4">
            {/* Exibe a imagem do anúncio, se disponível */}
            {anuncio.imagens?.length > 0 ? (
              <img
                src={anuncio.imagens[0]}
                alt={anuncio.titulo}
                className="h-32 w-full object-cover rounded-md mb-4"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="h-32 w-full bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                <Car className="h-10 w-10 text-gray-400" />
              </div>
            )}
            <h3 className="text-lg font-semibold">{anuncio.titulo}</h3>
            <p className="text-gray-500 line-clamp-2">{anuncio.descricao || "Sem descrição"}</p>
            <p className="text-primary font-bold mt-2">R$ {anuncio.preco?.toLocaleString('pt-BR') || 0}</p>
            <p className="text-sm text-gray-400 mt-1">Status: {anuncio.status || "desconhecido"}</p>
          </Card>
        ))}
      </div>
    );
  };

  // Determinar o nome de usuário
  const getUserName = () => {
    try {
      const { data: { user } } = supabase.auth.getUser();
      return user?.user_metadata?.name || "usuário";
    } catch {
      return "usuário";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Header title={`Bem-vindo, ${getUserName()}!`} />

      <div className="text-gray-600">
        Aqui está o resumo dos seus anúncios de veículos
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Anúncios Ativos"
          value={loading ? "..." : anuncios.length.toString()}
          subtitle="Total de veículos anunciados"
          icon={<Car className="h-6 w-6 text-primary" />}
          loading={loading}
        />
        <MetricCard
          title="Gasto Total/Dia"
          value="R$ 0,00"
          subtitle="Investimento diário em anúncios"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          loading={loading}
        />
        <MetricCard
          title="Total de Cliques"
          value="0"
          subtitle="Interações via WhatsApp"
          icon={<Waypoints className="h-6 w-6 text-primary" />}
          loading={loading}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Seus Anúncios</h2>
        <div className="flex gap-2">
          <Link to="/anuncios/novo">
            <Button className="text-white flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Novo anúncio
            </Button>
          </Link>
          <Link to="/anuncios">
            <Button variant="ghost" className="text-primary flex items-center gap-1">
              Ver todos
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
          <TabsTrigger value="pausados">Pausados</TabsTrigger>
          <TabsTrigger value="em-analise">Em Análise</TabsTrigger>
          <TabsTrigger value="deletados">Deletados</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-4">
          {renderAnunciosPorStatus()}
        </TabsContent>
        <TabsContent value="aprovados" className="mt-4">
          {renderAnunciosPorStatus("aprovado")}
        </TabsContent>
        <TabsContent value="pausados" className="mt-4">
          {renderAnunciosPorStatus("pausado")}
        </TabsContent>
        <TabsContent value="em-analise" className="mt-4">
          {renderAnunciosPorStatus("em-analise")}
        </TabsContent>
        <TabsContent value="deletados" className="mt-4">
          {renderAnunciosPorStatus("deletado")}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ----------------- COMPONENTES AUXILIARES -----------------

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function MetricCard({ title, value, subtitle, icon, loading = false }: MetricCardProps) {
  return (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-semibold mt-1">{value}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-full">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function EmptyStateCard({ message }: { message: string }) {
  return (
    <Card className="p-8 bg-white border border-gray-200 text-center">
      <p className="text-gray-500">{message}</p>
      <Link to="/anuncios/novo" className="mt-4 inline-block">
        <Button className="mt-2">
          <PlusCircle className="h-4 w-4 mr-2" />
          Criar anúncio
        </Button>
      </Link>
    </Card>
  );
}
