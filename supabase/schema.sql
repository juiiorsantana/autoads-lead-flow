
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  business_name TEXT,
  about TEXT,
  document_id TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create anuncios table for ad listings
CREATE TABLE IF NOT EXISTS public.anuncios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC NOT NULL,
  imagens TEXT[] NOT NULL DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  status TEXT DEFAULT 'em-analise',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  visualizacoes INT DEFAULT 0,
  clics_whatsapp INT DEFAULT 0,
  localizacao TEXT,
  orcamento NUMERIC,
  detalhes JSONB,
  video_url TEXT,
  video_do_anuncio TEXT
);

-- Create visualizacoes table for tracking ad views
CREATE TABLE IF NOT EXISTS public.visualizacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anuncio_id UUID REFERENCES public.anuncios ON DELETE CASCADE,
  viewer_ip TEXT,
  viewer_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create whatsapp_cliques table for tracking WhatsApp clicks
CREATE TABLE IF NOT EXISTS public.whatsapp_cliques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anuncio_id UUID REFERENCES public.anuncios ON DELETE CASCADE,
  clicker_ip TEXT,
  clicker_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create campaign_metrics table for tracking ad campaign metrics
CREATE TABLE IF NOT EXISTS public.campaign_metrics (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  campaign_name TEXT,
  ad_set_name TEXT,
  ad_name TEXT,
  amount_spent NUMERIC,
  reach INT,
  impressions INT,
  cpm NUMERIC,
  messaging_conversations INT,
  link_clicks INT,
  landing_page_views INT,
  leads INT,
  day TEXT
);

-- Create functions for tracking views and WhatsApp clicks
CREATE OR REPLACE FUNCTION public.generate_unique_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  existing INT;
  counter INT := 0;
BEGIN
  slug := regexp_replace(lower(title), '[^a-z0-9]', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := regexp_replace(slug, '^-|-$', '', 'g');
  
  LOOP
    IF counter > 0 THEN
      SELECT slug || '-' || counter INTO slug;
    END IF;
    
    SELECT COUNT(*) INTO existing FROM public.anuncios WHERE anuncios.slug = slug;
    
    IF existing = 0 THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
  END LOOP;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Function to register view of an ad
CREATE OR REPLACE FUNCTION public.register_view(anuncio_slug TEXT, viewer_ip TEXT, viewer_agent TEXT)
RETURNS VOID AS $$
DECLARE
  anuncio_id UUID;
BEGIN
  -- Get the ad ID from the slug
  SELECT id INTO anuncio_id FROM public.anuncios WHERE slug = anuncio_slug;
  
  IF anuncio_id IS NOT NULL THEN
    -- Insert the view record
    INSERT INTO public.visualizacoes (anuncio_id, viewer_ip, viewer_agent)
    VALUES (anuncio_id, viewer_ip, viewer_agent);
    
    -- Update the view count in the anuncios table
    UPDATE public.anuncios SET visualizacoes = visualizacoes + 1 WHERE id = anuncio_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to register WhatsApp click for an ad
CREATE OR REPLACE FUNCTION public.register_whatsapp_click(anuncio_slug TEXT, clicker_ip TEXT, clicker_agent TEXT)
RETURNS VOID AS $$
DECLARE
  anuncio_id UUID;
BEGIN
  -- Get the ad ID from the slug
  SELECT id INTO anuncio_id FROM public.anuncios WHERE slug = anuncio_slug;
  
  IF anuncio_id IS NOT NULL THEN
    -- Insert the click record
    INSERT INTO public.whatsapp_cliques (anuncio_id, clicker_ip, clicker_agent)
    VALUES (anuncio_id, clicker_ip, clicker_agent);
    
    -- Update the click count in the anuncios table
    UPDATE public.anuncios SET clics_whatsapp = clics_whatsapp + 1 WHERE id = anuncio_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visualizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_cliques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles policy: Users can read any profile but only edit their own
CREATE POLICY "Users can read any profile"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Anuncios policies: Users can read any ad, but only modify their own
CREATE POLICY "Anyone can view ads"
  ON public.anuncios FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own ads"
  ON public.anuncios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads"
  ON public.anuncios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads"
  ON public.anuncios FOR DELETE
  USING (auth.uid() = user_id);

-- Campaign metrics policies: Users can only access their own metrics
CREATE POLICY "Users can view own metrics"
  ON public.campaign_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own metrics"
  ON public.campaign_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics"
  ON public.campaign_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metrics"
  ON public.campaign_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Create UUID extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
