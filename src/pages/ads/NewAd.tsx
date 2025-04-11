
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Car, X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm, Controller } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface FormData {
  carName: string;
  price: string;
  description: string;
  whatsappLink: string;
  dailySpend: string;
  images: File[];
  videoUrl?: string;
}

export default function NewAd() {
  const navigate = useNavigate();
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newFilesList = [...imageFiles, ...newFiles];
      setImageFiles(newFilesList);
      
      // Generate previews for new files
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    
    // Release the URL object
    URL.revokeObjectURL(newPreviews[index]);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Cleanup URL objects on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Check for required data
      if (imageFiles.length === 0) {
        toast({
          title: "Erro ao criar anúncio",
          description: "Adicione pelo menos uma imagem para o anúncio."
        });
        setIsSubmitting(false);
        return;
      }

      // Step 1: Create slug from car name
      const res = await supabase.rpc('generate_unique_slug', { 
        title: data.carName 
      });
      
      if (res.error) throw new Error(res.error.message);
      const slug = res.data;

      // Step 2: Upload images to storage
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("Usuário não autenticado");

      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${userId}/${slug}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('anuncios')
          .upload(filePath, file);
        
        if (uploadError) throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
        
        const { data: urlData } = supabase.storage
          .from('anuncios')
          .getPublicUrl(filePath);
          
        imageUrls.push(urlData.publicUrl);
      }

      // Step 3: Create the ad record in database
      const { error: insertError } = await supabase
        .from('anuncios')
        .insert({
          titulo: data.carName,
          preco: parseFloat(data.price),
          descricao: data.description,
          imagens: imageUrls,
          slug: slug,
          localizacao: "Brasil", // Default or get from user profile
          user_id: userId,
          orcamento: parseFloat(data.dailySpend),
          detalhes: { whatsappLink: data.whatsappLink },
          video_url: data.videoUrl || null
        });
      
      if (insertError) throw new Error(insertError.message);

      toast({
        title: "Anúncio criado com sucesso",
        description: "Seu anúncio foi enviado para análise e será publicado em breve."
      });
      
      navigate("/anuncios");
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
      toast({
        title: "Erro ao criar anúncio",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar o anúncio."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <Header title="Novo Anúncio">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </Header>

      <Card className="bg-white p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="md:col-span-2">
              <div className="mb-4">
                <Label>Imagens do veículo</Label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={src} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                      >
                        <X className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Plus className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Adicionar foto</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Adicione até 10 fotos do veículo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="carName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do carro</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Honda Civic EXL 2020" 
                        {...field} 
                      />
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
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 75990" 
                        {...field} 
                      />
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
                      <Input 
                        placeholder="Ex: 5511999999999" 
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">Apenas números, com código do país e DDD</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dailySpend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gasto diário</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 50" 
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">Valor em R$ para investimento diário</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do vídeo (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: https://youtube.com/watch?v=..." 
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">Link do YouTube ou outra plataforma de vídeo</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o veículo, suas características, estado de conservação, etc." 
                      rows={4} 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando anúncio..." : "Criar anúncio"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
