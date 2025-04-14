import { useState, ChangeEvent } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import axios from 'axios';

interface FormData {
  carName: string;
  price: string;
  description: string;
  whatsappLink: string;
  dailySpend: string;
  images: File[];
  videoUrl?: string;
}

interface UseAdFormReturn {
  form: UseFormReturn<FormData>;
  imageFiles: File[];
  imagePreviews: string[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export const useAdForm = (
  setIsModalOpen: (open: boolean) => void,
  fetchAds: () => Promise<void>
) : UseAdFormReturn => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Gerar slug único via Supabase
      const res = await supabase.rpc("generate_unique_slug", {
        title: data.carName,
      });

      if (res.error) throw new Error(res.error.message);
      const slug = res.data;

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("Usuário não autenticado");

      // Upload das imagens
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

      const publicLink = `https://autolink.app/${slug}`;

      // Inserir anúncio no Supabase
      const { error: insertError } = await supabase.from("anuncios").insert({
        titulo: data.carName,
        preco: parseFloat(data.price),
        descricao: data.description,
        imagens: imageUrls,
        slug: slug,
        localizacao: "Brasil",
        user_id: userId,
        orcamento: parseFloat(data.dailySpend),
        detalhes: {
          whatsappLink: data.whatsappLink,
          publicLink: publicLink,
        },
        video_url: data.videoUrl || null,
        video_do_anuncio: data.videoUrl || null,
        status: "em-analise",
        visualizacoes: 0,
        clics_whatsapp: 0,
      });

      if (insertError) throw new Error(insertError.message);

      // ENVIO DO WEBHOOK
      try {
        console.log("Enviando webhook para Make...");

        const webhookResponse = await axios.post(
          "https://hook.us2.make.com/xyn69qyh2y57mep7njyi33ah4ka5ywry",
          {
            user_id: userId,
            bussines_name: data.carName,
            slug: slug,
            detalhes: {
              whatsappLink: data.whatsappLink,
              publicLink: publicLink,
            },
          }
        );

        console.log("Webhook enviado com sucesso:", webhookResponse.data);
      } catch (webhookError) {
        console.error("Erro ao enviar webhook para Make:", webhookError);
      }

      toast({
        title: "Anúncio criado com sucesso",
        description: "Seu anúncio foi publicado com sucesso!",
      });

      form.reset();
      setImageFiles([]);
      setImagePreviews([]);
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
      setIsModalOpen(false);
      setIsSubmitting(false);
    }
  };

  return {
    form,
    imageFiles,
    imagePreviews,
    setImageFiles,
    setImagePreviews,
    onSubmit,
    isSubmitting,
    handleImageUpload,
    removeImage,
  };
};