
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../NewAd";

interface AdVideoUrlFieldProps {
  form: UseFormReturn<FormData>;
}

export function AdVideoUrlField({ form }: AdVideoUrlFieldProps) {
  return (
    <FormField
      control={form.control}
      name="videoUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>URL do Vídeo (opcional)</FormLabel>
          <FormControl>
            <Input placeholder="Ex: https://www.youtube.com/watch?v=..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
