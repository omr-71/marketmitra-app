CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, language, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'en',
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, full_name, language, phone)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data ->> 'full_name', ''),
  'en',
  NULL
FROM auth.users AS users
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profiles AS profiles
  WHERE profiles.id = users.id
)
ON CONFLICT (id) DO NOTHING;
