
import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react"; // Changed from ExclamationTriangleIcon to AlertTriangle
import { Button } from "@/components/ui/button";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Metrics from "./pages/Metrics";
import AdsList from "./pages/ads/AdsList";
import NewAd from "./pages/ads/NewAd";
import PublicAd from "./pages/PublicAd";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Limit retries
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (updated from cacheTime to gcTime)
    },
  },
});

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [initializingBuckets, setInitializingBuckets] = useState(false);

  useEffect(() => {
    // Set a maximum time for loading before showing an error
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        setLoadingError("O carregamento está demorando mais que o esperado. Pode haver um problema de conexão.");
      }
    }, 10000); // 10 seconds timeout
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setLoading(false);
      }
    );

    // Check for existing session with timeout
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
      } catch (error) {
        console.error("Error checking session:", error);
        setLoadingError("Não foi possível verificar sua sessão. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Initialize buckets only after main app loads
    const delayedInitBuckets = () => {
      if (!loading && !initializingBuckets) {
        setInitializingBuckets(true);
        import('@/integrations/supabase/initBuckets').then(({ initBuckets }) => {
          initBuckets().catch(console.error);
        });
      }
    };

    // Only initialize buckets when app is visible and loaded
    if (document.visibilityState === 'visible') {
      window.addEventListener('load', delayedInitBuckets);
    }

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
      window.removeEventListener('load', delayedInitBuckets);
    };
  }, [loading, initializingBuckets]);

  const retryLoading = () => {
    setLoading(true);
    setLoadingError(null);
    window.location.reload();
  };

  // Show error message if loading takes too long
  if (loadingError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Problema de conexão</AlertTitle>
            <AlertDescription>{loadingError}</AlertDescription>
          </Alert>
          <Button onClick={retryLoading} className="w-full">Tentar novamente</Button>
        </div>
      </div>
    );
  }

  // Show standard loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500">Carregando aplicação...</p>
      </div>
    ); 
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={session ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/:slug" element={<PublicAd />} />
            
            {/* Nova rota adicional para formato /anuncios/publico/:slug */}
            <Route path="/anuncios/publico/:slug" element={<PublicAd />} />
            
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/metricas" element={<Metrics />} />
              <Route path="/anuncios" element={<AdsList />} />
              <Route path="/anuncios/novo" element={<NewAd />} />
              <Route path="/mensagens" element={<Messages />} />
              <Route path="/perfil" element={<Profile />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
