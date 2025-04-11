
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, Car, Home, MessageSquare, User, ChevronLeft, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavItem = ({ to, icon, label, isActive, isCollapsed }: NavItemProps) => (
  <Link to={to} className="w-full">
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 font-normal",
        isCollapsed ? "px-3" : "px-4",
        isActive ? "bg-primary-light text-primary" : "text-gray-600 hover:text-primary"
      )}
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </Button>
  </Link>
);

export function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Don't show the sidebar on authentication pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  // On mobile, don't render the sidebar at all
  if (isMobile) {
    return null;
  }

  return (
    <div
      className={cn(
        "h-screen border-r border-border flex flex-col bg-white transition-all duration-300 sticky top-0 left-0",
        isCollapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center">
          <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold">
            A
          </div>
          {!isCollapsed && <span className="ml-2 font-semibold text-primary">AutoAds</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-full w-6 h-6"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <div className="flex flex-col gap-1 p-2 mt-4">
        <NavItem
          to="/dashboard"
          icon={<Home size={20} />}
          label="Dashboard"
          isActive={location.pathname === "/dashboard"}
          isCollapsed={isCollapsed}
        />
        <NavItem
          to="/anuncios"
          icon={<Car size={20} />}
          label="Meus Anúncios"
          isActive={location.pathname.includes("/anuncios")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          to="/metricas"
          icon={<BarChart3 size={20} />}
          label="Métricas Gerais"
          isActive={location.pathname.includes("/metricas")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          to="/mensagens"
          icon={<MessageSquare size={20} />}
          label="Mensagens"
          isActive={location.pathname.includes("/mensagens")}
          isCollapsed={isCollapsed}
        />
        <NavItem
          to="/perfil"
          icon={<User size={20} />}
          label="Meu Perfil"
          isActive={location.pathname.includes("/perfil")}
          isCollapsed={isCollapsed}
        />
      </div>

      <div className="mt-auto p-4 border-t border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 font-medium">
              E
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Esvanel Santana</span>
              <span className="text-xs text-gray-500">agenciameia5@gmail.com</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 font-medium">
              E
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
