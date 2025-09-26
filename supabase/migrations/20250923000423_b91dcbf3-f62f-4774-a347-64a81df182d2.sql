-- Corrigir função incrementar_pontos com search_path seguro
CREATE OR REPLACE FUNCTION incrementar_pontos(user_id uuid, pontos integer)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET pontos = profiles.pontos + incrementar_pontos.pontos
  WHERE id = incrementar_pontos.user_id;
END;
$$;

-- Corrigir função handle_new_user com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (new.id, new.raw_user_meta_data->>'nome', new.email);
  RETURN new;
END;
$$;