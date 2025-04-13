import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { notifyAdCreation } from '@/utils/webhooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Json } from '@/integrations/supabase/types';

const adTypes = [
  {
    value: 'normal' as const,
    label: 'Normal',
    description: 'Anúncio normal',
    enabled: true
  },
  {
    value: 'priority' as const,
    label: 'Prioritário',
    description: 'Anúncio com prioridade',
    enabled: true
  },
  {
    value: 'professional' as const,
    label: 'Profissional',
    description: 'Anúncio profissional',
    enabled: true
  }
];

interface AdType {
  value: 'normal' | 'priority' | 'professional';
  label: string;
  description: string;
  enabled: boolean;
}

interface AdDetails {
  whatsappLink: string;
  publicLink: string;
  adType: 'normal' | 'priority' | 'professional';
  ano: string;
  [key: string]: string;
}

export default function NewAd() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [adId, setAdId] = useState<string | null>(null);
  const [userWhatsapp, setUserWhatsapp] = useState('');
  const [publicLink, setPublicLink] = useState('');
  const [selectedAdType, setSelectedAdType] = useState<'normal' | 'priority' | 'professional'>('normal');
  const [budget, setBudget] = useState<number | ''>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAd, setVideoAd] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPublicLinkEnabled, setIsPublicLinkEnabled] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const handleEditMode = async (adId: string) => {
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .eq('id', adId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTitle(data.titulo);
        setPrice(data.preco);
        setDescription(data.descricao || '');
        setImageUrls(data.imagens || []);
        
        const details = data.detalhes as { [key: string]: any } | null;
        if (details && typeof details === 'object') {
          setUserWhatsapp(details.whatsappLink || '');
          setPublicLink(details.publicLink || '');
          setSelectedAdType((details.adType as 'normal' | 'priority' | 'professional') || 'normal');
        }
        
        setBudget(data.orcamento || '');
        setVideoUrl(data.video_url || '');
        setVideoAd(data.video_do_anuncio || '');
        
        setEditMode(true);
        setAdId(adId);
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
        whatsappLink: userWhatsapp,
        publicLink: publicLink,
        adType: selectedAdType,
        ano: year,
      };
      
      if (editMode && adId) {
        const { error, data } = await supabase
          .from('anuncios')
          .update({
            titulo: title,
            preco: parseFloat(price.toString()),
            descricao: description,
            imagens: imageUrls,
            orcamento: parseFloat(budget.toString() || '0'),
            detalhes: adDetails as Json,
            video_url: videoUrl,
            video_do_anuncio: videoAd,
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
        const newSlug = await generateSlug(title);
        
        const { error, data } = await supabase
          .from('anuncios')
          .insert({
            titulo: title,
            preco: parseFloat(price.toString()),
            descricao: description,
            imagens: imageUrls,
            user_id: user.id,
            orcamento: parseFloat(budget.toString() || '0'),
            detalhes: adDetails as Json,
            video_url: videoUrl,
            video_do_anuncio: videoAd,
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

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 5,
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      setUploadProgress(0);
  
      try {
        const uploadPromises = acceptedFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `anuncios/${fileName}`;
  
          const { data, error } = await supabase.storage
            .from('anuncios')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
  
          if (error) {
            throw error;
          }
  
          const publicURL = supabase.storage
            .from('anuncios')
            .getPublicUrl(filePath);
  
          return new Promise<string>((resolve) => {
            const interval = setInterval(() => {
              setUploadProgress((prevProgress) => {
                const newProgress = Math.min(prevProgress + 20, 100);
                if (newProgress === 100) {
                  clearInterval(interval);
                  resolve(publicURL.data.publicUrl);
                }
                return newProgress;
              });
            }, 200);
          });
        });
  
        const uploadedUrls = await Promise.all(uploadPromises);
        setImageUrls((prevUrls) => [...prevUrls, ...uploadedUrls] as string[]);
  
        toast({
          title: 'Imagens enviadas',
          description: 'Todas as imagens foram enviadas com sucesso!',
        });
      } catch (error: any) {
        console.error('Error uploading images:', error);
        toast({
          title: 'Erro ao enviar imagens',
          description: error.message || 'Ocorreu um erro ao enviar as imagens.',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
  });

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const adIdFromUrl = pathSegments[pathSegments.length - 1];
    
    if (adIdFromUrl && pathSegments[pathSegments.length - 2] === 'editar') {
      handleEditMode(adIdFromUrl);
    }
  }, []);

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <Header title={editMode ? "Editar Anúncio" : "Novo Anúncio"} />
      
      <Card className="p-6">
        <form onSubmit={handleSaveAd} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Anúncio</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do seu anúncio"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input 
                id="price" 
                type="number"
                value={price} 
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Preço do produto ou serviço"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input 
                id="year" 
                type="number"
                value={year} 
                onChange={(e) => setYear(e.target.value)}
                placeholder="Ano do produto (se aplicável)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <Input 
                id="budget" 
                type="number"
                value={budget} 
                onChange={(e) => setBudget(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Seu orçamento para este anúncio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL do Vídeo</Label>
              <Input 
                id="videoUrl" 
                type="url"
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="URL do vídeo do anúncio (YouTube, Vimeo, etc.)"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva seu produto ou serviço detalhadamente"
                rows={4}
                required
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Imagens do Anúncio</Label>
            <div {...getRootProps()} className="relative border-2 border-dashed rounded-md p-4 cursor-pointer">
              <input {...getInputProps()} />
              {uploading ? (
                <div className="text-center">
                  <p>Enviando imagens... {uploadProgress}%</p>
                  <Progress value={uploadProgress} />
                </div>
              ) : isDragActive ? (
                <p className="text-center">Arraste as imagens aqui...</p>
              ) : (
                <div className="text-center">
                  <p>Arraste e solte até 5 imagens aqui, ou clique para selecionar os arquivos</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative w-24 h-24">
                  <AspectRatio ratio={1 / 1}>
                    <img
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      className="rounded-md object-cover"
                    />
                  </AspectRatio>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 w-6 h-6 p-0"
                    onClick={() => {
                      const newImageUrls = [...imageUrls];
                      newImageUrls.splice(index, 1);
                      setImageUrls(newImageUrls);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="sr-only">Remover</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="userWhatsapp">Link do WhatsApp</Label>
            <Input 
              id="userWhatsapp" 
              type="tel"
              value={userWhatsapp} 
              onChange={(e) => setUserWhatsapp(e.target.value)}
              placeholder="Número do WhatsApp com código do país (ex: 5511999999999)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              Link Público
              <Switch id="public-link" onCheckedChange={(checked) => setIsPublicLinkEnabled(checked)} />
            </Label>
            {isPublicLinkEnabled ? (
              <Input 
                type="url"
                value={publicLink} 
                onChange={(e) => setPublicLink(e.target.value)}
                placeholder="Link público para o anúncio (opcional)"
              />
            ) : (
              <Input 
                type="url"
                value={publicLink} 
                onChange={(e) => setPublicLink(e.target.value)}
                placeholder="Link público para o anúncio (desabilitado)"
                disabled
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoAd">Código do Vídeo</Label>
            <Textarea 
              id="videoAd" 
              value={videoAd} 
              onChange={(e) => setVideoAd(e.target.value)}
              placeholder="Cole o código de incorporação do vídeo aqui"
              rows={4}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Tipo de Anúncio</Label>
            <Select 
              value={selectedAdType} 
              onValueChange={(value) => {
                setSelectedAdType(value as 'normal' | 'priority' | 'professional');
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo de anúncio" />
              </SelectTrigger>
              <SelectContent>
                {adTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} disabled={!type.enabled}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Anúncio"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
