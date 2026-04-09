-- Grant Admin Role to elgi@smptashfia.sch.id
DO $$
DECLARE
  v_user_id UUID;
  v_admin_role_id UUID;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'elgi@smptashfia.sch.id';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User elgi@smptashfia.sch.id not found in auth.users';
  END IF;

  -- Get admin role ID
  SELECT id INTO v_admin_role_id
  FROM public.roles
  WHERE name = 'admin';

  IF v_admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Admin role not found in public.roles';
  END IF;

  -- Insert user role mapping (ignore if exists)
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (v_user_id, v_admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RAISE NOTICE 'Admin role granted to elgi@smptashfia.sch.id (user_id: %)', v_user_id;
END $$;
