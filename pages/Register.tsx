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
  Dimensions,
} from 'react-native';
import { signUpWithEmail } from '../utils/Auth';
import { Eye, EyeOff, Mail, Lock, User, Shield, ArrowLeft, CheckCircle } from 'lucide-react-native';

export default function Register({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        newErrors.name = value.trim() ? '' : 'El nombre es requerido';
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'El correo es requerido';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Correo electrónico inválido';
        } else {
          newErrors.email = '';
        }
        break;
      case 'password':
        if (value.length < 6) {
          newErrors.password = 'Mínimo 6 caracteres';
        } else {
          newErrors.password = '';
        }
        if (confirmPassword && value !== confirmPassword) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }
        break;
      case 'confirmPassword':
        if (value !== password) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
        } else {
          newErrors.confirmPassword = '';
        }
        break;
      case 'phone':
        if (value && !/^[0-9+\-\s()]{10,}$/.test(value)) {
          newErrors.phone = 'Teléfono inválido';
        } else {
          newErrors.phone = '';
        }
        break;
    }

    setErrors(newErrors);
    return !newErrors[field as keyof typeof newErrors];
  };

  // Alerta de éxito usando Alert nativo
  const showSuccessAlert = () => {
    Alert.alert(
      '¡Registro Exitoso!',
      `Tu cuenta ha sido creada exitosamente.\n\nHemos enviado un correo de confirmación a:\n${email}`,
      [
        {
          text: 'Ir al Login',
          onPress: () => navigation.navigate('Login'),
          style: 'default'
        }
      ],
      { cancelable: false }
    );
  };

  // Alerta de error usando Alert nativo
  const showErrorAlert = (message: string) => {
    Alert.alert(
      'Error de Registro',
      message,
      [
        {
          text: 'Intentar de nuevo',
          style: 'default'
        }
      ],
      { cancelable: true }
    );
  };

  // Alerta de formulario incompleto usando Alert nativo
  const showFormErrorsAlert = () => {
    const errorMessages = [];
    if (errors.name) errorMessages.push(`• ${errors.name}`);
    if (errors.email) errorMessages.push(`• ${errors.email}`);
    if (errors.password) errorMessages.push(`• ${errors.password}`);
    if (errors.confirmPassword) errorMessages.push(`• ${errors.confirmPassword}`);
    if (errors.phone) errorMessages.push(`• ${errors.phone}`);

    Alert.alert(
      'Formulario Incompleto',
      'Por favor corrige los siguientes errores:\n\n' + errorMessages.join('\n'),
      [
        {
          text: 'Entendido',
          style: 'default'
        }
      ],
      { cancelable: true }
    );
  };

  const validateForm = () => {
    const fields = [
      { key: 'name', value: name },
      { key: 'email', value: email },
      { key: 'password', value: password },
      { key: 'confirmPassword', value: confirmPassword }
    ];

    let isValid = true;

    fields.forEach(({ key, value }) => {
      if (!validateField(key, value)) {
        isValid = false;
      }
    });

    if (!isValid) {
      showFormErrorsAlert();
    }

    return isValid;
  };

  // Alerta de requisitos de contraseña usando Alert nativo
  const showPasswordRequirements = () => {
    const hasMinLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    Alert.alert(
      'Requisitos de Contraseña',
      'Tu contraseña debe cumplir con:\n\n' +
      `• Mínimo 6 caracteres ${hasMinLength ? '✓' : '✗'}\n` +
      `• Al menos una mayúscula (recomendado) ${hasUpperCase ? '✓' : '✗'}\n` +
      `• Al menos un número (recomendado) ${hasNumber ? '✓' : '✗'}\n\n` +
      'Nota: Los requisitos marcados con ✗ son recomendados pero no obligatorios.',
      [
        {
          text: 'Entendido',
          style: 'default'
        }
      ],
      { cancelable: true }
    );
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await signUpWithEmail(email, password, {
        nombre: name,
        telefono: phone
      });
      showSuccessAlert();
    } catch (err: any) {
      console.error('Error en registro:', err);

      // Manejo específico de errores comunes
      if (err?.message?.includes('email already registered') || err?.code === 'user_already_exists') {
        showErrorAlert('Este correo electrónico ya está registrado. Por favor, usa otro email o inicia sesión.');
      } else if (err?.message?.includes('weak password') || err?.code === 'weak_password') {
        showErrorAlert('La contraseña es muy débil. Por favor, usa una contraseña más segura (mínimo 6 caracteres).');
      } else if (err?.message?.includes('invalid email')) {
        showErrorAlert('El correo electrónico no es válido. Por favor, verifica el formato.');
      } else if (err?.message?.includes('Network') || err?.message?.includes('connection')) {
        showErrorAlert('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
      } else {
        showErrorAlert(err.message || 'No se pudo completar el registro. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-blue-50 to-white"
      style={{ backgroundColor: '#f8fafc' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* HEADER MEJORADO PARA MÓVIL */}
        <View className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 h-64 rounded-b-[50px] px-5 pt-12 relative overflow-hidden">
          {/* Elementos decorativos */}
          <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/20" />
          <View className="absolute top-20 -left-10 w-32 h-32 rounded-full bg-blue-400/15" />

          <Pressable
            onPress={() => navigation.replace('Login')}
            className="absolute top-12 left-5 bg-white/30 p-3 rounded-full active:bg-white/40"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              zIndex: 50,
              elevation: 50,
            }}
          >
            <ArrowLeft size={24} color="white" />
          </Pressable>

          <View className="flex-1 justify-center items-center pt-8">
            <View className="relative">
              <View className="p-5 rounded-2xl bg-white/25 backdrop-blur-sm border border-white/30">
                <User size={isSmallScreen ? 32 : 36} color="#2563EB" />
              </View>
              <View className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full border-2 border-blue-600">
                <Shield size={16} color="#2563EB" />
              </View>
            </View>

            <Text className="text-3xl font-bold text-[#2563EB] mt-6 text-center">
              Crear Cuenta
            </Text>
            <Text className="text-blue-100/90 mt-2 text-center text-base max-w-xs">
              Regístrate para comenzar tu experiencia
            </Text>
          </View>
        </View>

        {/* FORM MEJORADO PARA MÓVIL */}
        <View className="flex-1 px-5 -mt-8">
          <View className="bg-white rounded-[30px] p-6 shadow-2xl shadow-blue-900/10 border border-blue-100">
            {/* Indicador de pasos (opcional para UX) */}
            <View className="flex-row justify-center mb-6">
              <View className="w-8 h-1 rounded-full bg-blue-600 mr-1" />
              <View className="w-8 h-1 rounded-full bg-blue-300 mr-1" />
              <View className="w-8 h-1 rounded-full bg-blue-300" />
            </View>

            {/* Nombre */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
                  <Text className="text-blue-600 font-bold text-xs">1</Text>
                </View>
                <Text className="text-blue-900 font-bold text-base">
                  Nombre completo
                </Text>
              </View>
              <View className="flex-row items-center rounded-2xl px-4 py-4 border-2 border-blue-200 bg-white">
                <User size={22} color="#2563EB" />
                <TextInput
                  placeholder="Tu nombre"
                  value={name}
                  onChangeText={setName}
                  className="flex-1 ml-3 text-blue-900 text-base"
                  placeholderTextColor="#93C5FD"
                  selectionColor="#3B82F6"
                  autoComplete="name"
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
                  <Text className="text-blue-600 font-bold text-xs">2</Text>
                </View>
                <Text className="text-blue-900 font-bold text-base">
                  Correo electrónico
                </Text>
              </View>
              <View className="flex-row items-center rounded-2xl px-4 py-4 border-2 border-blue-200 bg-white">
                <Mail size={22} color="#2563EB" />
                <TextInput
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 ml-3 text-blue-900 text-base"
                  placeholderTextColor="#93C5FD"
                  selectionColor="#3B82F6"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-8">
              <View className="flex-row items-center mb-2">
                <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2">
                  <Text className="text-blue-600 font-bold text-xs">3</Text>
                </View>
                <Text className="text-blue-900 font-bold text-base">
                  Contraseña
                </Text>
              </View>

              <View className="flex-row items-center rounded-2xl px-4 py-4 border-2 border-blue-200 bg-white">
                <Lock size={22} color="#2563EB" />

                <TextInput
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 text-blue-900 text-base"
                  placeholderTextColor="#93C5FD"
                  selectionColor="#3B82F6"
                  autoComplete="password"
                />

                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={22} color="#64748B" />
                  ) : (
                    <Eye size={22} color="#64748B" />
                  )}
                </Pressable>
              </View>

              <Text className="text-blue-500 text-xs mt-2 ml-1">
                ⓘ La contraseña debe tener al menos 6 caracteres
              </Text>
            </View>

            {/* BOTÓN PRINCIPAL - AZUL SÓLIDO PARA MÓVIL */}
            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              className={`
                w-full rounded-2xl py-5 items-center justify-center
                ${isLoading
                  ? 'bg-blue-400'
                  : 'bg-blue-600 active:bg-blue-700'
                }
                shadow-lg shadow-blue-500/30
              `}
              style={{
                elevation: 8,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <View className="flex-row items-center">
                  <CheckCircle size={24} color="white" />
                  <Text className="text-white font-bold text-lg ml-3">
                    Crear cuenta
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Términos y condiciones (opcional para UX móvil) */}
            <Text className="text-gray-500 text-xs text-center mt-4 px-2">
              Al registrarte, aceptas nuestros{' '}
              <Text className="text-blue-600">Términos de servicio</Text> y{' '}
              <Text className="text-blue-600">Política de privacidad</Text>
            </Text>

            {/* SEPARADOR */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-400 text-sm">¿Ya tienes cuenta?</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* BOTÓN LOGIN ALTERNATIVO */}
            <Pressable
              onPress={() => navigation.navigate('Login')}
              className="w-full rounded-2xl py-4 items-center justify-center border-2 border-blue-200 bg-white active:bg-blue-50"
            >
              <Text className="text-blue-600 font-bold text-base">
                Iniciar sesión
              </Text>
            </Pressable>

          </View>

          {/* Espacio adicional para teclado en móvil */}
          <View className="h-10" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}