import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

export default function DriverActiveOrders({ navigation }: any) {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);

    const fetchActive = async () => {
        setLoading(true);
        try {
            const userResp: any = await supabase.auth.getUser();
            const user = userResp?.data?.user;
            if (!user) {
                setLoading(false);
                return;
            }

            // Pedidos asignados al repartidor actual y en estado 'en_transito'
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
                            // 1. Update pedido status
                            const { error: pErr } = await supabase
                                .from('pedidos')
                                .update({ estado: 'entregado' })
                                .eq('id', orderId);

                            if (pErr) throw pErr;

                            // 2. Update entregas status (if exists)
                            const { error: eErr } = await supabase
                                .from('entregas')
                                .update({ estado: 'entregado' })
                                .eq('pedido_id', orderId);

                            if (eErr) console.log('Error updating entregas status', eErr);

                            showAlert('Éxito', 'Pedido finalizado correctamente');
                            fetchActive();
                        }
                    }
                ]
            );
        } catch (e: any) {
            showAlert('Error', e.message || String(e));
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const restaurant = item.restaurantes;
        const entrega = Array.isArray(item.entregas) && item.entregas.length > 0 ? item.entregas[0] : null;

        return (
            <View style={styles.item}>
                <Text style={styles.title}>Pedido #{item.id}</Text>
                <Text>Restaurante: {restaurant?.nombre || '-'}</Text>
                <Text>Dirección: {restaurant?.direccion || '-'}</Text>
                <Text>Total: {item.total}</Text>
                <Text>Estado: {item.estado}</Text>
                <View style={{ marginTop: 8 }}>
                    <Button title="Finalizar entrega" onPress={() => finalizeOrder(item.id)} color="#28a745" />
                </View>
            </View>
        );
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.header}>Mis Pedidos Activos</Text>
            <FlatList
                data={orders}
                keyExtractor={(o) => String(o.id)}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={{ padding: 12 }}>No tienes pedidos en curso.</Text>}
            />
            <View style={{ padding: 12 }}>
                <Button title="Actualizar lista" onPress={fetchActive} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: { fontWeight: 'bold', padding: 12, fontSize: 18 },
    item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', marginBottom: 4 },
    title: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
