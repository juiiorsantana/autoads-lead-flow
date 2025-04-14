import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface AdDetailsFieldsProps {
  control: Control<any>;
}

export const AdDetailsFields: React.FC<AdDetailsFieldsProps> = ({ control }) => {
  return (
    <>
      <FormField
        control={control}
        name="carName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Carro</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Ford Ka 2019" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preço (R$)</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" placeholder="Ex: 50000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea placeholder="Descreva o veículo..." {...field} rows={4} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};