import { supabase } from '../supabase/supabase';

/**
 * Sube una imagen local (uri) a Supabase Storage y devuelve la URL pública.
 * - `uri`: URI local (expo image picker devuelve algo como "file://..." o una URI de contenido).
 * - `bucket`: nombre del bucket en Supabase (ej. 'productos').
 * - `path`: ruta/archivo dentro del bucket (si no se pasa, se generará un nombre timestamp).
 *
 * Requiere que el bucket exista y tenga permisos apropiados (público o políticas y signed urls).
 */
export async function uploadImageAsync(uri: string, bucket = 'productos', path?: string) {
  try {
    // Generar nombre si no se pasa
    const extMatch = uri.match(/\.([0-9a-zA-Z]+)(?:\?.*)?$/);
    const ext = extMatch ? extMatch[1] : 'jpg';
    const fileName = path ?? `images/${Date.now()}.${ext}`;

    // Fetch para obtener blob desde la URI local (funciona en Expo)
    const response = await fetch(uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, blob, {
      contentType: (blob as any).type || `image/${ext}`,
      upsert: true,
    });

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData?.publicUrl ?? null;
  } catch (err) {
    throw err;
  }
}

/** Devuelve la URL pública de un archivo en el bucket (o null si no existe). */
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

/** Eliminar un archivo del bucket */
export async function removeFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
}

/**
 * Notas de integración:
 * - En Expo instala `expo-image-picker` para seleccionar imágenes desde la galería:
 *   `expo install expo-image-picker`
 * - Pide permisos con `ImagePicker.requestMediaLibraryPermissionsAsync()` antes de usar.
 * - Asegúrate de crear el bucket en Supabase (ej. 'productos') y configurar políticas/CORS.
 */

export default {
  uploadImageAsync,
  getPublicUrl,
  removeFile,
};
