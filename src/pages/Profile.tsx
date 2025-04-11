
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Esvanel Santana do Nascimento Junior",
    businessName: "",
    email: "agenciameia5@gmail.com",
    phone: "(11) 99999-9999",
    documentId: "",
    about: "",
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso."
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <Header title="Meu Perfil" />
      
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative mb-2">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 text-2xl font-semibold">
            ES
          </div>
          <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-200">
            <Camera className="h-5 w-5 text-gray-500" />
          </div>
        </div>
        <p className="text-center text-gray-500 text-sm">Clique para alterar sua foto</p>
      </div>
      
      <Card className="bg-white p-6">
        <h2 className="text-xl font-semibold mb-6">Dados Pessoais</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                name="fullName"
                value={profileData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessName">Nome da loja ou garagem</Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Nome do seu negócio (opcional)"
                value={profileData.businessName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                value={profileData.email}
                disabled
              />
              <p className="text-xs text-gray-500">O e-mail não pode ser alterado</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentId">CPF ou CNPJ</Label>
              <Input
                id="documentId"
                name="documentId"
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                value={profileData.documentId}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="about">Sobre você</Label>
            <Textarea
              id="about"
              name="about"
              placeholder="Breve descrição sobre você ou seu negócio de veículos (máx. 200 caracteres)"
              rows={4}
              maxLength={200}
              value={profileData.about}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            <div className="flex justify-end">
              <span className="text-xs text-gray-500">
                {profileData.about.length}/200 caracteres
              </span>
            </div>
          </div>
          
          <div className="flex justify-center md:justify-end">
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  Salvar Alterações
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Editar Perfil
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
