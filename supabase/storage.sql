
-- Create storage buckets for ad images
INSERT INTO storage.buckets (id, name, public)
VALUES ('anuncios', 'anuncios', true);

-- Policy to allow authenticated users to upload files to the anuncios bucket
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'anuncios');

-- Policy to allow public access to view files in the anuncios bucket
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'anuncios');

-- Policy to allow users to update and delete their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'anuncios' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'anuncios' AND auth.uid() = owner);
