
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdFormData } from '@/hooks/useAdForm';

interface AdBasicDetailsProps {
  formData: AdFormData;
  updateFormField: <K extends keyof AdFormData>(field: K, value: AdFormData[K]) => void;
}

export const AdBasicDetails = ({ formData, updateFormField }: AdBasicDetailsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título do Anúncio</Label>
        <Input 
          id="title" 
          value={formData.title} 
          onChange={(e) => updateFormField('title', e.target.value)}
          placeholder="Título do seu anúncio"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price">Preço (R$)</Label>
        <Input 
          id="price" 
          type="number"
          value={formData.price} 
          onChange={(e) => updateFormField('price', e.target.value === '' ? '' : parseFloat(e.target.value))}
          placeholder="Preço do produto ou serviço"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Ano</Label>
        <Input 
          id="year" 
          type="number"
          value={formData.year} 
          onChange={(e) => updateFormField('year', e.target.value)}
          placeholder="Ano do produto (se aplicável)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Orçamento (R$)</Label>
        <Input 
          id="budget" 
          type="number"
          value={formData.budget} 
          onChange={(e) => updateFormField('budget', e.target.value === '' ? '' : parseFloat(e.target.value))}
          placeholder="Seu orçamento para este anúncio"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">URL do Vídeo</Label>
        <Input 
          id="videoUrl" 
          type="url"
          value={formData.videoUrl} 
          onChange={(e) => updateFormField('videoUrl', e.target.value)}
          placeholder="URL do vídeo do anúncio (YouTube, Vimeo, etc.)"
        />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea 
          id="description" 
          value={formData.description} 
          onChange={(e) => updateFormField('description', e.target.value)}
          placeholder="Descreva seu produto ou serviço detalhadamente"
          rows={4}
          required
        />
      </div>
    </div>
  );
};
