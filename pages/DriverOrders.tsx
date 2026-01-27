import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

import OrderDetailsModal from '../components/OrderDetailsModal';

export default function DriverOrders({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);


  const fetchAvailable = async () => {
    setLoading(true);
    try {
      // Pedidos sin repartidor y en estados que el policy permite
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, total, fecha, cliente_id, restaurante_id, repartidor_id, entregas(latitud,longitud,estado)')
        .is('repartidor_id', null)
        .in('estado', ['pendiente', 'preparando', 'listo_para_recoger'])
        .order('fecha', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (e: any) {
      showAlert('Error', e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const acceptOrder = async (pedidoId: number) => {
    try {
      const userResp: any = await supabase.auth.getUser();
      const user = userResp?.data?.user;
      if (!user) return showAlert('Autenticación', 'Debes iniciar sesión como repartidor');

      // Intentar asignar el pedido al repartidor actual
      const { data: updData, error: updErr } = await supabase
        .from('pedidos')
        .update({ repartidor_id: user.id, estado: 'en_transito' })
        .eq('id', pedidoId)
        .select()
        .single();

      if (updErr) {
        console.log('assign error', updErr);
        return showAlert('Error', updErr.message || JSON.stringify(updErr));
      }

      // Comprobar si ya existe una entrada en entregas para este pedido
      const { data: entregasData, error: entErr } = await supabase
        .from('entregas')
        .select('*')
        .eq('pedido_id', pedidoId)
        .limit(1);

      if (entErr) console.log('entregas select err', entErr);

      if (!entregasData || entregasData.length === 0) {
        // No hay ubicación guardada: preguntar si usar la ubicación actual del dispositivo
        showAlert(
          'Sin ubicación de entrega',
          'No existe una ubicación guardada para este pedido. ¿Deseas usar tu ubicación actual como punto de entrega?',
          [
            { text: 'Sí, usar mi ubicación', onPress: async () => await saveCurrentLocationAsEntrega(pedidoId) },
            { text: 'No, después', style: 'cancel' },
          ]
        );
      } else {
        showAlert('Pedido aceptado', `Pedido #${pedidoId} asignado correctamente`);
        fetchAvailable();
        navigation.navigate('Home');
      }
    } catch (e: any) {
      showAlert('Error', e.message || String(e));
    }
  };

  const saveCurrentLocationAsEntrega = async (pedidoId: number) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permiso de ubicación', 'Permiso denegado. ¿Abrir ajustes?', [
          { text: 'Abrir ajustes', onPress: () => Location.getProviderStatusAsync().then(() => { }) },
          { text: 'Cancelar', style: 'cancel' },
        ]);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { data: insertData, error: insertErr } = await supabase.from('entregas').insert({
        pedido_id: pedidoId,
        latitud: loc.coords.latitude,
        longitud: loc.coords.longitude,
        estado: 'pendiente',
      });

      if (insertErr) {
        console.log('entrega insert err', insertErr);
        return showAlert('Error', insertErr.message || JSON.stringify(insertErr));
      }

      showAlert('Listo', 'Ubicación guardada y pedido aceptado');
      fetchAvailable();
      navigation.navigate('Home');
    } catch (e: any) {
      showAlert('Error', e.message || String(e));
    }
  };

  const openDetails = async (order: any) => {
    setSelectedOrder(order);
    setDetails([]);
    setModalVisible(true);

    // Fetch detalles
    const { data, error } = await supabase
      .from('detalle_pedidos')
      .select('*')
      .eq('pedido_id', order.id);

    if (!error && data) {
      setDetails(data);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const entrega = Array.isArray(item.entregas) && item.entregas.length > 0 ? item.entregas[0] : null;
    return (
      <View style={styles.item}>
        <Text style={styles.title}>Pedido #{item.id}</Text>
        <Text>Total: {item.total ?? '-'}</Text>
        <Text>Fecha: {item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'}</Text>
        <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button title="Ver detalles" onPress={() => openDetails(item)} color="#666" />
          <Button title="Aceptar pedido" onPress={() => acceptOrder(item.id)} />
        </View>
      </View>
    );
  };


  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.header}>Pedidos disponibles</Text>
      <FlatList data={orders} keyExtractor={(o) => String(o.id)} renderItem={renderItem} ListEmptyComponent={<Text style={{ padding: 12 }}>No hay pedidos disponibles</Text>} />

      <OrderDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAccept={(id) => { setModalVisible(false); acceptOrder(id); }}
        order={selectedOrder}
        details={details}
      />
    </View>

  );
}

const styles = StyleSheet.create({
  header: { fontWeight: 'bold', padding: 12 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
