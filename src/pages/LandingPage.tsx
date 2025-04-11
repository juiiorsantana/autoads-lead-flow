
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car, BarChart3, MessageSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="ml-2 text-xl font-bold">
                Auto<span className="autoads-highlight">Ads</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button>Cadastre-se</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gray-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:space-x-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">
                Venda seus carros com{" "}
                <span className="text-primary">mais controle</span> e{" "}
                <span className="autoads-highlight">melhores resultados</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Gerencie seus anúncios de veículos, acompanhe gastos com tráfego em tempo real e gere leads via WhatsApp com rastreamento de cliques.
              </p>
              <div className="flex items-center space-x-4 pt-2">
                <Link to="/register">
                  <Button size="lg" className="rounded-md flex items-center gap-2">
                    Começar agora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="rounded-md">
                    Já tenho uma conta
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <img 
                src="/lovable-uploads/63fb7192-1103-41eb-bd67-c9abc1741b88.png" 
                alt="Vendedores de carros usando o AutoLink Express" 
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Principais Funcionalidades</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              O AutoAds foi desenvolvido para facilitar a vida de vendedores de carros como você.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Car className="h-8 w-8 text-primary" />}
              title="Anúncios Inteligentes"
              description="Crie e gerencie anúncios de veículos com páginas públicas personalizadas e navegação estilo Tinder."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-primary" />}
              title="Análise de Desempenho"
              description="Acompanhe gastos com tráfego pago, visualizações e cliques no WhatsApp em tempo real."
            />
            <FeatureCard 
              icon={<MessageSquare className="h-8 w-8 text-primary" />}
              title="Leads via WhatsApp"
              description="Gere conversas diretas via WhatsApp com rastreamento de cliques para medir a eficácia dos anúncios."
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary py-16 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Comece a vender mais hoje mesmo</h2>
          <p className="mb-8 text-blue-100 max-w-2xl mx-auto">
            Junte-se a centenas de vendedores que já estão melhorando seus resultados com o AutoAds.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="bg-secondary hover:bg-secondary-hover rounded-md">
              Criar minha conta gratuitamente
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-primary font-semibold">
                  A
                </div>
                <span className="ml-2 text-xl font-bold text-white">
                  Auto<span className="text-secondary">Ads</span>
                </span>
              </div>
              <p className="mt-2 max-w-xs">
                Sua plataforma para gerenciar anúncios de veículos
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Plataforma
                </h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="hover:text-white">Recursos</a></li>
                  <li><a href="#" className="hover:text-white">Planos</a></li>
                  <li><a href="#" className="hover:text-white">Segurança</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Suporte
                </h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                  <li><a href="#" className="hover:text-white">Contato</a></li>
                  <li><a href="#" className="hover:text-white">Tutoriais</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="hover:text-white">Privacidade</a></li>
                  <li><a href="#" className="hover:text-white">Termos</a></li>
                  <li><a href="#" className="hover:text-white">Cookies</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="mt-8 md:mt-0 md:order-1">
              &copy; 2025 AutoLink Express. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 bg-blue-50 p-3 rounded-full w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
