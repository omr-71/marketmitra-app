INSERT INTO public.user_roles (user_id, role)
VALUES ('6ddd7c59-6cb2-4e0b-bd09-990f09bca389', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;