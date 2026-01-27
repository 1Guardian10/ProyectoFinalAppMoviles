import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../supabase/supabase';

export default function AdminRoles() {
  const [items, setItems] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');

  const fetchItems = async () => {
    const { data, error } = await supabase.from('roles').select('*');
    if (error) return Alert.alert('Error', error.message);
    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!nombre.trim()) return Alert.alert('Validación', 'Nombre requerido');
    const { error } = await supabase.from('roles').insert({ nombre: nombre.trim() });
    if (error) return Alert.alert('Error', error.message);
    setNombre('');
    fetchItems();
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Roles</Text>

      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <Button title="Agregar" onPress={handleAdd} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>{item.nombre}</Text>
          </View>
        )}
      />
    </View>
  );
}
