
import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

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

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize storage buckets
    import('@/integrations/supabase/initBuckets').then(({ initBuckets }) => {
      initBuckets();
    });
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
