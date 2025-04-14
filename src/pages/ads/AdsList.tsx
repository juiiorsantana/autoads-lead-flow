import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Pencil, Upload, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface FormData {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<FormData>({
    defaultValues: {
      carName: "",
      price: "",
      description: "",
      whatsappLink: "",
      dailySpend: "",
      images: [],
      videoUrl: "",
    },
  });

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

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

    const { error } = await supabase.from("anuncios").delete().eq("id", adId);

    if (error) {
      alert("Erro ao excluir o anúncio. Tente novamente.");
      console.error(error);
    } else {
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newFilesList = [...imageFiles, ...newFiles];
      setImageFiles(newFilesList);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    URL.revokeObjectURL(newPreviews[index]);

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      if (imageFiles.length === 0) {
        toast({
          title: "Erro ao criar anúncio",
          description: "Adicione pelo menos uma imagem para o anúncio.",
        });
        setIsSubmitting(false);
        return;
      }

      const res = await supabase.rpc("generate_unique_slug", {
        title: data.carName,
      });

      if (res.error) throw new Error(res.error.message);
      const slug = res.data;

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("Usuário não autenticado");

      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;
        const filePath = `${userId}/${slug}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("anuncios")
          .upload(filePath, file);

        if (uploadError)
          throw new Error(`Erro ao fazer upload: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from("anuncios")
          .getPublicUrl(filePath);

        imageUrls.push(urlData.publicUrl);
      }

      const { error: insertError } = await supabase.from("anuncios").insert({
        titulo: data.carName,
        preco: parseFloat(data.price),
        descricao: data.description,
        imagens: imageUrls,
        slug: slug,
        localizacao: "Brasil",
        user_id: userId,
        orcamento: parseFloat(data.dailySpend),
        detalhes: { whatsappLink: data.whatsappLink },
        video_url: data.videoUrl || null,
        status: "em-analise",
      });

      if (insertError) throw new Error(insertError.message);

      toast({
        title: "Anúncio criado com sucesso",
        description: "Seu anúncio foi publicado com sucesso!",
      });

      setIsModalOpen(false);
      setImageFiles([]);
      setImagePreviews([]);
      form.reset();
      fetchAds();
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
      toast({
        title: "Erro ao criar anúncio",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao criar o anúncio.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Button
                variant="ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  setImageFiles([]);
                  setImagePreviews([]);
                  form.reset();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="carName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Carro</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ford Ka 2019" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ex: 50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva o veículo..." {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsappLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 5511999999999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dailySpend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orçamento Diário (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ex: 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>Imagens do Veículo</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          Clique para fazer upload das imagens
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Pré-visualização ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do Vídeo (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: https://youtube.com/watch?v=..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      setImageFiles([]);
                      setImagePreviews([]);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Criando anúncio..." : "Criar anúncio"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
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
                  onClick={() => onDelete(ad.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
            <Link to={`/anuncios/editar/${ad.id}`} className="absolute top-2 right-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200">
                <Pencil className="w-5 h-5 text-gray-500" />
              </Button>
            </Link>
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
