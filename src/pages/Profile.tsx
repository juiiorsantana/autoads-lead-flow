
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [about, setAbout] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Não autenticado",
            description: "Você precisa estar logado para acessar esta página.",
            variant: "destructive",
          });
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setProfile(data);
        setFullName(data.full_name || "");
        setBusinessName(data.business_name || "");
        setPhone(data.phone || "");
        setDocumentId(data.document_id || "");
        setAbout(data.about || "");
        setAvatarUrl(data.avatar_url || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar os dados do seu perfil.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return avatarUrl;
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer o upload da imagem.",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar logado para atualizar seu perfil.",
          variant: "destructive",
        });
        return;
      }
      
      // Upload avatar if changed
      const newAvatarUrl = await uploadAvatar();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          business_name: businessName,
          phone: phone,
          document_id: documentId,
          about: about,
          avatar_url: newAvatarUrl || avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar suas informações.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="animate-fade-in space-y-6 pb-8">
        <Header title="Perfil" />
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <Header title="Perfil" />
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
              >
                <Camera className="h-4 w-4" />
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <h2 className="text-xl font-semibold">
              {fullName || "Seu Nome"}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessName">Nome do Negócio</Label>
              <Input 
                id="businessName" 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Nome da sua empresa ou negócio"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Seu número de telefone"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentId">CPF/CNPJ</Label>
              <Input 
                id="documentId" 
                value={documentId} 
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Seu CPF ou CNPJ"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="about">Sobre</Label>
              <Textarea 
                id="about" 
                value={about} 
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Conte um pouco sobre você ou sua empresa"
                rows={4}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={updating}>
              {updating ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
