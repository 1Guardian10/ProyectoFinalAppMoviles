import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

export default function AdminUsuarios() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Para edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rolId, setRolId] = useState<number | null>(null); // 👈 rol editable

  const fetch = async () => {
    setLoading(true);
    try {
      const { data: uData, error: uErr } = await supabase
        .from('usuarios')
        .select('id, nombre, correo, rol_id');
      if (uErr) throw uErr;

      const { data: rData, error: rErr } = await supabase
        .from('roles')
        .select('id, nombre');
      if (rErr) throw rErr;

      setUsers(uData || []);
      setRoles(rData || []);
    } catch (e: any) {
      showAlert('Error', e.message || JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNombre('');
    setCorreo('');
    setRolId(null);
  };

  // 🔥 Editar usuario
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setNombre(item.nombre || '');
    setCorreo(item.correo || '');
    setRolId(item.rol_id); // cargamos el rol actual
  };

  // 🔥 Guardar cambios (incluye rol)
  const handleSave = async () => {
    if (!editingId) return;

    if (!nombre.trim())
      return showAlert('Validación', 'El nombre no puede estar vacío');

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: nombre.trim(),
          correo: correo.trim() || null,
          rol_id: rolId,
        })
        .eq('id', editingId);

      if (error) return showAlert('Error', error.message);

      showAlert('Éxito', 'Usuario actualizado correctamente');
      resetForm();
      fetch();
    } catch (e: any) {
      showAlert('Error', e.message || String(e));
    }
  };

  // 🔥 Eliminar usuario
  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirmar',
      '¿Seguro que deseas eliminar este usuario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('usuarios')
              .delete()
              .eq('id', id);

            if (error) return showAlert('Error', error.message);

            showAlert('Éxito', 'Usuario eliminado correctamente');
            fetch();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const currentRole = roles.find((r) => r.id === item.rol_id);

    return (
      <View className="bg-white rounded-lg p-2 mb-2 shadow-sm border border-blue-100">
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-1">
            <Text className="text-blue-900 font-bold text-sm">
              {item.nombre || '- sin nombre -'}
            </Text>
            <Text className="text-gray-500 text-xs">
              {item.correo || 'sin correo'}
            </Text>
          </View>

          <View className="bg-blue-100 px-2 py-0.5 rounded-full">
            <Text className="text-blue-700 font-semibold text-[11px]">
              {currentRole ? currentRole.nombre : 'Sin rol'}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-end mt-2">
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
    );
  };

  return (
    <View className="flex-1 bg-blue-700">
      {/* HEADER */}
      <View className="h-44 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-b-[40px] px-5 pt-10 justify-center">
        <Text className="text-white text-3xl font-extrabold">
          Gestión de usuarios
        </Text>
        <Text className="text-blue-100 mt-1">
          Editar, asignar roles y eliminar usuarios
        </Text>
      </View>

      {/* CONTENIDO */}
      <View className="flex-1 px-5 -mt-6 pb-2">
        <View className="bg-white rounded-[22px] p-3 shadow-xl border border-blue-100 flex-1">

          {/* FORMULARIO DE EDICIÓN */}
          {editingId && (
            <View className="mb-4 p-3 border border-yellow-300 rounded-xl bg-yellow-50">
              <Text className="font-bold text-yellow-700 mb-2">
                Editando usuario
              </Text>

              <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                className="border border-blue-200 rounded-lg px-3 py-2 mb-2"
              />

              <TextInput
                placeholder="Correo"
                value={correo}
                onChangeText={setCorreo}
                className="border border-blue-200 rounded-lg px-3 py-2 mb-2"
              />

              {/* 🔥 Selección de rol */}
              <Text className="text-blue-900 font-semibold mb-1">
                Rol del usuario
              </Text>
              <View className="flex-row flex-wrap mb-3">
                {roles.map((r) => {
                  const active = rolId === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() => setRolId(r.id)}
                      className={`px-3 py-1 rounded-full mr-2 mb-2 ${active ? 'bg-blue-600' : 'bg-blue-100'
                        }`}
                    >
                      <Text
                        className={`text-xs font-bold ${active ? 'text-white' : 'text-blue-700'
                          }`}
                      >
                        {r.nombre}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={handleSave}
                className="bg-yellow-500 py-2 rounded-lg items-center"
              >
                <Text className="text-white font-bold">Guardar cambios</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={resetForm}
                className="bg-gray-400 py-2 rounded-lg items-center mt-2"
              >
                <Text className="text-white font-bold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && (
            <View className="py-6">
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          )}

          <FlatList
            data={users}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              !loading ? (
                <Text className="text-center text-blue-200 mt-6">
                  No hay usuarios registrados
                </Text>
              ) : null
            }
          />
        </View>
      </View>
    </View>
  );
}