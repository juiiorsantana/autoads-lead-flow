
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AdFormData } from '@/hooks/useAdForm';

interface AdContactDetailsProps {
  formData: AdFormData;
  updateFormField: <K extends keyof AdFormData>(field: K, value: AdFormData[K]) => void;
  isPublicLinkEnabled: boolean;
  setIsPublicLinkEnabled: (enabled: boolean) => void;
}

export const AdContactDetails = ({ 
  formData, 
  updateFormField, 
  isPublicLinkEnabled, 
  setIsPublicLinkEnabled 
}: AdContactDetailsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="userWhatsapp">Link do WhatsApp</Label>
        <Input 
          id="userWhatsapp" 
          type="tel"
          value={formData.userWhatsapp} 
          onChange={(e) => updateFormField('userWhatsapp', e.target.value)}
          placeholder="Número do WhatsApp com código do país (ex: 5511999999999)"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>
          Link Público
          <Switch 
            id="public-link" 
            checked={isPublicLinkEnabled}
            onCheckedChange={(checked) => setIsPublicLinkEnabled(checked)} 
          />
        </Label>
        <Input 
          type="url"
          value={formData.publicLink} 
          onChange={(e) => updateFormField('publicLink', e.target.value)}
          placeholder={isPublicLinkEnabled ? "Link público para o anúncio (opcional)" : "Link público para o anúncio (desabilitado)"}
          disabled={!isPublicLinkEnabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoAd">Código do Vídeo</Label>
        <Textarea 
          id="videoAd" 
          value={formData.videoAd} 
          onChange={(e) => updateFormField('videoAd', e.target.value)}
          placeholder="Cole o código de incorporação do vídeo aqui"
          rows={4}
        />
      </div>
    </>
  );
};
