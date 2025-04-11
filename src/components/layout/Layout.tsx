
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNavbar } from "./MobileNavbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

export function Layout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Check if we're on auth pages
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  
  // If we're on an auth page, don't show the layout
  if (isAuthPage) {
    return <Outlet />;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
        <MobileNavbar />
      </div>
    </div>
  );
}
