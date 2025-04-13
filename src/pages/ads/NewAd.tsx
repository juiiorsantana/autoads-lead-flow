import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Pencil, Upload, X, Rocket, Lock, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormData {
  carName: string;
  price: string;
  description: string;
  whatsappLink: string;
  dailySpend: string;
  images: File[];
  videoUrl?: string;
  adType: "normal" | "priority" | "professional";
}

interface AdDetails {
  whatsappLink?: string;
  publicLink?: string;
  adType?: "normal" | "priority" | "professional";
  [key: string]: any;
}

export default function NewAd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [adTypeInfo, setAdTypeInfo] = useState({
    description: "Anúncio padrão sem prioridade."
  });

  const form = useForm<FormData>({
    defaultValues: {
      carName: "",
      price: "",
      description: "",
      whatsappLink: "",
      dailySpend: "",
      images: [],
      videoUrl: "",
      adType: "normal",
    },
  });

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchAdDetails(id);
      setIsModalOpen(true);
    }
    
    fetchAds();
  }, [id]);

  useEffect(() => {
    const adType = form.watch("adType");
    updateAdTypeInfo(adType);
  }, [form.watch("adType")]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const updateAdTypeInfo = (type: string) => {
    switch(type) {
      case "normal":
        setAdTypeInfo({
          description: "Anúncio padrão sem prioridade."
        });
        break;
      case "priority":
        setAdTypeInfo({
          description: "Seu anúncio será exibido com prioridade nas listagens e buscas."
        });
        break;
      case "professional":
        setAdTypeInfo({
          description: "Recurso premium disponível em breve. Inclui destaque especial e suporte prioritário."
        });
        break;
      default:
        setAdTypeInfo({
          description: "Anúncio padrão sem prioridade."
        });
    }
  };

  const getDetailsValue = (details: any, key: string, defaultValue: any = null) => {
    if (!details) return defaultValue;
    
    if (typeof details === 'object' && !Array.isArray(details)) {
      return details[key] ?? defaultValue;
    }
    
    return defaultValue;
  };

  async function fetchAdDetails(adId: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("id", adId)
        .single();

      if (error) throw error;
      
      if (data) {
        setCurrentAd(data);
        
        const detailsObj = typeof data.detalhes === 'object' ? data.detalhes : {};
        
        form.reset({
          carName: data.titulo,
          price: data.preco.toString(),
          description: data.descricao || "",
          whatsappLink: getDetailsValue(data.detalhes, 'whatsappLink', ''),
          dailySpend: data.orcamento?.toString() || "",
          videoUrl: data.video_url || "",
          adType: getDetailsValue(data.detalhes, 'adType', 'normal') as "normal" | "priority" | "professional",
        });
        
        if (data.imagens && data.imagens.length > 0) {
          setImagePreviews(data.imagens);
        }
      }
    } catch (error) {
      console.error("Error fetching ad details:", error);
      toast({
        title: "Erro ao carregar anúncio",
        description: "Não foi possível carregar os detalhes do anúncio."
      });
    } finally {
      setLoading(false);
    }
  }

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
      setAds((prev) => prev.filter((ad) => ad.id !== adId));
      toast({
        title: "Anúncio excluído",
        description: "O anúncio foi excluído com sucesso."
      });
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
    if (isEditMode && index < (currentAd?.imagens?.length || 0)) {
      const newPreviews = [...imagePreviews];
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
      return;
    }
    
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    if (index < newPreviews.length) {
      URL.revokeObjectURL(newPreviews[index]);
    }

    const fileIndex = isEditMode 
      ? index - (currentAd?.imagens?.length || 0) 
      : index;
      
    if (fileIndex >= 0 && fileIndex < newFiles.length) {
      newFiles.splice(fileIndex, 1);
    }
    
    newPreviews.splice(index, 1);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      if (imagePreviews.length === 0) {
        toast({
          title: "Erro ao criar anúncio",
          description: "Adicione pelo menos uma imagem para o anúncio.",
        });
        setIsSubmitting(false);
        return;
      }

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("Usuário não autenticado");

      let imageUrls: string[] = [];
      let adSlug = "";

      if (isEditMode && currentAd?.imagens) {
        const remainingOldImages = currentAd.imagens.filter(
          (img: string) => imagePreviews.includes(img)
        );
        imageUrls = [...remainingOldImages];
        
        if (currentAd?.slug) {
          adSlug = currentAd.slug;
        }
      }

      if (!adSlug) {
        const res = await supabase.rpc("generate_unique_slug", {
          title: data.carName,
        });
        
        if (res.error) throw new Error(res.error.message);
        adSlug = res.data;
      }

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 15)}.${fileExt}`;
          
          const filePath = `${userId}/${adSlug}/${fileName}`;

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
      }

      const publicLink = `https://autolink.app/${adSlug}`;

      const adData = {
        titulo: data.carName,
        preco: parseFloat(data.price),
        descricao: data.description,
        imagens: imageUrls,
        user_id: userId,
        orcamento: parseFloat(data.dailySpend),
        detalhes: { 
          whatsappLink: data.whatsappLink,
          publicLink: publicLink,
          adType: data.adType
        },
        video_url: data.videoUrl || null,
        video_do_anuncio: data.videoUrl || null,
        status: "em-analise",
      };

      let result;
      
      if (isEditMode) {
        result = await supabase
          .from("anuncios")
          .update({
            ...adData,
            slug: adSlug
          })
          .eq("id", id);
      } else {
        const newAdData = {
          ...adData,
          slug: adSlug,
          localizacao: "Brasil",
          visualizacoes: 0,
          clics_whatsapp: 0
        };
        
        result = await supabase
          .from("anuncios")
          .insert(newAdData);
      }

      if (result.error) throw new Error(result.error.message);

      toast({
        title: isEditMode ? "Anúncio atualizado" : "Anúncio criado",
        description: isEditMode 
          ? "Seu anúncio foi atualizado com sucesso!" 
          : "Seu anúncio foi publicado com sucesso!",
      });

      setIsModalOpen(false);
      setImageFiles([]);
      setImagePreviews([]);
      form.reset();
      fetchAds();
      
      if (isEditMode) {
        navigate("/anuncios");
      }
    } catch (error) {
      console.error("Erro ao processar anúncio:", error);
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'criar'} anúncio`,
        description:
          error instanceof Error
            ? error.message
            : `Ocorreu um erro ao ${isEditMode ? 'atualizar' : 'criar'} o anúncio.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Header title="Meus Anúncios">
        <Button
          onClick={() => {
            setIsEditMode(false);
            setIsModalOpen(true);
            form.reset();
            setImageFiles([]);
            setImagePreviews([]);
          }}
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
              <h2 className="text-xl font-bold">
                {isEditMode ? "Editar Anúncio" : "Criar Novo Anúncio"}
              </h2>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  setImageFiles([]);
                  setImagePreviews([]);
                  form.reset();
                  if (isEditMode) {
                    navigate("/anuncios");
                  }
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="adType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Anúncio</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                            <RadioGroupItem value="normal" id="normal" />
                            <div className="flex-1">
                              <Label htmlFor="normal" className="flex items-center text-base font-medium">
                                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                                Anunciar Normal
                              </Label>
                              <p className="text-sm text-gray-500 ml-7">
                                Visibilidade padrão no site.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                            <RadioGroupItem value="priority" id="priority" />
                            <div className="flex-1">
                              <Label htmlFor="priority" className="flex items-center text-base font-medium">
                                <Rocket className="h-5 w-5 mr-2 text-blue-500" />
                                Anunciar com Prioridade
                              </Label>
                              <p className="text-sm text-gray-500 ml-7">
                                Seu anúncio ficará em destaque nas buscas.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-75">
                            <RadioGroupItem value="professional" id="professional" disabled />
                            <div className="flex-1">
                              <Label htmlFor="professional" className="flex items-center text-base font-medium">
                                <Lock className="h-5 w-5 mr-2 text-gray-500" />
                                Anunciar com Profissional <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-2">Em breve</span>
                              </Label>
                              <p className="text-sm text-gray-500 ml-7">
                                Recurso premium disponível em breve.
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <p className="text-sm text-gray-500 italic">{adTypeInfo.description}</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <FormLabel>Número do WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 5511999999999 (apenas números)" {...field} />
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
                      if (isEditMode) {
                        navigate("/anuncios");
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? "Atualizando..." : "Criando..."}
                      </>
                    ) : (
                      isEditMode ? "Atualizar anúncio" : "Criar anúncio"
                    )}
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

function filterAdsByStatus(ads: any[], status: string) {
  if (status === "todos") return ads;
  if (status === "em-analise") return ads.filter((ad) => ad.status === "em-analise");
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
  const navigate = useNavigate();
  
  const handleEdit = (adId: string) => {
    navigate(`/anuncios/editar/${adId}`);
  };
  
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
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleEdit(ad.id)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>

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
