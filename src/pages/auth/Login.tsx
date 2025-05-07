
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react"; // Changed from ExclamationTriangleIcon to AlertTriangle

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const navigate = useNavigate();
  
  // Check connection when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionError(!isConnected);
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Verify connection before attempting login
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        setConnectionError(true);
        throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão com a internet.");
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando para o dashboard...",
      });
      
      // Redirecionamento será feito pelo listener de autenticação no App.tsx
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique seus dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRetry = async () => {
    setConnectionError(false);
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      setConnectionError(true);
      toast({
        title: "Problema de conexão",
        description: "Ainda não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conexão restabelecida",
        description: "Você já pode fazer login.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold text-xl">
              A
            </div>
            <span className="ml-2 text-2xl font-bold">
              Auto<span className="autoads-highlight">Ads</span>
            </span>
          </div>
        </div>
        
        {connectionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Problema de conexão</AlertTitle>
            <AlertDescription>
              Não foi possível conectar ao servidor. Verifique sua conexão com a internet.
              <Button variant="outline" className="w-full mt-2" onClick={handleRetry}>
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold">Login</h1>
            <p className="text-gray-500 mt-1">
              Acesse sua conta para gerenciar seus anúncios
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                placeholder="seu@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover" 
              disabled={isLoading || connectionError}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
