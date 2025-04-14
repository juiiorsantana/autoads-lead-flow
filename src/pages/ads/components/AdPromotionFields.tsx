
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../types/FormData"; 

interface AdPromotionFieldsProps {
    form: UseFormReturn<FormData>;
}

export function AdPromotionFields({ form }: AdPromotionFieldsProps) {
    return (<FormField
        control={form.control}
        name="dailySpend"
        render={({ field }) => (
            <FormItem>
                <FormLabel>Orçamento Diário (R$)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 50" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
    );
}
