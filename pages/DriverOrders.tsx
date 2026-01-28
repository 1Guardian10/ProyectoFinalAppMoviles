import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';
import OrderDetailsModal from '../components/OrderDetailsModal';

/* ================= TELEGRAM CONFIG ================= */
const TOKEN = "8490432231:AAG3gXVUGcFbb74Hq3sea32o7Dr3IY8Kt6w";

const CHAT_IDS: string[] = [
  "5033057586",
  "1396551586",
];

const sendTelegramMessageToAll = async (mensaje: string) => {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  for (const chatId of CHAT_IDS) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensaje,
        }),
      });
    } catch (e) {
      console.log("Error enviando mensaje a Telegram:", e);
    }
  }
};
/* ================================================== */

export default function DriverOrders({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  /* ================== FETCH ================== */
  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(
          'id, total, fecha, cliente_id, restaurante_id, repartidor_id, entregas(latitud,longitud,estado)'
        )
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

  /* ================== ACEPTAR PEDIDO ================== */
  const acceptOrder = async (pedidoId: number) => {
    try {
      const userResp: any = await supabase.auth.getUser();
      const user = userResp?.data?.user;
      if (!user)
        return showAlert(
          'Autenticación',
          'Debes iniciar sesión como repartidor'
        );

      const { error: updErr } = await supabase
        .from('pedidos')
        .update({ repartidor_id: user.id, estado: 'en_transito' })
        .eq('id', pedidoId);

      if (updErr) return showAlert('Error', updErr.message);

      // 🔔 Telegram cuando cambia el estado
      await sendTelegramMessageToAll(
        `🚴 Pedido #${pedidoId} asignado.\n📦 Estado: EN TRÁNSITO`
      );

      const { data: entregasData } = await supabase
        .from('entregas')
        .select('*')
        .eq('pedido_id', pedidoId)
        .limit(1);

      if (!entregasData || entregasData.length === 0) {
        showAlert(
          'Sin ubicación de entrega',
          'No existe una ubicación guardada para este pedido. ¿Deseas usar tu ubicación actual?',
          [
            {
              text: 'Sí, usar mi ubicación',
              onPress: async () => await saveCurrentLocationAsEntrega(pedidoId),
            },
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

  /* ================== UBICACIÓN ================== */
  const saveCurrentLocationAsEntrega = async (pedidoId: number) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permiso de ubicación', 'Permiso denegado');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { error } = await supabase.from('entregas').insert({
        pedido_id: pedidoId,
        latitud: loc.coords.latitude,
        longitud: loc.coords.longitude,
        estado: 'pendiente',
      });

      if (error) return showAlert('Error', error.message);

      // 🔔 Telegram ubicación guardada
      await sendTelegramMessageToAll(
        `📍 Pedido #${pedidoId}\nUbicación de entrega registrada correctamente.`
      );

      showAlert('Listo', 'Ubicación guardada y pedido aceptado');
      fetchAvailable();
      navigation.navigate('Home');
    } catch (e: any) {
      showAlert('Error', e.message || String(e));
    }
  };

  /* ================== DETALLES ================== */
  const openDetails = async (order: any) => {
    setSelectedOrder(order);
    setDetails([]);
    setModalVisible(true);

    const { data, error } = await supabase
      .from('detalle_pedidos')
      .select('*')
      .eq('pedido_id', order.id);

    if (!error && data) setDetails(data);
  };

  /* ================== CARD ================== */
  const renderItem = ({ item }: { item: any }) => {
    return (
      <View className="bg-white rounded-2xl p-4 mb-4 border border-blue-100 shadow-lg shadow-blue-900/10">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-blue-900 font-extrabold text-base">
            Pedido #{item.id}
          </Text>
          <View className="bg-yellow-100 px-3 py-1 rounded-full">
            <Text className="text-yellow-700 text-xs font-bold">
              DISPONIBLE
            </Text>
          </View>
        </View>

        <View className="space-y-1">
          <Text className="text-gray-600 text-sm">
            Total:{' '}
            <Text className="text-green-600 font-extrabold">
              Bs {item.total ?? '-'}
            </Text>
          </Text>
          <Text className="text-gray-500 text-xs">
            Fecha:{' '}
            {item.fecha ? new Date(item.fecha).toLocaleDateString() : '-'}
          </Text>
        </View>

        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            onPress={() => openDetails(item)}
            className="flex-1 mr-2 py-2.5 rounded-xl bg-blue-100 items-center"
          >
            <Text className="text-blue-700 font-bold text-sm">
              📄 Ver detalles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => acceptOrder(item.id)}
            className="flex-1 ml-2 py-2.5 rounded-xl bg-green-600 items-center shadow-md shadow-green-600/40 active:bg-green-700"
          >
            <Text className="text-white font-extrabold text-sm">
              🚴 Aceptar pedido
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ================== LOADING ================== */
  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-blue-700">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-3 font-semibold">
          Cargando pedidos disponibles...
        </Text>
      </View>
    );

  return (
    <View className="flex-1 bg-blue-700">
      {/* HEADER */}
      <View className="h-44 bg-blue-800 rounded-b-[40px] px-6 pt-10 justify-center shadow-lg shadow-black/30">
        <Text className="text-white text-3xl font-extrabold">
          Pedidos disponibles
        </Text>
        <Text className="text-blue-200 mt-1">
          Selecciona un pedido para entregar
        </Text>
      </View>

      {/* LISTA */}
      <View className="flex-1 px-5 -mt-8 pb-4">
        <View className="bg-white rounded-[26px] p-4 shadow-2xl shadow-blue-900/20 border border-blue-100 flex-1">
          <FlatList
            data={orders}
            keyExtractor={(o) => String(o.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center mt-10">
                <Text className="text-blue-300 font-semibold">
                  📭 No hay pedidos disponibles
                </Text>
              </View>
            }
          />
        </View>
      </View>

      {/* MODAL */}
      <OrderDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAccept={(id) => {
          setModalVisible(false);
          acceptOrder(id);
        }}
        order={selectedOrder}
        details={details}
      />
    </View>
  );
}