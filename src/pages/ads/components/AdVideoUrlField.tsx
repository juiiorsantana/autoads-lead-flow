
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

import { FormData } from "../types/FormData";

interface AdVideoUrlFieldProps  {
  form: UseFormReturn<FormData>;
}

export const AdVideoUrlField: React.FC<AdVideoUrlFieldProps> = ({ form }) => (
    <FormField
      control={form.control}
      name="videoUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Link do Vídeo (Opcional)</FormLabel>
          <FormControl>
            <Input placeholder="Ex: https://youtube.com/watch?v=..." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />);
