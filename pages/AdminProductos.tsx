import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, Switch, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageAsync } from '../utils/Storage';
import { supabase } from '../supabase/supabase';

export default function AdminProductos() {
  const [items, setItems] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [disponible, setDisponible] = useState<boolean>(true);
  const [imagenUrl, setImagenUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchItems = async () => {
    const { data, error } = await supabase.from('productos').select('*');
    if (error) return Alert.alert('Error', error.message);
    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
    fetchRestaurants();
    fetchCategories();
  }, []);

  const fetchRestaurants = async () => {
    const { data, error } = await supabase.from('restaurantes').select('id,nombre');
    if (error) return Alert.alert('Error', error.message);
    setRestaurants(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categorias').select('id,nombre');
    if (error) return Alert.alert('Error', error.message);
    setCategories(data || []);
  };

  const handleAdd = async () => {
    if (!nombre.trim()) return Alert.alert('Validación', 'Nombre requerido');
    if (!selectedRestaurant) return Alert.alert('Validación', 'Selecciona un restaurante');
    const parsed = parseFloat(precio);
    const insertObj = {
      nombre: nombre.trim(),
      precio: isNaN(parsed) ? null : parsed,
      restaurante_id: selectedRestaurant,
      categoria_id: selectedCategory ?? null,
      descripcion: descripcion.trim() || null,
      disponible: disponible,
      imagen_url: imagenUrl?.trim() || null,
    };

    const { error } = await supabase.from('productos').insert(insertObj);
    if (error) return Alert.alert('Error', error.message);
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setImagenUrl('');
    setSelectedCategory(null);
    setDisponible(true);
    fetchItems();
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permiso denegado', 'Se requieren permisos para acceder a la galería');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;
      if (!result.assets || result.assets.length === 0) return;

      const uri = result.assets[0].uri;
      setIsUploading(true);
      try {
        const publicUrl = await uploadImageAsync(uri, 'imagenes_productos');
        if (publicUrl) {
          setImagenUrl(publicUrl);
          Alert.alert('Éxito', 'Imagen subida correctamente');
        } else {
          Alert.alert('Error', 'No se obtuvo URL pública');
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Error subiendo la imagen');
      } finally {
        setIsUploading(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al seleccionar la imagen');
    }
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
      <TextInput
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <TextInput
        placeholder="Imagen URL"
        value={imagenUrl}
        onChangeText={setImagenUrl}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ marginRight: 8 }}>Disponible</Text>
        <Switch value={disponible} onValueChange={setDisponible} />
      </View>
      <Text style={{ marginBottom: 4 }}>Restaurante</Text>
      <View style={{ borderWidth: 1, marginBottom: 8 }}>
        <Picker
          selectedValue={selectedRestaurant}
          onValueChange={(value) => setSelectedRestaurant(value)}
        >
          <Picker.Item label="-- Selecciona restaurante --" value={null} />
          {restaurants.map((r) => (
            <Picker.Item key={r.id} label={r.nombre} value={r.id} />
          ))}
        </Picker>
      </View>
      <Text style={{ marginBottom: 4 }}>Categoría</Text>
      <View style={{ borderWidth: 1, marginBottom: 8 }}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <Picker.Item label="-- Selecciona categoría --" value={null} />
          {categories.map((c) => (
            <Picker.Item key={c.id} label={c.nombre} value={c.id} />
          ))}
        </Picker>
      </View>
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
