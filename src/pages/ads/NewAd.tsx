
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdForm } from "./components/AdForm";
import { toast } from "@/hooks/use-toast";
import { useAdForm } from "./hooks/useAdForm";

export interface FormData {
  carName: string;
  price: string;
  description: string;
  whatsappLink: string;
  dailySpend: string;
  images: File[];
  videoUrl?: string;
}

export default function AdsList() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const {
    form, imageFiles, imagePreviews, setImageFiles, setImagePreviews, onSubmit, isSubmitting, handleImageUpload, removeImage,
  } = useAdForm(setIsModalOpen, fetchAds);

  useEffect(() => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
  }, [imagePreviews]);

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

  async function handleDelete(adId: string) {
    const confirmDelete = confirm("Tem certeza que deseja excluir este anúncio?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("anuncios").delete().eq("id", adId);

    if (error) {
      alert("Erro ao excluir o anúncio. Tente novamente.");
      console.error(error);
    } else {
      setAds(prev => prev.filter(ad => ad.id !== adId));
    }
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <Header title="Meus Anúncios">
        <Button
          onClick={() => setIsModalOpen(true)}
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
              <AdsListGrid ads={filterAdsByStatus(ads, status)} onDelete={handleDelete} setIsModalOpen={setIsModalOpen} />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Criar Novo Anúncio</h2>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <AdForm
              form={form}
              imageFiles={imageFiles}
              imagePreviews={imagePreviews}
              setImageFiles={setImageFiles}
              setImagePreviews={setImagePreviews}
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
              setIsModalOpen={setIsModalOpen}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
            />
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

function AdsListGrid({ 
  ads, 
  onDelete,
  setIsModalOpen
}: { 
  ads: any[]; 
  onDelete: (id: string) => void; 
  setIsModalOpen: (isOpen: boolean) => void;
}) {
  if (ads.length === 0) {
    return <EmptyState setIsModalOpen={setIsModalOpen} />;
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

function EmptyState({ setIsModalOpen }: { setIsModalOpen: (isOpen: boolean) => void }) {
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
            onClick={() => setIsModalOpen(true)}
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