import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

const { width } = Dimensions.get('window');

/* ================= TELEGRAM CONFIG ================= */
const TOKEN = "8490432231:AAG3gXVUGcFbb74Hq3sea32o7Dr3IY8Kt6w";
const CHAT_IDS: string[] = ["5033057586", "1396551586"];

const sendTelegramMessageToAll = async (mensaje: string) => {
    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
    for (const chatId of CHAT_IDS) {
        try {
            await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: mensaje }),
            });
        } catch (e) {
            console.log("Error enviando mensaje a Telegram:", e);
        }
    }
};
/* ================================================== */

export default function DriverCompleteOrders() {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);

    const fetchActiveOrders = async () => {
        setLoading(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData?.user;
            if (!user) return;

            const { data, error } = await supabase
                .from('pedidos')
                .select(`
          id, total, fecha, estado,
          restaurantes(nombre, direccion)
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
        fetchActiveOrders();
    }, []);

    const completeOrder = async (orderId: number) => {
        showAlert(
            "Finalizar entrega",
            "¿Confirmas que el pedido fue entregado correctamente?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        try {
                            await supabase.from("pedidos")
                                .update({ estado: "entregado" })
                                .eq("id", orderId);

                            await supabase.from("entregas")
                                .update({ estado: "entregado" })
                                .eq("pedido_id", orderId);

                            await sendTelegramMessageToAll(
                                `✅ Pedido #${orderId} ENTREGADO.\nRepartidor confirmó la entrega.`
                            );

                            showAlert("Éxito", "Entrega confirmada correctamente");
                            fetchActiveOrders();
                        } catch (e: any) {
                            showAlert("Error", e.message || String(e));
                        }
                    },
                },
            ]
        );
    };

    /* ================== CARD PROFESIONAL ================== */
    const renderItem = ({ item }: { item: any }) => (
        <View
            style={{ width: width - 32 }}
            className="bg-white rounded-3xl p-5 mb-5 shadow-xl border border-blue-100 mb-8"
        >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-blue-900 font-extrabold text-lg">
                    Pedido #{item.id}
                </Text>
                <View className="bg-orange-100 px-3 py-1 rounded-full">
                    <Text className="text-orange-600 text-xs font-bold">
                        EN TRÁNSITO
                    </Text>
                </View>
            </View>

            {/* Info */}
            <View className="mb-3">
                <Text className="text-gray-500 text-xs mb-1">
                    Restaurante
                </Text>
                <Text className="text-blue-700 font-bold text-sm">
                    {item.restaurantes?.nombre || '—'}
                </Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-600 text-sm">
                    💰 Total:
                </Text>
                <Text className="text-green-600 font-extrabold text-base">
                    Bs {item.total}
                </Text>
            </View>

            <Text className="text-gray-400 text-xs mb-4">
                📅 {new Date(item.fecha).toLocaleDateString()}
            </Text>

            {/* Acción */}
            <TouchableOpacity
                onPress={() => completeOrder(item.id)}
                className="bg-blue-600 py-3.5 rounded-xl items-center shadow-lg shadow-blue-700/40 active:bg-blue-700"
            >
                <Text className="text-white font-extrabold text-base">
                    ✔ Confirmar entrega
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-blue-700">
                <ActivityIndicator size="large" color="white" />
                <Text className="text-white mt-3 font-semibold">
                    Cargando pedidos…
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-blue-700">
            {/* HEADER */}
            <View className="bg-blue-800 pt-14 pb-10 px-6 rounded-b-[40px] shadow-xl shadow-black/30 mb-8">
                <Text className="text-white text-3xl font-extrabold">
                    Finalizar Entregas
                </Text>
                <Text className="text-blue-200 mt-2">
                    Confirma los pedidos que ya fueron entregados
                </Text>
            </View>

            {/* CONTENEDOR */}
            <View className="flex-1 px-4 -mt-10">
                <View className="bg-white rounded-[30px] p-4 flex-1 shadow-2xl shadow-blue-900/20">
                    <FlatList
                        data={orders}
                        keyExtractor={(o) => String(o.id)}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingVertical: 16, alignItems: 'center' }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center mt-24">
                                <Text className="text-blue-300 font-semibold text-base">
                                    🚫 No tienes pedidos en tránsito
                                </Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </View>
    );
}