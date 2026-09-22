CREATE POLICY "Upload de fotos de itens"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'item-photos');

CREATE POLICY "Leitura de fotos de itens"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'item-photos');

CREATE POLICY "Upload de comprovantes"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'proofs');