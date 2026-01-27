import { supabase } from '../supabase/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';

export async function uploadImageAsync(uri: string, bucket = 'productos', path?: string) {
  try {
    const extMatch = uri.match(/\.([0-9a-zA-Z]+)(?:\?.*)?$/);
    const ext = extMatch ? extMatch[1] : 'jpg';
    const fileName = path ?? `images/${Date.now()}.${ext}`;
    let fileData: any;

    if (Platform.OS === 'web') {
      // On web, fetch works for local blobs
      const response = await fetch(uri);
      fileData = await response.blob();
    } else {
      // On native, use FileSystem to read as Base64 then decode
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      fileData = decode(base64);
    }

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, fileData, {
      contentType: `image/${ext}`,
      upsert: true,
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData?.publicUrl ?? null;
  } catch (err) {
    console.error("Upload error:", err);
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

export default {
  uploadImageAsync,
  getPublicUrl,
  removeFile,
};
