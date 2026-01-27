import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../supabase/supabase';

// Esta línea es vital para que el navegador se cierre solo en algunos sistemas
WebBrowser.maybeCompleteAuthSession();

export const signInWithGoogle = async (): Promise<boolean> => {
  try {
    const redirectTo = makeRedirectUri({ scheme: 'moshi-app' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    if (data?.url) {
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (res.type === 'success' && res.url) {
        // Manejo de la URL con el polyfill que instalamos
        const url = new URL(res.url.replace('#', '?'));
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          console.log('Sesión de Google iniciada correctamente');
          return true;
        }
      }
    }
    return false;
  } catch (err) {
    console.error('Error en Google Auth:', err);
    return false;
  }
};

export const signUpWithEmail = async (email: string, password: string, metadata?: Record<string, any>) => {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  return await supabase.auth.getSession();
};

export const resendConfirmation = async (email: string) => {
  const { data, error } = await supabase.auth.resend({ email, type: 'signup' });
  if (error) throw error;
  return data;
};