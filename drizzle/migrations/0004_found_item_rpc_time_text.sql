DROP FUNCTION IF EXISTS public.create_found_item(text[], text, text, text[], text, date, time, text, boolean);

CREATE OR REPLACE FUNCTION public.create_found_item(
  p_category text[],
  p_name text,
  p_description text,
  p_tags text[],
  p_location text,
  p_date_found date,
  p_time_found text,
  p_image_url text,
  p_is_sensitive boolean
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  INSERT INTO public.found_items (
    category, name, description, tags, location, date_found, time_found, image_url, is_sensitive, status
  ) VALUES (
    coalesce(p_category, '{}'), p_name, nullif(p_description, ''), coalesce(p_tags, '{}'),
    p_location, p_date_found, nullif(p_time_found, '')::time, nullif(p_image_url, ''),
    coalesce(p_is_sensitive, false), 'available'
  )
  RETURNING code INTO v_code;

  RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION public.create_found_item(text[], text, text, text[], text, date, text, text, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.create_found_item(text[], text, text, text[], text, date, text, text, boolean) TO anon, authenticated, service_role;