CREATE SEQUENCE IF NOT EXISTS public.found_item_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.recovery_request_code_seq START 1;

CREATE TABLE public.found_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT 'ACH-' || lpad(nextval('public.found_item_code_seq')::text, 6, '0'),
  category text[] NOT NULL DEFAULT '{}',
  name text NOT NULL,
  description text,
  tags text[] NOT NULL DEFAULT '{}',
  brand text,
  model text,
  color text,
  location text NOT NULL,
  date_found date NOT NULL,
  time_found time,
  image_url text,
  is_sensitive boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.found_items TO anon;
GRANT SELECT, INSERT ON public.found_items TO authenticated;
GRANT ALL ON public.found_items TO service_role;

ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Itens publicos visiveis"
ON public.found_items FOR SELECT TO anon, authenticated
USING (is_sensitive = false AND status = 'available');

CREATE POLICY "Qualquer um pode cadastrar item"
ON public.found_items FOR INSERT TO anon, authenticated
WITH CHECK (status = 'available');

CREATE TABLE public.recovery_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code text NOT NULL UNIQUE DEFAULT 'APR-' || lpad(nextval('public.recovery_request_code_seq')::text, 6, '0'),
  found_item_id uuid NOT NULL REFERENCES public.found_items(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  cpf text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  institutional_id text NOT NULL,
  date_lost text,
  location_lost text,
  ownership_description text NOT NULL,
  proof_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.recovery_requests TO anon;
GRANT INSERT ON public.recovery_requests TO authenticated;
GRANT ALL ON public.recovery_requests TO service_role;

ALTER TABLE public.recovery_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode solicitar retirada"
ON public.recovery_requests FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pending');