
import React from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { AdDetailsFields } from "./AdDetailsFields";
import { AdContactFields } from "./AdContactFields";
import { AdPromotionFields } from "./AdPromotionFields";
import { AdImageUpload } from "./AdImageUpload";
import { AdVideoUrlField } from "./AdVideoUrlField";
import { FormData } from "@/pages/ads/NewAd";
import { cn } from "@/lib/utils";

interface AdFormProps {
  form: UseFormReturn<FormData>;
  isSubmitting: boolean;
  onSubmit: (data: FormData) => void;
  imageFiles: File[];
  imagePreviews: string[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  setIsModalOpen: (open: boolean) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export const AdForm: React.FC<AdFormProps> = ({
  form, onSubmit, isSubmitting, imageFiles, imagePreviews, setImageFiles, setImagePreviews, setIsModalOpen, handleImageUpload, removeImage
}) => {
  const handleCancel = () => {
    setIsModalOpen(false);
    form.reset();
  };

  return (
      <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AdDetailsFields control={form.control} />
              <AdContactFields form={form} />
              <AdPromotionFields form={form}/>
            <AdImageUpload
                imageFiles={imageFiles}
                imagePreviews={imagePreviews}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
            />
              <AdVideoUrlField form={form}/>


              <Button type="submit" disabled={isSubmitting} className={cn(buttonVariants({
                  size: 'lg',
                  className: "w-full mt-4"
              }))}>
                  {isSubmitting ? "Criando anúncio..." : "Criar anúncio"}
              </Button>

          </form>
      </FormProvider>
  );
};
