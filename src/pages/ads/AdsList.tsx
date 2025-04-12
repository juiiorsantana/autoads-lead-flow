import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdsList() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o popup
  const [titulo, setTitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [desc, setDesc] = useState('');
  const [imagem, setImagem] = useState('');
  const [local, setLocal] = useState('');

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    setLoading(true);
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

  async function handleDelete(adId: number) {
    const confirmDelete = confirm("Tem certeza que deseja excluir este anúncio?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("anuncios").delete().eq("id", adId);

    if (error) {
      alert("Erro ao excluir o anúncio. Tente novamente.");
      console.error(error);
    } else {
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Você precisa estar logado para criar um anúncio.');
      return;
    }

    const { error } = await supabase.from('anuncios').insert({
      userId: user.id,
      titulo,
      preco: parseFloat(preco),
      desc,
      imagem,
      local,
      status: 'em-análise',
    });

    if (error) {
      alert('Erro ao criar anúncio: ' + error.message);
    } else {
      alert('Anúncio criado com sucesso!');
      setIsModalOpen(false);
      setTitulo('');
      setPreco('');
      setDesc('');
      setImagem('');
      setLocal('');
      fetchAds(); // Atualiza a lista de anúncios
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Header title="Meus Anúncios">
        <Button
          onClick={() => setIsModalOpen(true)} // Abre o popup
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

      {/* Popup (Modal) para criar anúncio */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Criar Novo Anúncio</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium">
                  Título
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label htmlFor="preco" className="block text-sm font-medium">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  id="preco"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label htmlFor="desc" className="block text-sm font-medium">
                  Descrição
                </label>
                <textarea
                  id="desc"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
              </div>
              <div>
                <label htmlFor="imagem" className="block text-sm font-medium">
                  Link da Imagem
                </label>
                <input
                  type="text"
                  id="imagem"
                  value={imagem}
                  onChange={(e) => setImagem(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="local" className="block text-sm font-medium">
                  Local
                </label>
                <input
                  type="text"
                  id="local"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Salvar
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function filterAdsByStatus(ads: any[], status: string) {
  if (status === "todos") return ads;
  if (status === "em-analise") return ads.filter((ad) => ad.status === "em análise");
  return ads.filter((ad) => ad.status === status);
}

function AdsListGrid({ ads, onDelete }: { ads: any[]; onDelete: (id: number) => void }) {
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
              {/* Link para a página de edição */}
              <Link to={`/anuncios/editar/${ad.id}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>

              {/* Botão de excluir */}
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => onDelete(ad.id)}
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
          <Button
            onClick={() => setIsModalOpen(true)} // Abre o popup
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
