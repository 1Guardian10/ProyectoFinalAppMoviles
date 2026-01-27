import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmail, resendConfirmation } from '../utils/Auth';
import { Svg, Path } from 'react-native-svg';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const { width, height } = useWindowDimensions();

  // Breakpoints mejorados para web
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLargeDesktop = width >= 1280;

  // Función para mostrar alertas
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

  // Estilos condicionales para web
  const getContainerStyles = () => {
    if (isMobile) {
      return 'flex-1 p-4';
    } else if (isTablet) {
      return 'flex-row items-center justify-center p-8';
    } else {
      return 'flex-row items-center justify-center p-12';
    }
  };

  const getLeftPanelStyles = () => {
    if (isMobile) {
      return 'hidden';
    } else if (isTablet) {
      return 'flex-1 mr-8 max-w-md';
    } else {
      return 'flex-1 mr-12 max-w-xl';
    }
  };

  const getRightPanelStyles = () => {
    if (isMobile) {
      return 'w-full';
    } else if (isTablet) {
      return 'w-96';
    } else if (isDesktop) {
      return 'w-108';
    } else {
      return 'w-120';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center p-6">

            {/* Header */}
            <View className="mb-8 flex-row items-center justify-between">
              <View>
                <Text className="text-4xl font-extrabold text-blue-800">INICIAR</Text>
                <Text className="text-4xl font-extrabold text-blue-800">SESIÓN</Text>
                <Text className="text-gray-400 mt-2">
                  Si ya tienes cuenta puedes iniciar sesión
                </Text>
              </View>

              <Image
                source={require('../assets/ramenizquierda.png')}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>

            {/* Card */}
            <View className="bg-[#E6E6E6] rounded-3xl p-6">

              {/* Email */}
              <View className="mb-5">
                <Text className="text-blue-900 font-semibold mb-2">
                  Correo electrónico
                </Text>
                <View className="bg-white rounded-xl px-4 py-3 border border-gray-200">
                  <TextInput
                    placeholder="Correo"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="text-gray-800"
                  />
                </View>
              </View>

              {/* Password */}
              <View className="mb-6">
                <Text className="text-blue-900 font-semibold mb-2">
                  Contraseña
                </Text>
                <View className="bg-white rounded-xl px-4 py-3 border border-gray-200">
                  <TextInput
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="text-gray-800"
                  />
                </View>
              </View>

              {/* Button */}
              <Pressable
                onPress={handleLogin}
                className="bg-blue-700 rounded-xl py-4 items-center"
              >
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="#fff" />
                    <Text className="text-white ml-2 font-bold">
                      Procesando...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Entrar
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Footer */}
            <View className="items-center mt-8">
              <Text className="text-gray-600">
                ¿No tienes cuenta?
              </Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text className="text-blue-700 font-bold underline">
                  Regístrate
                </Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
