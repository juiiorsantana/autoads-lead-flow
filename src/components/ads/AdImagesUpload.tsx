import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Progress } from '@/components/ui/progress';

interface AdImagesUploadProps {
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
}

export const AdImagesUpload = ({
  imageUrls,
  setImageUrls,
  uploading,
  setUploading,
  uploadProgress,
  setUploadProgress,
}: AdImagesUploadProps) => {
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 5,
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      setUploadProgress(0);
  
      try {
        const uploadPromises = acceptedFiles.map(async (file) => {
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
            let progress = 0;
            const interval = setInterval(() => {
              progress = Math.min(progress + 20, 100);
              setUploadProgress(progress);
              
              if (progress === 100) {
                clearInterval(interval);
                resolve(publicURL.data.publicUrl);
              }
            }, 200);
          });
        });
  
        const uploadedUrls = await Promise.all(uploadPromises);
        setImageUrls([...imageUrls, ...uploadedUrls]);
  
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

  return (
    <div className="space-y-2">
      <Label>Imagens do Anúncio</Label>
      <div
        {...getRootProps()}
        className="relative border-2 border-dashed rounded-md p-4 cursor-pointer"
      >
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
  );
};
