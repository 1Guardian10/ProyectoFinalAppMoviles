import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { signUpWithEmail } from '../utils/Auth';

export default function Register({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleRegister = async () => {
    try {
      await signUpWithEmail(email, password, { nombre: name });
      Alert.alert('Registrado', 'Revisa tu correo para confirmar la cuenta.');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo registrar');
    }
  };

  return (
    <View>
      <Text>Crear cuenta</Text>
      <TextInput  placeholder="Nombre" value={name} onChangeText={setName} />
      <TextInput placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Registrarse" onPress={handleRegister} />
    </View>
  );
}

