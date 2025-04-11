
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Don't show the header on authentication pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <header className="border-b border-border bg-white sticky top-0 z-40 w-full">
      <div className="flex h-16 items-center px-4 lg:px-6">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="h-full">
                <Sidebar />
              </div>
            </SheetContent>
          </Sheet>
        )}

        <div className="flex items-center">
          {isMobile && (
            <div className="flex items-center">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="ml-2 font-semibold text-primary">AutoAds</span>
            </div>
          )}
        </div>

        {title && (
          <h1 className={cn(
            "text-xl font-semibold text-gray-900",
            isMobile ? "ml-4" : "ml-0"
          )}>
            {title}
          </h1>
        )}

        <div className="ml-auto flex items-center gap-4">
          {children}
          
          <Button variant="ghost" size="icon">
            <Bell size={20} />
            <span className="sr-only">Notificações</span>
          </Button>
          
          {isMobile && (
            <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 font-medium">
              E
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
