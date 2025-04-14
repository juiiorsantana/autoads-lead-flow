
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../types/FormData";

interface AdContactFieldsProps {
  form: UseFormReturn<FormData>;
}

export function AdContactFields({ form }: AdContactFieldsProps) {
  return (
    <FormField control={form.control} name="whatsappLink" render={({ field }) => (
      <FormItem>
        <FormLabel>Link do WhatsApp</FormLabel>
        <FormControl>
          <Input placeholder="Ex: 5511999999999" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}
