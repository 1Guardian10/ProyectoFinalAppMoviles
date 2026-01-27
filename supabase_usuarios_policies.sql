-- Elimina políticas problemáticas y crea una función SECURITY DEFINER
-- y una política segura para la tabla `usuarios`.
-- Ejecutar en el SQL editor de Supabase con una cuenta con permisos adecuados.

-- 1) Eliminar políticas previas sobre `usuarios` que puedan causar recursión
DROP POLICY IF EXISTS "Admin ve todos los perfiles" ON public.usuarios;
DROP POLICY IF EXISTS "Admin full access usuarios" ON public.usuarios;

-- 2) Crear función que verifica si el usuario autenticado tiene rol 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios u
    JOIN public.roles r ON u.rol_id = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'admin'
  );
$$;

-- 3) Crear política que utiliza la función (evita recursión porque la función
-- se ejecuta con privilegios del definidor)
DROP POLICY IF EXISTS "Admin full access usuarios v2" ON public.usuarios;
CREATE POLICY "Admin full access usuarios v2" ON public.usuarios
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4) Permitir que cada usuario vea su propio perfil
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.usuarios;
CREATE POLICY "Usuarios ven su propio perfil" ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

-- NOTA:
-- - Ejecuta este archivo en el SQL editor de Supabase. Si hay errores de permisos
--   al crear la función, usa la cuenta del proyecto (SQL editor en la consola).
-- - Tras ejecutar, prueba desde la app: el usuario admin ya no debería generar
--   el error de recursión y podrá leer/editar `usuarios` según la política.
