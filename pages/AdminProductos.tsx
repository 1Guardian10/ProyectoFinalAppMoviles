import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../supabase/supabase';

export default function AdminProductos() {
  const [items, setItems] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');

  const fetchItems = async () => {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) return Alert.alert('Error', error.message);
    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!nombre.trim()) return Alert.alert('Validación', 'Nombre requerido');
    const parsed = parseFloat(precio);
    const { error } = await supabase.from('productos').insert({ nombre: nombre.trim(), precio: isNaN(parsed) ? null : parsed });
    if (error) return Alert.alert('Error', error.message);
    setNombre('');
    setPrecio('');
    fetchItems();
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Productos</Text>

      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <TextInput
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <Button title="Agregar" onPress={handleAdd} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8 }}>
            <Text>{item.nombre} - {item.precio}</Text>
          </View>
        )}
      />
    </View>
  );
}
