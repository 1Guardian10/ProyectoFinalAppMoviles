import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button } from 'react-native';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

export default function AdminCategorias() {
  const [items, setItems] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');

  const fetchItems = async () => {
    const { data, error } = await supabase.from('categorias').select('*');
    if (error) return showAlert('Error', error.message);
    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!nombre.trim()) return showAlert('Validación', 'Nombre requerido');
    const { error } = await supabase.from('categorias').insert({ nombre: nombre.trim() });
    if (error) return showAlert('Error', error.message);
    setNombre('');
    fetchItems();
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Categorías</Text>

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
