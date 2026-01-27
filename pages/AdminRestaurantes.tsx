import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../supabase/supabase';

export default function AdminRestaurantes() {
  const [items, setItems] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');

  const fetchItems = async () => {
    const { data, error } = await supabase.from('restaurantes').select('*');
    if (error) return Alert.alert('Error', error.message);
    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!nombre.trim()) return Alert.alert('Validación', 'Nombre requerido');
    try {
      const userResp: any = await supabase.auth.getUser();
      const user = userResp?.data?.user;
      if (!user) return Alert.alert('Autenticación', 'Debe iniciar sesión para crear un restaurante');

      const resp = await supabase.from('restaurantes').insert({
        nombre: nombre.trim(),
        direccion: direccion.trim() || null,
        propietario_id: user.id,
      });
      const { error } = resp;
      console.log('Insert restaurantes response:', resp);
      if (error) {
        Alert.alert('Error', error.message || JSON.stringify(error));
        return;
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || String(err));
      return;
    }
    setNombre('');
    setDireccion('');
    fetchItems();
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Restaurantes</Text>

      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <TextInput
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <Button title="Agregar" onPress={handleAdd} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>{item.nombre} - {item.direccion}</Text>
          </View>
        )}
      />
    </View>
  );
}
