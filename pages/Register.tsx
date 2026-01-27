import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { signUpWithEmail } from '../utils/Auth';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, CheckCircle } from 'lucide-react-native';

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
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header con gradiente */}
        <View className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 h-72 rounded-b-[50px] px-6 pt-16 shadow-xl shadow-blue-900/30">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-16 left-6 z-10 bg-white/20 p-3 rounded-full active:bg-white/30"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1 justify-center items-center mt-8">
            <View className="bg-white/20 p-4 rounded-2xl mb-4">
              <User size={40} color="white" />
            </View>
            <Text className="text-white text-3xl font-bold text-center mb-8">
              Crear Cuenta Nueva
            </Text>
            <Text className="text-blue-100 text-base mt-3 text-center px-8 leading-6">
              Únete para gestionar tu local de manera profesional y eficiente
            </Text>
          </View>
        </View>

        {/* Formulario */}
        <View className="flex-1 px-6 -mt-16 pb-10">
          <View className="bg-white rounded-3xl p-8 shadow-2xl shadow-blue-900/20 border border-blue-100">

            {/* Campo Nombre */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-blue-900 font-bold text-base ml-1">
                  Nombre completo
                </Text>
                {errors.name ? (
                  <Text className="text-red-500 text-xs font-medium">
                    {errors.name}
                  </Text>
                ) : null}
              </View>
              <View className={`flex-row items-center rounded-2xl px-4 py-4 border-2 ${errors.name ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-blue-50'
                }`}>
                <User size={22} color={errors.name ? "#ef4444" : "#2563EB"} className="mr-3" />
                <TextInput
                  placeholder="Ingresa tu nombre completo"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    validateField('name', text);
                  }}
                  className="flex-1 text-blue-900 text-base"
                  placeholderTextColor="#93C5FD"
                  autoCapitalize="words"
                  onBlur={() => validateField('name', name)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Campo Teléfono */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-blue-900 font-bold text-base ml-1">
                  Teléfono
                </Text>
                {errors.phone ? (
                  <Text className="text-red-500 text-xs font-medium">
                    {errors.phone}
                  </Text>
                ) : null}
              </View>
              <View className={`flex-row items-center rounded-2xl px-4 py-4 border-2 ${errors.phone ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-blue-50'
                }`}>
                <Phone size={22} color={errors.phone ? "#ef4444" : "#2563EB"} className="mr-3" />
                <TextInput
                  placeholder="Ej: +51 987654321"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    validateField('phone', text);
                  }}
                  keyboardType="phone-pad"
                  className="flex-1 text-blue-900 text-base"
                  placeholderTextColor="#93C5FD"
                  onBlur={() => validateField('phone', phone)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Campo Email */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-blue-900 font-bold text-base ml-1">
                  Correo electrónico
                </Text>
                {errors.email ? (
                  <Text className="text-red-500 text-xs font-medium">
                    {errors.email}
                  </Text>
                ) : null}
              </View>
              <View className={`flex-row items-center rounded-2xl px-4 py-4 border-2 ${errors.email ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-blue-50'
                }`}>
                <Mail size={22} color={errors.email ? "#ef4444" : "#2563EB"} className="mr-3" />
                <TextInput
                  placeholder="ejemplo@empresa.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    validateField('email', text);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 text-blue-900 text-base"
                  placeholderTextColor="#93C5FD"
                  onBlur={() => validateField('email', email)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Campo Contraseña */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <Text className="text-blue-900 font-bold text-base ml-1">
                    Contraseña
                  </Text>
                  <TouchableOpacity
                    onPress={showPasswordRequirements}
                    className="ml-2"
                    disabled={isLoading}
                  >
                    <Text className="text-blue-500 text-xs">Requisitos</Text>
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <Text className="text-red-500 text-xs font-medium">
                    {errors.password}
                  </Text>
                ) : null}
              </View>
              <View className={`flex-row items-center rounded-2xl px-4 py-4 border-2 ${errors.password ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-blue-50'
                }`}>
                <Lock size={22} color={errors.password ? "#ef4444" : "#2563EB"} className="mr-3" />
                <TextInput
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    validateField('password', text);
                  }}
                  secureTextEntry={!showPassword}
                  className="flex-1 text-blue-900 text-base"
                  placeholderTextColor="#93C5FD"
                  onBlur={() => validateField('password', password)}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff size={22} color={errors.password ? "#ef4444" : "#64748b"} />
                  ) : (
                    <Eye size={22} color={errors.password ? "#ef4444" : "#64748b"} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo Confirmar Contraseña */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-blue-900 font-bold text-base ml-1">
                  Confirmar contraseña
                </Text>
                {errors.confirmPassword ? (
                  <Text className="text-red-500 text-xs font-medium">
                    {errors.confirmPassword}
                  </Text>
                ) : null}
              </View>
              <View className={`flex-row items-center rounded-2xl px-4 py-4 border-2 ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-blue-50'
                }`}>
                <Lock size={22} color={errors.confirmPassword ? "#ef4444" : "#2563EB"} className="mr-3" />
                <TextInput
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    validateField('confirmPassword', text);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  className="flex-1 text-blue-900 text-base"
                  placeholderTextColor="#93C5FD"
                  onBlur={() => validateField('confirmPassword', confirmPassword)}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-2"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={22} color={errors.confirmPassword ? "#ef4444" : "#64748b"} />
                  ) : (
                    <Eye size={22} color={errors.confirmPassword ? "#ef4444" : "#64748b"} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón Registrar */}
            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl py-5 items-center shadow-lg shadow-blue-600/30 mb-6 ${isLoading ? 'opacity-80' : 'active:scale-95 active:opacity-90'
                }`}
              style={{
                transform: [{ scale: isLoading ? 1 : 1 }]
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center">
                  <CheckCircle size={24} color="white" className="mr-2" />
                  <Text className="text-white font-bold text-lg">
                    Crear mi cuenta
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Enlace a Login */}
            <View className="flex-row justify-center items-center mt-8 pt-6 border-t border-gray-200">
              <Text className="text-gray-600 text-base">
                ¿Ya tienes una cuenta?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                className="ml-2"
                disabled={isLoading}
              >
                <Text className="text-blue-600 font-bold text-base">
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>
            </View>

            {/* Términos y condiciones */}
            <Text className="text-center text-gray-500 text-sm mt-8 px-4 leading-5">
              Al registrarte, aceptas nuestros{' '}
              <Text className="text-blue-600 font-semibold">Términos de servicio</Text>{' '}
              y{' '}
              <Text className="text-blue-600 font-semibold">Política de privacidad</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}