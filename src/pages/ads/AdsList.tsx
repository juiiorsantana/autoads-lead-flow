
import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";

export default function AdsList() {
  const [ads, setAds] = useState([]);

  return (
    <div className="space-y-6 animate-fade-in">
      <Header title="Meus Anúncios">
        <Link to="/anuncios/novo">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Novo Anúncio
          </Button>
        </Link>
      </Header>

      <Tabs defaultValue="todos">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
          <TabsTrigger value="pausados">Pausados</TabsTrigger>
          <TabsTrigger value="em-analise">Em Análise</TabsTrigger>
          <TabsTrigger value="deletados">Deletados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todos" className="mt-4">
          <EmptyState />
        </TabsContent>
        
        <TabsContent value="aprovados" className="mt-4">
          <EmptyState />
        </TabsContent>
        
        <TabsContent value="pausados" className="mt-4">
          <EmptyState />
        </TabsContent>
        
        <TabsContent value="em-analise" className="mt-4">
          <EmptyState />
        </TabsContent>
        
        <TabsContent value="deletados" className="mt-4">
          <EmptyState />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="p-8 bg-white border border-gray-200 text-center">
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Nenhum anúncio encontrado</h3>
        <p className="text-gray-500">Você ainda não tem nenhum anúncio cadastrado.</p>
        <p className="text-center text-gray-600 mt-4">
          Comece a anunciar seus veículos e atraia mais clientes!
        </p>
        
        <div className="flex justify-center mt-4">
          <Link to="/anuncios/novo">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Criar meu primeiro anúncio
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
