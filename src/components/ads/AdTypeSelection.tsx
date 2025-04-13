
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdFormData } from '@/hooks/useAdForm';

interface AdType {
  value: 'normal' | 'priority' | 'professional';
  label: string;
  description: string;
  enabled: boolean;
}

const adTypes: AdType[] = [
  {
    value: 'normal',
    label: 'Normal',
    description: 'Anúncio normal',
    enabled: true
  },
  {
    value: 'priority',
    label: 'Prioritário',
    description: 'Anúncio com prioridade',
    enabled: true
  },
  {
    value: 'professional',
    label: 'Profissional',
    description: 'Anúncio profissional',
    enabled: true
  }
];

interface AdTypeSelectionProps {
  selectedAdType: AdFormData['selectedAdType'];
  updateFormField: <K extends keyof AdFormData>(field: K, value: AdFormData[K]) => void;
}

export const AdTypeSelection = ({ selectedAdType, updateFormField }: AdTypeSelectionProps) => {
  return (
    <div className="space-y-2">
      <Label>Tipo de Anúncio</Label>
      <Select 
        value={selectedAdType} 
        onValueChange={(value) => {
          updateFormField('selectedAdType', value as 'normal' | 'priority' | 'professional');
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
  );
};
