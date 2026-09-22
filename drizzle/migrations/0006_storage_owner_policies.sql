-- Remove políticas de storage abertas a anon/authenticated.
-- Uploads e leituras de fotos passam a ser feitos por server functions (service role).
drop policy if exists "Upload de fotos de itens" on storage.objects;
drop policy if exists "Leitura de fotos de itens" on storage.objects;
drop policy if exists "Upload de comprovantes" on storage.objects;
