
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdForm } from '@/hooks/useAdForm';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import { AdBasicDetails } from '@/components/ads/AdBasicDetails';
import { AdImagesUpload } from '@/components/ads/AdImagesUpload';
import { AdContactDetails } from '@/components/ads/AdContactDetails';
import { AdTypeSelection } from '@/components/ads/AdTypeSelection';
import { toast } from '@/hooks/use-toast';

export default function NewAd() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const {
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
    imageUrls,
    setImageUrls,
  } = useAdForm(isEditMode ? id : null);

  useEffect(() => {
    // Display a toast message if we're in edit mode
    if (isEditMode) {
      toast({
        title: "Editando anúncio",
        description: "Você está editando um anúncio existente."
      });
    }
  }, [isEditMode]);

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <Header title={editMode ? "Editar Anúncio" : "Novo Anúncio"}>
        <Button variant="outline" onClick={() => navigate('/anuncios')}>
          Voltar para Anúncios
        </Button>
      </Header>
      
      <Card className="p-6">
        <form onSubmit={handleSaveAd} className="space-y-6">
          <AdBasicDetails 
            formData={formData} 
            updateFormField={updateFormField} 
          />

          <Separator />

          <AdImagesUpload 
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
            uploading={uploading}
            setUploading={setUploading}
            uploadProgress={uploadProgress}
            setUploadProgress={setUploadProgress}
          />

          <Separator />

          <AdContactDetails 
            formData={formData}
            updateFormField={updateFormField}
            isPublicLinkEnabled={isPublicLinkEnabled}
            setIsPublicLinkEnabled={setIsPublicLinkEnabled} />

          <Separator />

          <AdTypeSelection 
            selectedAdType={formData.selectedAdType}
            updateFormField={updateFormField} />
          
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : editMode ? "Atualizar Anúncio" : "Salvar Anúncio"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
