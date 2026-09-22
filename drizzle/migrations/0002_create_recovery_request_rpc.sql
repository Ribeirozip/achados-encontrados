CREATE OR REPLACE FUNCTION public.create_recovery_request(
  p_found_item_id uuid,
  p_full_name text,
  p_cpf text,
  p_phone text,
  p_email text,
  p_institutional_id text,
  p_date_lost text,
  p_location_lost text,
  p_ownership_description text,
  p_proof_url text
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  INSERT INTO public.recovery_requests (
    found_item_id, full_name, cpf, phone, email, institutional_id,
    date_lost, location_lost, ownership_description, proof_url, status
  ) VALUES (
    p_found_item_id, p_full_name, p_cpf, p_phone, p_email, p_institutional_id,
    nullif(p_date_lost, ''), nullif(p_location_lost, ''), p_ownership_description,
    nullif(p_proof_url, ''), 'pending'
  )
  RETURNING request_code INTO v_code;

  RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION public.create_recovery_request(uuid, text, text, text, text, text, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_recovery_request(uuid, text, text, text, text, text, text, text, text, text) TO anon, authenticated, service_role;