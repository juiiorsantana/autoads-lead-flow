
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Car } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function NewAd() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    carName: "",
    price: "",
    description: "",
    whatsappLink: "",
    dailySpend: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Anúncio criado com sucesso",
        description: "Seu anúncio foi enviado para análise e será publicado em breve."
      });
      navigate("/anuncios");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <Header title="Novo Anúncio">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </Header>

      <Card className="bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Car className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-lg font-medium">Adicionar foto do veículo</p>
                <p className="text-gray-500 text-sm mb-4">Clique para fazer upload de uma imagem</p>
                <Button variant="outline" type="button">
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer upload
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carName">Nome do carro</Label>
              <Input
                id="carName"
                name="carName"
                placeholder="Ex: Honda Civic EXL 2020"
                value={formData.carName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Input
                id="price"
                name="price"
                placeholder="Ex: 75.990"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descreva o veículo, suas características, estado de conservação, etc."
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappLink">Link do WhatsApp</Label>
              <Input
                id="whatsappLink"
                name="whatsappLink"
                placeholder="Ex: 5511999999999"
                value={formData.whatsappLink}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-gray-500">Apenas números, com código do país e DDD</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailySpend">Gasto diário</Label>
              <Input
                id="dailySpend"
                name="dailySpend"
                placeholder="Ex: 50"
                value={formData.dailySpend}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-gray-500">Valor em R$ para investimento diário</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando anúncio..." : "Criar anúncio"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
