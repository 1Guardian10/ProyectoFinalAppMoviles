import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Switch,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
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

  // 🔥 Para edición
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
    fetchRestaurants();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from('productos').select('*').order('id', { ascending: false });
    if (error) return showAlert('Error', error.message);
    setItems(data || []);
  };

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

  const resetForm = () => {
    setEditingId(null);
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setImagenUrl('');
    setSelectedCategory(null);
    setSelectedRestaurant(null);
    setDisponible(true);
  };

  // CREAR o EDITAR
  const handleSave = async () => {
    if (!nombre.trim()) return showAlert('Validación', 'Nombre requerido');
    if (!selectedRestaurant) return showAlert('Validación', 'Selecciona un restaurante');

    const parsed = parseFloat(precio);
    const dataObj = {
      nombre: nombre.trim(),
      precio: isNaN(parsed) ? null : parsed,
      restaurante_id: selectedRestaurant,
      categoria_id: selectedCategory ?? null,
      descripcion: descripcion.trim() || null,
      disponible,
      imagen_url: imagenUrl?.trim() || null,
    };

    let error;

    if (editingId) {
      ({ error } = await supabase
        .from('productos')
        .update(dataObj)
        .eq('id', editingId));
    } else {
      ({ error } = await supabase.from('productos').insert(dataObj));
    }

    if (error) return showAlert('Error', error.message);

    showAlert('Éxito', editingId ? 'Producto actualizado' : 'Producto agregado');
    resetForm();
    fetchItems();
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setNombre(item.nombre);
    setPrecio(item.precio?.toString() || '');
    setDescripcion(item.descripcion || '');
    setDisponible(item.disponible ?? true);
    setImagenUrl(item.imagen_url || '');
    setSelectedRestaurant(item.restaurante_id);
    setSelectedCategory(item.categoria_id);
  };

  // 🔥 CONFIRMACIÓN REAL PARA ELIMINAR
  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmar',
      '¿Seguro que deseas eliminar este producto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('productos').delete().eq('id', id);

            if (error) {
              showAlert('Error', error.message);
              return;
            }

            showAlert('Éxito', 'Producto eliminado correctamente');
            fetchItems();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted')
      return showAlert('Permiso denegado', 'Se requieren permisos para la galería');

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
      if (publicUrl) setImagenUrl(publicUrl);
      else showAlert('Error', 'No se obtuvo URL pública');
    } catch (err: any) {
      showAlert('Error', err.message || 'Error subiendo imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-blue-700">
      {/* HEADER */}
      <View className="h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-b-[40px] px-5 pt-10 justify-center">
        <Text className="text-white text-3xl font-extrabold">
          Gestión de Productos
        </Text>
        <Text className="text-blue-100 mt-1">
          Crear, editar y eliminar productos
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 -mt-6 pb-6">

        {/* FORMULARIO */}
        <View className="bg-white rounded-2xl p-4 shadow-xl mb-6">
          <Text className="text-blue-900 font-bold mb-3">
            {editingId ? 'Editar producto' : 'Nuevo producto'}
          </Text>

          <TextInput
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
            className="border border-blue-200 rounded-lg px-3 py-2 mb-2"
          />

          <TextInput
            placeholder="Precio"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="numeric"
            className="border border-blue-200 rounded-lg px-3 py-2 mb-2"
          />

          <TextInput
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            className="border border-blue-200 rounded-lg px-3 py-2 mb-2"
          />

          {/* Imagen */}
          <TouchableOpacity
            onPress={pickImage}
            disabled={isUploading}
            className="bg-blue-600 py-2 rounded-lg items-center mb-2"
          >
            <Text className="text-white font-bold">
              {isUploading ? 'Subiendo...' : 'Seleccionar imagen'}
            </Text>
          </TouchableOpacity>

          {isUploading && <ActivityIndicator color="#2563EB" />}

          {imagenUrl ? (
            <Image
              source={{ uri: imagenUrl }}
              className="w-full h-36 rounded-lg mb-2"
            />
          ) : null}

          {/* Disponible */}
          <View className="flex-row items-center mb-3">
            <Text className="mr-2 font-semibold">Disponible</Text>
            <Switch value={disponible} onValueChange={setDisponible} />
          </View>

          {/* Picker Restaurante */}
          <View className="border border-blue-200 rounded-lg mb-2">
            <Picker
              selectedValue={selectedRestaurant}
              onValueChange={(v) => setSelectedRestaurant(v)}
            >
              <Picker.Item label="-- Selecciona restaurante --" value={null} />
              {restaurants.map((r) => (
                <Picker.Item key={r.id} label={r.nombre} value={r.id} />
              ))}
            </Picker>
          </View>

          {/* Picker Categoría */}
          <View className="border border-blue-200 rounded-lg mb-4">
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v)}
            >
              <Picker.Item label="-- Selecciona categoría --" value={null} />
              {categories.map((c) => (
                <Picker.Item key={c.id} label={c.nombre} value={c.id} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            className={`py-3 rounded-xl items-center ${editingId ? 'bg-yellow-500' : 'bg-blue-600'
              }`}
          >
            <Text className="text-white font-bold">
              {editingId ? 'Guardar cambios' : 'Agregar producto'}
            </Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity
              onPress={resetForm}
              className="mt-2 py-2 rounded-xl items-center bg-gray-400"
            >
              <Text className="text-white font-bold">Cancelar edición</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LISTADO */}
        <View className="bg-white rounded-2xl p-4 shadow-xl">
          <Text className="text-blue-900 font-bold mb-3">
            Productos registrados
          </Text>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View className="w-1/2 p-1">
                <View className="bg-white border border-blue-100 rounded-xl p-2">
                  {item.imagen_url ? (
                    <Image
                      source={{ uri: item.imagen_url }}
                      className="w-full h-24 rounded-lg"
                    />
                  ) : (
                    <View className="w-full h-24 bg-blue-50 rounded-lg items-center justify-center">
                      <Text className="text-blue-300 text-xs">Sin imagen</Text>
                    </View>
                  )}

                  <Text className="font-bold text-xs mt-1">{item.nombre}</Text>
                  <Text className="text-xs text-blue-700">
                    Bs {item.precio}
                  </Text>

                  <View className="flex-row justify-between mt-2">
                    <TouchableOpacity
                      onPress={() => handleEdit(item)}
                      className="bg-yellow-500 px-2 py-1 rounded"
                    >
                      <Text className="text-white text-xs font-bold">
                        Editar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(item.id)}
                      className="bg-red-500 px-2 py-1 rounded"
                    >
                      <Text className="text-white text-xs font-bold">
                        Eliminar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        </View>

      </ScrollView>
    </View>
  );
}