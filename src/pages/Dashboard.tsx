
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Car, DollarSign, ChevronsRight, PlusCircle, Waypoints } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Header title="Bem-vindo, Esvanel!" />
      
      <div className="text-gray-600">
        Aqui está o resumo dos seus anúncios de veículos
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Anúncios Ativos" 
          value="0" 
          subtitle="Total de veículos anunciados" 
          icon={<Car className="h-6 w-6 text-primary" />} 
        />
        
        <MetricCard 
          title="Gasto Total/Dia" 
          value="R$ 0,00" 
          subtitle="Investimento diário em anúncios" 
          icon={<DollarSign className="h-6 w-6 text-primary" />} 
        />
        
        <MetricCard 
          title="Total de Cliques" 
          value="0" 
          subtitle="Interações via WhatsApp" 
          icon={<Waypoints className="h-6 w-6 text-primary" />} 
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Seus Anúncios</h2>
        <Link to="/anuncios">
          <Button variant="ghost" className="text-primary flex items-center gap-1">
            Ver todos
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
          <TabsTrigger value="pausados">Pausados</TabsTrigger>
          <TabsTrigger value="em-analise">Em Análise</TabsTrigger>
          <TabsTrigger value="deletados">Deletados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todos" className="mt-4">
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
        </TabsContent>
        
        <TabsContent value="aprovados" className="mt-4">
          <EmptyStateCard message="Nenhum anúncio aprovado encontrado." />
        </TabsContent>
        
        <TabsContent value="pausados" className="mt-4">
          <EmptyStateCard message="Nenhum anúncio pausado encontrado." />
        </TabsContent>
        
        <TabsContent value="em-analise" className="mt-4">
          <EmptyStateCard message="Nenhum anúncio em análise encontrado." />
        </TabsContent>
        
        <TabsContent value="deletados" className="mt-4">
          <EmptyStateCard message="Nenhum anúncio deletado encontrado." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-full">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function EmptyStateCard({ message }: { message: string }) {
  return (
    <Card className="p-8 bg-white border border-gray-200 text-center">
      <p className="text-gray-500">{message}</p>
    </Card>
  );
}
