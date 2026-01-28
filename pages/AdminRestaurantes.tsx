import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageAsync } from '../utils/Storage';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

export default function AdminRestaurantes() {
  const [items, setItems] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [estado, setEstado] = useState<boolean>(true);
  const [imagenUrl, setImagenUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 🔥 Para edición
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchItems = async () => {
    const { data, error } = await supabase.from('restaurantes').select('*');
    if (error) return showAlert('Error', error.message);
    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNombre('');
    setDireccion('');
    setTelefono('');
    setEstado(true);
    setImagenUrl('');
  };

  // CREAR o EDITAR
  const handleSave = async () => {
    if (!nombre.trim()) return showAlert('Validación', 'Nombre requerido');

    try {
      const userResp: any = await supabase.auth.getUser();
      const user = userResp?.data?.user;

      if (!user)
        return showAlert(
          'Autenticación',
          'Debe iniciar sesión para realizar esta acción'
        );

      const dataObj = {
        nombre: nombre.trim(),
        direccion: direccion.trim() || null,
        telefono: telefono.trim() || null,
        estado,
        propietario_id: user.id,
        imagen_url: imagenUrl?.trim() || null,
      };

      let error;

      if (editingId) {
        ({ error } = await supabase
          .from('restaurantes')
          .update(dataObj)
          .eq('id', editingId));
      } else {
        ({ error } = await supabase.from('restaurantes').insert(dataObj));
      }

      if (error) return showAlert('Error', error.message);

      showAlert(
        'Éxito',
        editingId
          ? 'Restaurante actualizado correctamente'
          : 'Restaurante creado correctamente'
      );

      resetForm();
      fetchItems();
    } catch (err: any) {
      showAlert('Error', err?.message || String(err));
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setNombre(item.nombre);
    setDireccion(item.direccion || '');
    setTelefono(item.telefono || '');
    setEstado(item.estado ?? true);
    setImagenUrl(item.imagen_url || '');
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmar',
      '¿Seguro que deseas eliminar este restaurante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('restaurantes')
              .delete()
              .eq('id', id);

            if (error) return showAlert('Error', error.message);

            showAlert('Éxito', 'Restaurante eliminado correctamente');
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

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-3 mb-2 border border-blue-100 shadow-sm">
      <View className="flex-row justify-between items-center">
        <View className="flex-row flex-1 items-center">
          <View className="w-16 h-16 rounded-lg mr-3 overflow-hidden bg-gray-100">
            <Image
              source={item.imagen_url ? { uri: item.imagen_url } : require('../assets/ramen.jpg')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="flex-1">
            <Text className="text-blue-900 font-bold text-sm">
              {item.nombre}
            </Text>
            <Text className="text-gray-500 text-xs">
              {item.direccion || 'Sin dirección'}
            </Text>
            <Text className="text-gray-400 text-xs">
              {item.telefono || 'Sin teléfono'}
            </Text>
          </View>
        </View>

        <View className="items-end ml-2">
          <View
            className={`px-2 py-1 rounded-full mb-2 ${item.estado ? 'bg-green-100' : 'bg-red-100'
              }`}
          >
            <Text
              className={`text-[11px] font-bold ${item.estado ? 'text-green-700' : 'text-red-700'
                }`}
            >
              {item.estado ? 'Activo' : 'Inactivo'}
            </Text>
          </View>

          <View className="flex-row">
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              className="bg-yellow-500 px-2 py-1 rounded mr-1"
            >
              <Text className="text-white text-xs font-bold">Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              className="bg-red-500 px-2 py-1 rounded"
            >
              <Text className="text-white text-xs font-bold">Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-blue-700">
      {/* HEADER */}
      <View className="h-44 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-b-[40px] px-5 pt-10 justify-center">
        <Text className="text-white text-3xl font-extrabold">
          Gestión de restaurantes
        </Text>
        <Text className="text-blue-100 mt-1">
          Crear, editar y eliminar restaurantes
        </Text>
      </View>

      {/* CONTENIDO */}
      <View className="flex-1 px-5 -mt-6 pb-3">
        <View className="bg-white rounded-[22px] p-4 shadow-xl shadow-blue-900/20 border border-blue-100 flex-1">
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* FORMULARIO */}
            <Text className="text-blue-900 font-bold text-base mb-3">
              {editingId ? 'Editar restaurante' : 'Nuevo restaurante'}
            </Text>

            <TextInput
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
              className="border border-blue-200 rounded-lg px-3 py-2 mb-2"
            />

            <TextInput
              placeholder="Dirección"
              value={direccion}
              onChangeText={setDireccion}
              className="border border-blue-200 rounded-lg px-3 py-2 mb-2"
            />

            <TextInput
              placeholder="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              className="border border-blue-200 rounded-lg px-3 py-2 mb-3"
              keyboardType="phone-pad"
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

            {isUploading && <ActivityIndicator color="#2563EB" className="mb-2" />}

            {imagenUrl ? (
              <Image
                source={{ uri: imagenUrl }}
                className="w-full h-32 rounded-lg mb-3"
                resizeMode="cover"
              />
            ) : null}

            <View className="flex-row items-center mb-4">
              <Text className="text-blue-900 font-semibold mr-2 text-sm">
                Activo
              </Text>
              <Switch value={estado} onValueChange={setEstado} />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className={`py-3 rounded-xl items-center ${editingId ? 'bg-yellow-500' : 'bg-blue-600'
                }`}
            >
              <Text className="text-white font-bold text-sm">
                {editingId ? 'Guardar cambios' : 'Agregar restaurante'}
              </Text>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity
                onPress={resetForm}
                className="mt-2 py-2 rounded-xl items-center bg-gray-400"
              >
                <Text className="text-white font-bold text-sm">
                  Cancelar edición
                </Text>
              </TouchableOpacity>
            )}

            {/* LISTA */}
            <Text className="text-blue-900 font-bold text-base mt-5 mb-3">
              Restaurantes registrados
            </Text>

            <FlatList
              data={items}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text className="text-center text-blue-200 mt-6">
                  No hay restaurantes registrados
                </Text>
              }
            />
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
