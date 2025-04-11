
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, Car, Home, MessageSquare, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileNavbar() {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Don't show the mobile navbar on authentication pages
  if (location.pathname === "/login" || location.pathname === "/register" || !isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full border-t border-border bg-white z-50">
      <div className="flex items-center justify-between px-4">
        <NavItem 
          to="/" 
          icon={<Home size={20} />} 
          label="Início" 
          isActive={location.pathname === "/"} 
        />
        <NavItem 
          to="/anuncios" 
          icon={<Car size={20} />} 
          label="Anúncios" 
          isActive={location.pathname.includes("/anuncios")} 
        />
        <NavItem 
          to="/metricas" 
          icon={<BarChart3 size={20} />} 
          label="Métricas" 
          isActive={location.pathname.includes("/metricas")} 
        />
        <NavItem 
          to="/mensagens" 
          icon={<MessageSquare size={20} />} 
          label="Mensagens" 
          isActive={location.pathname.includes("/mensagens")} 
        />
        <NavItem 
          to="/perfil" 
          icon={<User size={20} />} 
          label="Perfil" 
          isActive={location.pathname.includes("/perfil")} 
        />
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => (
  <Link to={to} className="w-full py-2">
    <Button
      variant="ghost"
      className={cn(
        "w-full flex flex-col h-auto py-2",
        isActive ? "text-primary" : "text-gray-500"
      )}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Button>
  </Link>
);
