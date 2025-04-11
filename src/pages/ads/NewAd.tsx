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
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";

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
  const { id } = useParams(); // Pega o ID do anúncio da URL
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [adData, setAdData] = useState<any | null>(null);

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

  // Carregar o anúncio para edição, se necessário
  useEffect(() => {
    if (id) {
      fetchAdData(id);
    }
  }, [id]);

  const fetchAdData = async (adId: string) => {
    try {
      const { data, error } = await supabase
        .from("anuncios")
        .select("*")
        .eq("id", adId)
        .single();

      if (error) throw new Error(error.message);

      setAdData(data);
      form.reset({
        carName: data.titulo,
        price: String(data.preco),
        description: data.descricao,
        whatsappLink: data.detalhes?.whatsappLink || "",
        dailySpend: String(data.orcamento),
        images: [],
        videoUrl: data.video_url || "",
      });

      // Carregar imagens existentes
      setImagePreviews(data.imagens);
    } catch (error) {
      console.error("Erro ao carregar anúncio:", error);
      toast({
        title: "Erro ao carregar anúncio",
        description: "Não foi possível carregar os dados do anúncio.",
      });
    }
  };

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

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      if (imageFiles.length === 0) {
        toast({
          title: "Erro ao criar/editar anúncio",
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

      if (id) {
        // Edição de anúncio existente
        const { error: updateError } = await supabase
          .from("anuncios")
          .update({
            titulo: data.carName,
            preco: parseFloat(data.price),
            descricao: data.description,
            imagens: imageUrls,
            slug: slug,
            orcamento: parseFloat(data.dailySpend),
            detalhes: { whatsappLink: data.whatsappLink },
            video_url: data.videoUrl || null,
            status: "aprovado",
          })
          .eq("id", id);

        if (updateError) throw new Error(updateError.message);

        toast({
          title: "Anúncio atualizado com sucesso",
          description: "Seu anúncio foi atualizado com sucesso!",
        });
      } else {
        // Criação de novo anúncio
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
          status: "aprovado",
        });

        if (insertError) throw new Error(insertError.message);

        toast({
          title: "Anúncio criado com sucesso",
          description: "Seu anúncio foi publicado com sucesso!",
        });
      }

      navigate("/anuncios");
    } catch (error) {
      console.error("Erro ao criar/editar anúncio:", error);
      toast({
        title: "Erro ao criar/editar anúncio",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao criar/editar o anúncio.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <Header title={id ? "Editar Anúncio" : "Novo Anúncio"}>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </Header>

      <Card className="bg-white p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Formulário de imagem, nome, preço e outros campos (igual ao anterior) */}
            {/* Apenas a lógica de exibição da página de edição e criação é que mudou */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando/Atualizando anúncio..." : id ? "Atualizar anúncio" : "Criar anúncio"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
