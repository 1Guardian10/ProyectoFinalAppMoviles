-- Políticas RLS recomendadas para la tabla `restaurantes`
-- Ejecutar en el SQL editor de Supabase

-- 1) Asegurarse de habilitar RLS (si quieres mantenerla habilitada):
-- ALTER TABLE public.restaurantes ENABLE ROW LEVEL SECURITY;

-- 2) Permitir SELECT a usuarios autenticados (opcional, ajusta según necesidad):
CREATE POLICY "Allow authenticated select on restaurantes" ON public.restaurantes
FOR SELECT
TO authenticated
USING (true);

-- 3) Permitir INSERT solo si el campo propietario_id coincide con el usuario autenticado
CREATE POLICY "Allow owner insert on restaurantes" ON public.restaurantes
FOR INSERT
TO authenticated
WITH CHECK (propietario_id = auth.uid());

-- 4) Permitir que el propietario pueda ver/editar/borrar su restaurante
CREATE POLICY "Owner manage restaurantes" ON public.restaurantes
FOR ALL
TO authenticated
USING (propietario_id = auth.uid())
WITH CHECK (propietario_id = auth.uid());

-- 5) Permitir que el Admin vea y haga todo (ajusta nombre de rol si difiere)
CREATE POLICY "Admin full access restaurantes" ON public.restaurantes
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.usuarios u JOIN public.roles r ON u.rol_id = r.id WHERE u.id = auth.uid() AND r.nombre = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.usuarios u JOIN public.roles r ON u.rol_id = r.id WHERE u.id = auth.uid() AND r.nombre = 'admin')
);

-- Notas:
-- - En tu front ya añadí `propietario_id: authUser.id` al insert de restaurantes.
-- - Ejecuta estas sentencias en el SQL editor de Supabase. Si prefieres pruebas rápidas, puedes temporalmente
--   deshabilitar RLS: ALTER TABLE public.restaurantes DISABLE ROW LEVEL SECURITY;
-- - Ajusta/añade políticas para SELECT/UPDATE/DELETE por separado si necesitas reglas distintas para cada acción.
CREATE POLICY "Admin full access usuarios" ON public.usuarios
FOR ALL
TO authenticated
USING (
EXISTS (
SELECT 1 FROM public.usuarios u JOIN public.roles r ON u.rol_id = r.id
WHERE u.id = auth.uid() AND r.nombre = 'admin'
)
)
WITH CHECK (
EXISTS (
SELECT 1 FROM public.usuarios u JOIN public.roles r ON u.rol_id = r.id
WHERE u.id = auth.uid() AND r.nombre = 'admin'
)
);