import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmail, resendConfirmation } from '../utils/Auth';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showAlert = (
    title: string,
    text: string,
    isSuccess: boolean = false
  ) => {
    Alert.alert(title, text, [{ text: 'Aceptar' }]);
  };

  const handleLogin = async () => {
    if (isLoading) return;
    if (!email || !password) {
      showAlert('Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const data = await signInWithEmail(email, password);
      if (data?.session) {
        showAlert('¡Bienvenido!', 'Inicio de sesión exitoso', true);
        navigation.replace('Main');
      } else {
        showAlert(
          'Verificación requerida',
          'Por favor verifica tu correo electrónico para continuar.'
        );
      }
    } catch (err: any) {
      if (
        err?.code === 'email_not_confirmed' ||
        (err?.message && err.message.toLowerCase().includes('email not confirmed'))
      ) {
        try {
          await resendConfirmation(email);
          showAlert(
            'Correo reenviado',
            'Hemos enviado nuevamente el enlace de verificación a tu correo electrónico.',
            true
          );
        } catch (e: any) {
          showAlert('Error', e.message || 'No se pudo reenviar el correo');
        }
        return;
      }
      showAlert('Error de autenticación', err.message || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header con fondo azul degradado */}
          <View style={{
            backgroundColor: '#1e40af',
            height: 260,
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Elementos decorativos del header */}
            <View style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: 'rgba(255,255,255,0.1)'
            }} />
            <View style={{
              position: 'absolute',
              top: 60,
              left: -40,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(255,255,255,0.05)'
            }} />

            {/* Logo e imagen */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingTop: 70
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 36
                }}>
                  INICIAR
                </Text>
                <Text style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 36,
                  marginTop: 4
                }}>
                  SESIÓN
                </Text>
                <Text style={{
                  color: 'rgba(255,255,255,0.9)',
                  marginTop: 12,
                  fontSize: 16,
                  fontWeight: '500'
                }}>
                  Si ya tienes cuenta puedes iniciar sesión
                </Text>
              </View>

              {/* Imagen del logo */}
              <View style={{ position: 'relative' }}>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: 12,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)'
                }}>
                  <Image
                    source={require('../assets/logoderecha.png')}
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Formulario */}
          <View style={{ flex: 1, paddingHorizontal: 24, marginTop: -20 }}>
            <View style={{
              backgroundColor: '#E6E6E6',
              borderRadius: 30,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 3
            }}>
              {/* Email */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  color: '#1e293b',
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 8
                }}>
                  Correo electrónico
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: '#cbd5e1'
                }}>
                  <Mail size={20} color="#64748b" />
                  <TextInput
                    placeholder="Correo"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      color: '#0f172a',
                      fontSize: 16
                    }}
                    placeholderTextColor="#94a3b8"
                    selectionColor="#3B82F6"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={{ marginBottom: 30 }}>
                <Text style={{
                  color: '#1e293b',
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 8
                }}>
                  Contraseña
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: '#cbd5e1'
                }}>
                  <Lock size={20} color="#64748b" />
                  <TextInput
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      color: '#0f172a',
                      fontSize: 16
                    }}
                    placeholderTextColor="#94a3b8"
                    selectionColor="#3B82F6"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: 4 }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#64748b" />
                    ) : (
                      <Eye size={20} color="#64748b" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Botón de Login */}
              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={{
                  backgroundColor: '#1d4ed8',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  shadowColor: '#1d4ed8',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator color="#fff" />
                    <Text style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginLeft: 8
                    }}>
                      Procesando...
                    </Text>
                  </View>
                ) : (
                  <Text style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold'
                  }}>
                    Entrar
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Footer */}
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text style={{
                color: '#64748b',
                fontSize: 14,
                marginBottom: 8
              }}>
                ¿No tienes cuenta?
              </Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={{
                  color: '#1d4ed8',
                  fontSize: 14,
                  fontWeight: 'bold',
                  textDecorationLine: 'underline'
                }}>
                  Regístrate
                </Text>
              </Pressable>
            </View>

            {/* Espacio para el teclado */}
            <View style={{ height: 20 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}