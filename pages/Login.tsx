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
  TouchableOpacity,
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
        enabled={height < 800}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className={getContainerStyles()}>

            {/* Panel izquierdo - Solo visible en web/tablet */}
            {!isMobile && (
              <View className={getLeftPanelStyles()}>
                <View className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 h-full flex justify-center">
                  <View className="mb-12">
                    <Text className="text-5xl font-bold text-blue-900 mb-4">
                      Bienvenido de vuelta
                    </Text>
                    <Text className="text-xl text-gray-600">
                      Accede a tu cuenta para gestionar tus pedidos,
                      ver historial y disfrutar de beneficios exclusivos.
                    </Text>
                  </View>

                  <View className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                    <View className="flex-row items-center mb-4">
                      <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                        <Text className="text-blue-600 font-bold">✓</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-800">Gestión fácil de pedidos</Text>
                        <Text className="text-gray-600 text-sm">Sigue tus pedidos en tiempo real</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mb-4">
                      <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
                        <Text className="text-green-600 font-bold">★</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-800">Ofertas exclusivas</Text>
                        <Text className="text-gray-600 text-sm">Accede a descuentos especiales</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                        <Text className="text-purple-600 font-bold">⚡</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-800">Pago rápido</Text>
                        <Text className="text-gray-600 text-sm">Guarda tus métodos de pago</Text>
                      </View>
                    </View>
                  </View>

                  <Image
                    source={require('../assets/ramenizquierda.png')}
                    className="w-64 h-64 self-center"
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}

            {/* Panel derecho - Formulario de login */}
            <View className={getRightPanelStyles()}>
              {/* Header móvil */}
              {isMobile && (
                <View className="mb-6 pt-2">

                  {/* Botón volver atrás */}
                  <Pressable
                    onPress={() => navigation.goBack()}
                    className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mb-4"
                  >
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M15 18L9 12L15 6"
                        stroke="#0B4CB8"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </Pressable>

                  {/* Título + Imagen en fila */}
                  <View className="flex-row items-center justify-between mb-2">
                    {/* Texto */}
                    <View>
                      <Text className="text-4xl font-extrabold text-blue-800 leading-none">
                        INICIAR
                      </Text>
                      <Text className="text-4xl font-extrabold text-blue-800 leading-none">
                        SESIÓN
                      </Text>
                    </View>

                    {/* Imagen del ramen a la derecha */}
                    <Image
                      source={require('../assets/ramenizquierda.png')}
                      className="w-20 h-20"
                      resizeMode="contain"
                    />
                  </View>

                  {/* Subtítulo */}
                  <Text className="text-gray-400 text-base font-semibold">
                    Si ya tienes cuenta puedes iniciar sesión
                  </Text>
                </View>
              )}

              {/* Header web */}
              {!isMobile && (
                <View className="mb-8">
                  <Text className="text-4xl font-bold text-blue-900 mb-3">
                    Iniciar Sesión
                  </Text>
                  <Text className="text-gray-500 text-lg">
                    Ingresa tus credenciales para continuar
                  </Text>
                </View>
              )}

              {/* Tarjeta de formulario */}
              <View className={`
                bg-white rounded-2xl p-8
                ${!isMobile ? 'shadow-xl border border-gray-100' : 'bg-[#E6E6E6] rounded-3xl p-6'}
              `}>
                {/* Email */}
                <View className="mb-6">
                  <Text className="text-blue-900 font-semibold mb-2">
                    Correo electrónico
                  </Text>
                  <View
                    className={`
                      bg-white rounded-xl px-5 py-4 border
                      ${isFocusedEmail ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200'}
                      transition-all duration-200
                    `}
                  >
                    <TextInput
                      placeholder="ejemplo@gmail.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setIsFocusedEmail(true)}
                      onBlur={() => setIsFocusedEmail(false)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      className="text-gray-800 text-base"
                    />
                  </View>
                </View>

                {/* Password */}
                <View className="mb-6">
                  <Text className="text-blue-900 font-semibold mb-2">
                    Contraseña
                  </Text>
                  <View
                    className={`
                      bg-white rounded-xl px-5 py-4 border
                      ${isFocusedPassword ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200'}
                      transition-all duration-200
                    `}
                  >
                    <TextInput
                      placeholder="Ingresa tu contraseña"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setIsFocusedPassword(true)}
                      onBlur={() => setIsFocusedPassword(false)}
                      secureTextEntry
                      className="text-gray-800 text-base"
                    />
                  </View>
                  <TouchableOpacity className="self-end mt-2">
                    <Text className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200">
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Login button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  className={`
                    bg-gradient-to-r from-blue-600 to-blue-700 
                    rounded-xl py-4 items-center mb-6
                    ${isLoading ? 'opacity-90' : 'hover:opacity-95 active:scale-[0.99]'}
                    transition-all duration-200 shadow-md hover:shadow-lg
                  `}
                >
                  {isLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="#fff" size="small" />
                      <Text className="text-white font-bold text-lg ml-2">
                        Procesando...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white font-bold text-lg">
                      Iniciar Sesión
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Separator */}
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="mx-4 text-gray-500 font-medium text-sm">
                    O continúa con
                  </Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Google button */}
                <TouchableOpacity
                  className="
                    bg-white rounded-xl py-3 items-center border border-gray-200
                    hover:bg-gray-50 active:bg-gray-100 shadow-sm
                    transition-all duration-200 mb-6
                  "
                >
                  <View className="flex-row items-center justify-center">
                    <Image
                      source={require('../assets/google-icon.png')}
                      className="w-5 h-5 mr-3"
                      resizeMode="contain"
                    />
                    <Text className="font-semibold text-gray-700">
                      Google
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Footer web */}
                {!isMobile && (
                  <View className="pt-6 border-t border-gray-100">
                    <Text className="text-gray-600 text-center">
                      ¿Aún no tienes una cuenta?{' '}
                      <Text
                        className="text-blue-700 font-bold hover:text-blue-800 cursor-pointer transition-colors duration-200"
                        onPress={() => navigation.navigate('Register')}
                      >
                        Crear cuenta
                      </Text>
                    </Text>
                  </View>
                )}
              </View>

              {/* Footer móvil */}
              {isMobile && (
                <View className="items-center mt-8">
                  <Text className="text-gray-600 text-center">
                    ¿Aún no tienes una cuenta?{' '}
                    <Text
                      className="text-blue-700 font-bold underline"
                      onPress={() => navigation.navigate('Register')}
                    >
                      Regístrate aquí
                    </Text>
                  </Text>
                </View>
              )}

              {/* Términos y condiciones - Solo web */}
              {!isMobile && (
                <View className="mt-6">
                  <Text className="text-gray-400 text-xs text-center">
                    Al iniciar sesión, aceptas nuestros{' '}
                    <Text className="text-blue-600">Términos de servicio</Text> y{' '}
                    <Text className="text-blue-600">Política de privacidad</Text>
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
