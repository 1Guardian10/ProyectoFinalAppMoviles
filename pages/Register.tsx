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
import { signUpWithEmail } from '../utils/Auth';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Phone, Shield, CheckCircle } from 'lucide-react-native';

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

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await signUpWithEmail(email, password, {
        nombre: name,
        telefono: phone
      });
      showSuccessAlert();
      navigation.replace('Login');
    } catch (err: any) {
      console.error('Error en registro:', err);

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
            height: 280,
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
              top: 80,
              left: -40,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(255,255,255,0.05)'
            }} />

            {/* Botón de retroceso */}
            <Pressable
              onPress={() => navigation.replace('Login')}
              style={{
                position: 'absolute',
                top: Platform.OS === 'ios' ? 50 : 40,
                left: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: 10,
                borderRadius: 20,
                zIndex: 10
              }}
            >
              <ArrowLeft size={22} color="white" />
            </Pressable>

            {/* Logo e imagen */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingTop: 80
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 36
                }}>
                  CREAR
                </Text>
                <Text style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 36,
                  marginTop: 4
                }}>
                  CUENTA
                </Text>
                <Text style={{
                  color: 'rgba(255,255,255,0.9)',
                  marginTop: 12,
                  fontSize: 16,
                  fontWeight: '500'
                }}>
                  Llena el formulario de registro con tus datos
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
                    source={require('../assets/logoizquierda.png')}
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                  />
                </View>
                <View style={{
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  backgroundColor: 'white',
                  padding: 6,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: '#2563EB'
                }}>
                  <Shield size={14} color="#2563EB" />
                </View>
              </View>
            </View>
          </View>

          {/* Formulario */}
          <View style={{ flex: 1, paddingHorizontal: 24, marginTop: -20 }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 30,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
              borderWidth: 1,
              borderColor: '#e2e8f0'
            }}>
              {/* Nombre */}
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#dbeafe',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}>
                    <Text style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: 10 }}>
                      1
                    </Text>
                  </View>
                  <Text style={{
                    color: '#1e293b',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Nombre completo
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 2,
                  borderColor: '#cbd5e1',
                  backgroundColor: 'white'
                }}>
                  <User size={20} color="#64748b" />
                  <TextInput
                    placeholder="Tu nombre"
                    value={name}
                    onChangeText={setName}
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      color: '#0f172a',
                      fontSize: 16
                    }}
                    placeholderTextColor="#94a3b8"
                    selectionColor="#3B82F6"
                    autoComplete="name"
                  />
                </View>
              </View>

              {/* Teléfono */}
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#dbeafe',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}>
                    <Text style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: 10 }}>
                      2
                    </Text>
                  </View>
                  <Text style={{
                    color: '#1e293b',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Teléfono
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 2,
                  borderColor: '#cbd5e1',
                  backgroundColor: 'white'
                }}>
                  <Phone size={20} color="#64748b" />
                  <TextInput
                    placeholder="00000000"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
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

              {/* Email */}
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#dbeafe',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}>
                    <Text style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: 10 }}>
                      3
                    </Text>
                  </View>
                  <Text style={{
                    color: '#1e293b',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Correo electrónico
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 2,
                  borderColor: '#cbd5e1',
                  backgroundColor: 'white'
                }}>
                  <Mail size={20} color="#64748b" />
                  <TextInput
                    placeholder="ejemplo@gmail.com"
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
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Contraseña */}
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#dbeafe',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}>
                    <Text style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: 10 }}>
                      4
                    </Text>
                  </View>
                  <Text style={{
                    color: '#1e293b',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Contraseña
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 2,
                  borderColor: '#cbd5e1',
                  backgroundColor: 'white'
                }}>
                  <Lock size={20} color="#64748b" />
                  <TextInput
                    placeholder="Mínimo 6 caracteres"
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

              {/* Confirmar Contraseña */}
              <View style={{ marginBottom: 30 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#dbeafe',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8
                  }}>
                    <Text style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: 10 }}>
                      5
                    </Text>
                  </View>
                  <Text style={{
                    color: '#1e293b',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Confirmar Contraseña
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderWidth: 2,
                  borderColor: '#cbd5e1',
                  backgroundColor: 'white'
                }}>
                  <Lock size={20} color="#64748b" />
                  <TextInput
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
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
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ padding: 4 }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#64748b" />
                    ) : (
                      <Eye size={20} color="#64748b" />
                    )}
                  </Pressable>
                </View>
                <Text style={{
                  color: '#3b82f6',
                  fontSize: 12,
                  marginTop: 8,
                  marginLeft: 4
                }}>
                  ⓘ La contraseña debe tener al menos 6 caracteres
                </Text>
              </View>

              {/* Botón de Registro */}
              <Pressable
                onPress={handleRegister}
                disabled={isLoading}
                style={{
                  backgroundColor: '#1d4ed8',
                  borderRadius: 16,
                  paddingVertical: 18,
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
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CheckCircle size={22} color="white" />
                    <Text style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginLeft: 8
                    }}>
                      Crear cuenta
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* Términos y condiciones */}
              <Text style={{
                color: '#64748b',
                fontSize: 12,
                textAlign: 'center',
                marginBottom: 20,
                lineHeight: 16
              }}>
                Al registrarte, aceptas nuestros{' '}
                <Text style={{ color: '#1d4ed8', fontWeight: '500' }}>Términos</Text> y{' '}
                <Text style={{ color: '#1d4ed8', fontWeight: '500' }}>Política de privacidad</Text>
              </Text>

              {/* Separador */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                <Text style={{
                  marginHorizontal: 12,
                  color: '#64748b',
                  fontSize: 14
                }}>
                  ¿Ya tienes cuenta?
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
              </View>

              {/* Botón para ir a Login */}
              <Pressable
                onPress={() => navigation.navigate('Login')}
                style={{
                  paddingVertical: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#cbd5e1',
                  borderRadius: 16,
                  backgroundColor: 'white'
                }}
              >
                <Text style={{
                  color: '#1d4ed8',
                  fontSize: 16,
                  fontWeight: 'bold'
                }}>
                  Iniciar sesión
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