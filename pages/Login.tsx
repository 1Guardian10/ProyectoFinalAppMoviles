import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Pressable } from 'react-native';
import { signInWithEmail, resendConfirmation } from '../utils/Auth';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const data = await signInWithEmail(email, password);
      if (data?.session) {
        navigation.replace('Main');
      } else {
        Alert.alert('Iniciado', 'Revisa tu correo para confirmar o inténtalo de nuevo.');
      }
    } catch (err: any) {
      if (err?.code === 'email_not_confirmed' || (err?.message && err.message.toLowerCase().includes('email not confirmed'))) {
        try {
          await resendConfirmation(email);
          Alert.alert('Correo reenviado', 'Te enviamos de nuevo el correo de confirmación. Revisa tu bandeja.');
        } catch (e: any) {
          Alert.alert('Error', e.message || 'No se pudo reenviar el correo');
        }
        return;
      }
      Alert.alert('Error', err.message || 'No se pudo iniciar sesión');
    }
  };

  return (
    <View>
      <Text >Iniciar sesión</Text>
      <TextInput placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Entrar" onPress={handleLogin} />
      <View style={{ height: 12 }} />
      <View>
        <Text>¿No tienes cuenta?</Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text>Regístrate</Text>
        </Pressable>
      </View>
    </View>
  );
}
