
import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    documentId: "",
    about: "",
    avatarUrl: "",
  });
  const [avatarOption, setAvatarOption] = useState<"upload" | "initials">("initials");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
          return;
        }

        setProfileData({
          fullName: profileData?.full_name || user.user_metadata?.full_name || "",
          businessName: profileData?.business_name || "",
          email: user.email || "",
          phone: profileData?.phone || "",
          documentId: profileData?.document_id || "",
          about: profileData?.about || "",
          avatarUrl: profileData?.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro ao salvar perfil",
          description: "Usuário não autenticado.",
        });
        return;
      }

      // Update user metadata with full_name
      await supabase.auth.updateUser({
        data: { full_name: profileData.fullName }
      });

      // Update profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.fullName,
          business_name: profileData.businessName,
          phone: profileData.phone,
          document_id: profileData.documentId,
          about: profileData.about,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso."
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erro ao salvar perfil",
        description: "Ocorreu um erro ao salvar suas informações."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    setShowAvatarDialog(true);
  };

  const handleAvatarOptionChange = (value: "upload" | "initials") => {
    setAvatarOption(value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        avatarUrl: urlData.publicUrl
      }));
      
      setShowAvatarDialog(false);
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível atualizar sua foto de perfil."
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleRemoveAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        avatarUrl: ""
      }));
      
      setShowAvatarDialog(false);
      setAvatarOption("initials");
      
      toast({
        title: "Foto removida",
        description: "Sua foto de perfil foi removida com sucesso."
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Erro ao remover foto",
        description: "Não foi possível remover sua foto de perfil."
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      <Header title="Meu Perfil" />
      
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative mb-2 cursor-pointer" onClick={handleAvatarClick}>
          <Avatar className="w-24 h-24 border-2 border-gray-200">
            {profileData.avatarUrl ? (
              <AvatarImage src={profileData.avatarUrl} alt={profileData.fullName} />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-500 text-2xl font-semibold">
                {getInitials(profileData.fullName)}
              </AvatarFallback>
            )}
          </Avatar>
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
                placeholder="(11) 99999-9999"
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
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
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

      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar foto de perfil</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RadioGroup 
              value={avatarOption} 
              onValueChange={handleAvatarOptionChange as (value: string) => void}
              className="flex flex-col space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="initials" id="initials" />
                <Label htmlFor="initials">Usar iniciais do meu nome</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload">Fazer upload de uma foto</Label>
              </div>
            </RadioGroup>
            
            {avatarOption === "upload" && (
              <div className="mt-4">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tamanho máximo: 2MB. Formatos: JPG, PNG
                </p>
              </div>
            )}
            
            {profileData.avatarUrl && (
              <div className="flex justify-center mt-4">
                <Button 
                  variant="destructive" 
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                >
                  Remover foto atual
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowAvatarDialog(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            {avatarOption === "upload" && (
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Escolher arquivo'
                )}
              </Button>
            )}
            {avatarOption === "initials" && (
              <Button
                onClick={() => {
                  handleRemoveAvatar();
                  setShowAvatarDialog(false);
                }}
                disabled={isUploading}
              >
                Salvar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
