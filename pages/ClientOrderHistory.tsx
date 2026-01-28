import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { supabase } from '../supabase/supabase';
import {
    MapPin,
    Store,
    CheckCircle,
    XCircle,
    Clock as ClockIcon,
} from 'lucide-react-native';

export default function ClientOrderHistory() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setOrders([]);
                return;
            }

            const { data, error } = await supabase
                .from('pedidos')
                .select(`
          id,
          fecha,
          estado,
          total,
          direccion_entrega,
          restaurantes (
            nombre
          )
        `)
                .eq('cliente_id', user.id)
                .order('fecha', { ascending: false });

            if (error) {
                console.error(error);
                return;
            }

            const ordersData = data ?? [];
            setOrders(ordersData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadOrders();
    };

    /* ===== Helpers ===== */
    const getStatusIcon = (estado: string) => {
        switch (estado) {
            case 'completado':
                return <CheckCircle size={14} color="#16A34A" />;
            case 'cancelado':
                return <XCircle size={14} color="#DC2626" />;
            default:
                return <ClockIcon size={14} color="#2563EB" />;
        }
    };

    const getStatusBg = (estado: string) => {
        switch (estado) {
            case 'completado':
                return 'bg-green-100';
            case 'cancelado':
                return 'bg-red-100';
            default:
                return 'bg-blue-100';
        }
    };

    const getStatusText = (estado: string) => {
        switch (estado) {
            case 'completado':
                return 'text-green-700';
            case 'cancelado':
                return 'text-red-700';
            default:
                return 'text-blue-700';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    /* ===== Card ===== */
    const renderItem = ({ item }: any) => (
        <View
            className="bg-white rounded-2xl mb-5 overflow-hidden"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.07,
                shadowRadius: 6,
                elevation: 2,
            }}
        >
            {/* Header card */}
            <View className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-gray-900 text-base font-extrabold">
                            Pedido #{item.id.toString().padStart(4, '0')}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-1">
                            {formatDate(item.fecha)}
                        </Text>
                    </View>

                    <View
                        className={`flex-row items-center px-3 py-1.5 rounded-full ${getStatusBg(
                            item.estado
                        )}`}
                    >
                        {getStatusIcon(item.estado)}
                        <Text
                            className={`ml-1 text-xs font-bold ${getStatusText(item.estado)}`}
                        >
                            {item.estado.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Body */}
            <View className="p-5 space-y-4">
                <View className="flex-row items-center">
                    <View className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center">
                        <Store size={16} color="#2563EB" />
                    </View>
                    <Text className="ml-3 text-gray-900 font-bold flex-1">
                        {item.restaurantes?.nombre || 'Restaurante no disponible'}
                    </Text>
                </View>

                <View className="flex-row items-start">
                    <View className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center mt-0.5">
                        <MapPin size={16} color="#2563EB" />
                    </View>
                    <Text className="ml-3 text-gray-700 text-sm flex-1">
                        {item.direccion_entrega}
                    </Text>
                </View>
            </View>

            {/* Footer */}
            <View className="bg-gray-50 px-5 py-4 flex-row justify-between items-center border-t border-gray-200">
                <Text className="text-gray-600 font-semibold">Total pagado</Text>
                <Text className="text-gray-900 text-xl font-extrabold">
                    Bs {item.total.toFixed(2)}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-100">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-700 mt-4 font-semibold">
                    Cargando historial...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100">
            {/* HEADER FIJO */}
            <View
                className="bg-white px-5 pt-12 pb-4 border-b border-gray-200 flex-row items-center justify-between"
                style={{ zIndex: 10 }}
            >
                <View>
                    <Text className="text-gray-900 text-2xl font-extrabold">
                        Historial de Pedidos
                    </Text>
                    <Text className="text-gray-500 text-sm">
                        Revisa y controla tus pedidos
                    </Text>
                </View>

                <Image
                    source={require('../assets/logohistoriales.png')}
                    className="w-14 h-14"
                    resizeMode="contain"
                />
            </View>

            {/* CONTADOR */}
            {orders.length > 0 && (
                <View className="px-5 py-2">
                    <View className="bg-blue-600 rounded-full px-4 py-2 self-start">
                        <Text className="text-white font-bold">
                            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                        </Text>
                    </View>
                </View>
            )}

            {/* LISTA */}
            <View className="flex-1 px-5">
                {orders.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-gray-800 font-bold text-lg">
                            No tienes pedidos aún
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">
                            Cuando realices uno aparecerá aquí
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={orders}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#2563EB']}
                                tintColor="#2563EB"
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                    />
                )}
            </View>
        </View>
    );
}