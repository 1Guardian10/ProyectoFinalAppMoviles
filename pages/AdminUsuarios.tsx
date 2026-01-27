import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

export default function AdminUsuarios() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data: uData, error: uErr } = await supabase.from('usuarios').select('id, nombre, correo, rol_id');
      if (uErr) throw uErr;
      const { data: rData, error: rErr } = await supabase.from('roles').select('id, nombre');
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

  const changeRole = async (userId: string, rolId: number) => {
    try {
      const resp = await supabase.from('usuarios').update({ rol_id: rolId }).eq('id', userId);
      const { error } = resp;
      if (error) return showAlert('Error', error.message || JSON.stringify(error));
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, rol_id: rolId } : u)));
    } catch (e: any) {
      showAlert('Error', e.message || String(e));
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const currentRole = roles.find((r) => r.id === item.rol_id);
    return (
      <View>
        <Text>{item.nombre || '- sin nombre -'}</Text>
        <Text>{item.correo}</Text>
        <Text >Rol actual: {currentRole ? currentRole.nombre : '—'}</Text>

        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {roles.map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => changeRole(item.id, r.id)}
            >
              <Text style={{ color: item.rol_id === r.id ? '#fff' : '#000' }}>{r.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: 'bold', padding: 12 }}>Usuarios</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ padding: 12 }}>{loading ? 'Cargando...' : 'No hay usuarios'}</Text>}
      />
    </View>
  );
}
