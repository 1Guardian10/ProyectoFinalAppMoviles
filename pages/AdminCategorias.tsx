import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

export default function AdminCategorias() {
  const [items, setItems] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from('categorias').select('*').order('id');
    if (error) return showAlert('Error', error.message);
    setItems(data || []);
  };

  const resetForm = () => {
    setNombre('');
    setEditingId(null);
  };

  // CREAR o EDITAR
  const handleSave = async () => {
    if (!nombre.trim()) return showAlert('Validación', 'Nombre requerido');

    let error;

    if (editingId) {
      ({ error } = await supabase
        .from('categorias')
        .update({ nombre: nombre.trim() })
        .eq('id', editingId));
    } else {
      ({ error } = await supabase
        .from('categorias')
        .insert({ nombre: nombre.trim() }));
    }

    if (error) return showAlert('Error', error.message);

    showAlert(
      'Éxito',
      editingId ? 'Categoría actualizada correctamente' : 'Categoría agregada correctamente'
    );

    resetForm();
    fetchItems();
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setNombre(item.nombre);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmar',
      '¿Seguro que deseas eliminar esta categoría?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('categorias').delete().eq('id', id);
            if (error) return showAlert('Error', error.message);

            showAlert('Éxito', 'Categoría eliminada correctamente');
            fetchItems();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-3 mb-2 border border-blue-100 shadow-sm">
      <View className="flex-row justify-between items-center">
        <Text className="text-blue-900 font-semibold text-sm flex-1">
          {item.nombre}
        </Text>

        <View className="flex-row">
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            className="bg-yellow-500 px-3 py-1 rounded-lg mr-2"
          >
            <Text className="text-white text-xs font-bold">
              Editar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="bg-red-500 px-3 py-1 rounded-lg"
          >
            <Text className="text-white text-xs font-bold">
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-blue-700">
      {/* HEADER */}
      <View className="h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-b-[40px] px-5 pt-10 justify-center">
        <Text className="text-white text-3xl font-extrabold">
          Gestión de categorías
        </Text>
        <Text className="text-blue-100 mt-1">
          Crear, editar y eliminar categorías
        </Text>
      </View>

      {/* CONTENIDO */}
      <View className="flex-1 px-5 -mt-6 pb-3">
        <View className="bg-white rounded-[22px] p-4 shadow-xl shadow-blue-900/20 border border-blue-100 flex-1">

          {/* FORMULARIO */}
          <Text className="text-blue-900 font-bold text-sm mb-2">
            {editingId ? 'Editar categoría' : 'Nueva categoría'}
          </Text>

          <View className="flex-row mb-4">
            <TextInput
              placeholder="Nombre de la categoría"
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor="#93C5FD"
              className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-blue-900 text-sm"
            />
            <TouchableOpacity
              onPress={handleSave}
              className={`ml-2 px-4 py-2 rounded-xl justify-center ${editingId ? 'bg-yellow-500' : 'bg-blue-600'
                }`}
            >
              <Text className="text-white font-bold text-sm">
                {editingId ? 'Guardar' : 'Agregar'}
              </Text>
            </TouchableOpacity>
          </View>

          {editingId && (
            <TouchableOpacity
              onPress={resetForm}
              className="mb-4 py-2 rounded-xl bg-gray-400 items-center"
            >
              <Text className="text-white font-bold text-sm">
                Cancelar edición
              </Text>
            </TouchableOpacity>
          )}

          {/* LISTA */}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text className="text-center text-blue-300 mt-6">
                No hay categorías registradas
              </Text>
            }
          />
        </View>
      </View>
    </View>
  );
}