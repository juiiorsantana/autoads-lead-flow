
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { notifyAdCreation } from '@/utils/webhooks';
import { Json } from '@/integrations/supabase/types';

export type AdFormData = {
  title: string;
  price: number | '';
  description: string;
  imageUrls: string[];
  userWhatsapp: string;
  publicLink: string;
  selectedAdType: 'normal' | 'priority' | 'professional';
  budget: number | '';
  videoUrl: string;
  videoAd: string;
  year: string;
};

export const useAdForm = (adId?: string | null) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    price: '',
    description: '',
    imageUrls: [],
    userWhatsapp: '',
    publicLink: '',
    selectedAdType: 'normal',
    budget: '',
    videoUrl: '',
    videoAd: '',
    year: new Date().getFullYear().toString(),
  });
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPublicLinkEnabled, setIsPublicLinkEnabled] = useState(false);
  
  const updateFormField = <K extends keyof AdFormData>(field: K, value: AdFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditMode = async (editAdId: string) => {
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('id', editAdId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          title: data.titulo,
          price: data.preco,
          description: data.descricao || '',
          imageUrls: data.imagens || [],
          userWhatsapp: data.detalhes?.whatsappLink || '',
          publicLink: data.detalhes?.publicLink || '',
          selectedAdType: (data.detalhes?.adType as 'normal' | 'priority' | 'professional') || 'normal',
          budget: data.orcamento || '',
          videoUrl: data.video_url || '',
          videoAd: data.video_do_anuncio || '',
          year: data.detalhes?.ano || new Date().getFullYear().toString(),
        });
        
        setEditMode(true);
      }
    } catch (error) {
      console.error('Error loading ad data:', error);
      toast({
        title: 'Erro ao carregar anúncio',
        description: 'Não foi possível carregar os dados do anúncio para edição.',
        variant: 'destructive',
      });
    }
  };

  const generateSlug = async (title: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .rpc('generate_unique_slug', { title });
      
      if (error) throw error;
      return data as string;
    } catch (error) {
      console.error('Error generating slug:', error);
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      return `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para publicar um anúncio.',
          variant: 'destructive',
        });
        return;
      }
      
      const adDetails: Record<string, string> = {
        whatsappLink: formData.userWhatsapp,
        publicLink: formData.publicLink,
        adType: formData.selectedAdType,
        ano: formData.year,
      };
      
      if (editMode && adId) {
        const { error, data } = await supabase
          .from('anuncios')
          .update({
            titulo: formData.title,
            preco: parseFloat(formData.price.toString()),
            descricao: formData.description,
            imagens: formData.imageUrls,
            orcamento: parseFloat(formData.budget.toString() || '0'),
            detalhes: adDetails as Json,
            video_url: formData.videoUrl,
            video_do_anuncio: formData.videoAd,
            status: 'ativo',
            updated_at: new Date().toISOString(),
          })
          .eq('id', adId)
          .select();
          
        if (error) throw error;
        
        toast({
          title: 'Anúncio atualizado',
          description: 'Seu anúncio foi atualizado com sucesso.',
        });
        
        setTimeout(() => {
          navigate('/anuncios');
        }, 2000);
      } else {
        const newSlug = await generateSlug(formData.title);
        
        const { error, data } = await supabase
          .from('anuncios')
          .insert({
            titulo: formData.title,
            preco: parseFloat(formData.price.toString()),
            descricao: formData.description,
            imagens: formData.imageUrls,
            user_id: user.id,
            orcamento: parseFloat(formData.budget.toString() || '0'),
            detalhes: adDetails as Json,
            video_url: formData.videoUrl,
            video_do_anuncio: formData.videoAd,
            status: 'ativo',
            slug: newSlug,
            localizacao: '',
            visualizacoes: 0,
            clics_whatsapp: 0,
          })
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          console.log('Calling webhook for newly created ad');
          notifyAdCreation(data[0], user).then(success => {
            if (!success) {
              console.warn('Failed to notify external systems about new ad');
            } else {
              console.log('Successfully notified external systems about new ad');
            }
          });
        }
        
        toast({
          title: 'Anúncio publicado',
          description: 'Seu anúncio foi publicado com sucesso.',
        });
        
        setTimeout(() => {
          navigate('/anuncios');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error saving ad:', error);
      toast({
        title: 'Erro ao salvar anúncio',
        description: error.message || 'Ocorreu um erro ao salvar seu anúncio.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (adId) {
      handleEditMode(adId);
    }
  }, [adId]);

  return {
    formData,
    updateFormField,
    handleSaveAd,
    editMode,
    saving,
    uploading,
    setUploading,
    uploadProgress,
    setUploadProgress,
    isPublicLinkEnabled,
    setIsPublicLinkEnabled,
    imageUrls: formData.imageUrls,
    setImageUrls: (urls: string[]) => updateFormField('imageUrls', urls),
  };
};
