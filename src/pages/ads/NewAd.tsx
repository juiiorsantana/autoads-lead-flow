
import { useEffect } from 'react';
import { useAdForm } from '@/hooks/useAdForm';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import { AdBasicDetails } from '@/components/ads/AdBasicDetails';
import { AdImagesUpload } from '@/components/ads/AdImagesUpload';
import { AdContactDetails } from '@/components/ads/AdContactDetails';
import { AdTypeSelection } from '@/components/ads/AdTypeSelection';

export default function NewAd() {
  const pathSegments = window.location.pathname.split('/');
  const adIdFromUrl = pathSegments[pathSegments.length - 1];
  const isEditMode = adIdFromUrl && pathSegments[pathSegments.length - 2] === 'editar';
  
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
  } = useAdForm(isEditMode ? adIdFromUrl : null);

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <Header title={editMode ? "Editar Anúncio" : "Novo Anúncio"} />
      
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
              {saving ? "Salvando..." : "Salvar Anúncio"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
