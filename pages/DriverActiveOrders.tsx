import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

export default function DriverActiveOrders({ navigation }: any) {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);

    /* ================== FETCH ================== */
    const fetchActive = async () => {
        setLoading(true);
        try {
            const userResp: any = await supabase.auth.getUser();
            const user = userResp?.data?.user;
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('pedidos')
                .select(`
          id, total, fecha, estado,
          restaurantes (nombre, direccion),
          entregas (latitud, longitud, estado)
        `)
                .eq('repartidor_id', user.id)
                .eq('estado', 'en_transito')
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
        fetchActive();
    }, []);

    /* ================== FINALIZAR PEDIDO ================== */
    const finalizeOrder = async (orderId: number) => {
        try {
            showAlert(
                'Finalizar pedido',
                '¿Confirmas que el pedido ha sido entregado?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Confirmar',
                        onPress: async () => {
                            const { error: pErr } = await supabase
                                .from('pedidos')
                                .update({ estado: 'entregado' })
                                .eq('id', orderId);

                            if (pErr) throw pErr;

                            const { error: eErr } = await supabase
                                .from('entregas')
                                .update({ estado: 'entregado' })
                                .eq('pedido_id', orderId);

                            if (eErr) console.log('Error updating entregas status', eErr);

                            showAlert('Éxito', 'Pedido finalizado correctamente');
                            fetchActive();
                        },
                    },
                ]
            );
        } catch (e: any) {
            showAlert('Error', e.message || String(e));
        }
    };

    /* ================== CARD ================== */
    const renderItem = ({ item }: { item: any }) => {
        const restaurant = item.restaurantes;

        return (
            <View className="bg-white rounded-3xl p-4 mb-4 border border-blue-100 shadow-lg shadow-blue-900/10">
                {/* Header card */}
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-blue-900 font-extrabold text-base">
                        Pedido #{item.id}
                    </Text>
                    <View className="bg-blue-100 px-3 py-1 rounded-full">
                        <Text className="text-blue-700 text-xs font-bold">
                            🚴 EN TRÁNSITO
                        </Text>
                    </View>
                </View>

                {/* Info */}
                <View className="space-y-1">
                    <Text className="text-gray-600 text-sm">
                        Restaurante:{' '}
                        <Text className="text-blue-700 font-semibold">
                            {restaurant?.nombre || '-'}
                        </Text>
                    </Text>

                    <Text className="text-gray-500 text-xs">
                        📍 {restaurant?.direccion || '-'}
                    </Text>

                    <Text className="text-gray-600 text-sm">
                        Total:{' '}
                        <Text className="text-green-600 font-extrabold">
                            Bs {item.total}
                        </Text>
                    </Text>
                </View>

                {/* Acción */}
                <TouchableOpacity
                    onPress={() => finalizeOrder(item.id)}
                    className="mt-4 bg-blue-600 py-3 rounded-xl items-center shadow-md shadow-blue-700/40 active:bg-blue-700"
                >
                    <Text className="text-white font-extrabold text-sm">
                        ✔ Finalizar entrega
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    /* ================== LOADING ================== */
    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-blue-800">
                <ActivityIndicator size="large" color="white" />
                <Text className="text-white mt-3 font-semibold">
                    Cargando pedidos activos...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-blue-800">
            {/* ================= HEADER ================= */}
            <View className="h-44 bg-blue-800 rounded-b-[40px] px-6 pt-10 justify-center shadow-lg shadow-black/30">
                <Text className="text-white text-3xl font-extrabold">
                    Mis pedidos activos
                </Text>
                <Text className="text-blue-200 mt-1">
                    Entregas que estás realizando ahora
                </Text>
            </View>

            {/* ================= CONTENEDOR ================= */}
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
                                    🚫 No tienes pedidos en curso
                                </Text>
                            </View>
                        }
                    />

                    {/* Botón actualizar */}
                    <TouchableOpacity
                        onPress={fetchActive}
                        className="mt-4 bg-blue-600 py-3 rounded-xl items-center shadow-md shadow-blue-700/40 active:bg-blue-700"
                    >
                        <Text className="text-white font-extrabold text-sm">
                            🔄 Actualizar lista
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}