import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, Switch, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageAsync } from '../utils/Storage';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

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
    if (error) return showAlert('Error', error.message);
    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
    fetchRestaurants();
    fetchCategories();
  }, []);

  const fetchRestaurants = async () => {
    const { data, error } = await supabase.from('restaurantes').select('id,nombre');
    if (error) return showAlert('Error', error.message);
    setRestaurants(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categorias').select('id,nombre');
    if (error) return showAlert('Error', error.message);
    setCategories(data || []);
  };

  const handleAdd = async () => {
    if (!nombre.trim()) return showAlert('Validación', 'Nombre requerido');
    if (!selectedRestaurant) return showAlert('Validación', 'Selecciona un restaurante');
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
    if (error) return showAlert('Error', error.message);
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
      if (status !== 'granted') return showAlert('Permiso denegado', 'Se requieren permisos para acceder a la galería');

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
        } else {
          showAlert('Error', 'No se obtuvo URL pública');
        }
      } catch (err: any) {
        showAlert('Error', err.message || 'Error subiendo la imagen');
      } finally {
        setIsUploading(false);
      }
    } catch (err: any) {
      showAlert('Error', err.message || 'Error al seleccionar la imagen');
    }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View>
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
            <View style={{ marginBottom: 8 }}>
              <Text style={{ marginBottom: 4 }}>Imagen</Text>
              <Button
                title={isUploading ? "Subiendo..." : "Seleccionar Imagen"}
                onPress={pickImage}
                disabled={isUploading}
              />
              {isUploading && <ActivityIndicator style={{ marginTop: 8 }} />}
              {Boolean(imagenUrl) && (
                <Image
                  source={{ uri: imagenUrl }}
                  style={{ width: '100%', height: 200, marginTop: 8, borderRadius: 8, resizeMode: 'cover' }}
                />
              )}
            </View>
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
            <View style={{ height: 16 }} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.nombre} - {item.precio}</Text>
            {item.imagen_url && (
              <Image source={{ uri: item.imagen_url }} style={{ width: 50, height: 50, marginTop: 4 }} />
            )}
          </View>
        )}
      />
    </View>
  );
}
