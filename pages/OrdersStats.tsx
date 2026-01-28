import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Dimensions,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { supabase } from '../supabase/supabase';

const screenWidth = Dimensions.get('window').width;

type OrderRow = {
    fecha: string | null;
    estado: string | null;
};

export default function OrdersStats() {
    const [loading, setLoading] = useState(true);
    const [ordersPerDay, setOrdersPerDay] = useState<
        { date: string; count: number }[]
    >([]);
    const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const { data, error } = await supabase
                .from('pedidos')
                .select('fecha, estado');

            if (error) {
                console.error(error);
                return;
            }

            const orders: OrderRow[] = data ?? [];

            /* PEDIDOS POR DÍA */
            const perDay: Record<string, number> = {};
            orders.forEach((o) => {
                if (!o.fecha) return;
                const day = o.fecha.split('T')[0];
                perDay[day] = (perDay[day] || 0) + 1;
            });

            const perDayArray = Object.keys(perDay)
                .sort()
                .map((key) => ({
                    date: key,
                    count: perDay[key],
                }));

            setOrdersPerDay(perDayArray);

            /* PEDIDOS POR ESTADO */
            const byStatus: Record<string, number> = {};
            orders.forEach((o) => {
                const status = o.estado || 'DESCONOCIDO';
                byStatus[status] = (byStatus[status] || 0) + 1;
            });

            const statusArray = Object.keys(byStatus).map((key, index) => ({
                name: key.toUpperCase(),
                count: byStatus[key],
                color: getColor(index),
                legendFontColor: '#E5E7EB',
                legendFontSize: 12,
            }));

            setOrdersByStatus(statusArray);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getColor = (index: number) => {
        const colors = [
            '#38BDF8', // celeste
            '#34D399', // verde
            '#FBBF24', // amarillo
            '#F87171', // rojo
            '#A78BFA', // violeta
            '#FB7185', // rosado
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#0F172A]">
                <ActivityIndicator size="large" color="#38BDF8" />
                <Text className="mt-3 text-gray-300">Cargando estadísticas…</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-[#0F172A] px-4 pt-6">
            {/* HEADER */}
            <View className="bg-[#1E293B] rounded-2xl p-5 mb-6 border border-[#334155]">
                <Text className="text-2xl font-extrabold text-white">
                    📊 Panel de Estadísticas
                </Text>
                <Text className="text-gray-400 mt-1">
                    Visualización interactiva de pedidos
                </Text>
            </View>

            {/* LINE CHART */}
            <View className="bg-[#1E293B] rounded-2xl p-4 mb-6 border border-[#334155]">
                <Text className="text-white font-bold mb-2">
                    Pedidos por día
                </Text>
                <LineChart
                    data={{
                        labels: ordersPerDay.map((o) => o.date.slice(5)),
                        datasets: [
                            {
                                data: ordersPerDay.map((o) => o.count),
                                color: () => '#38BDF8',
                                strokeWidth: 3,
                            },
                        ],
                    }}
                    width={screenWidth - 32}
                    height={230}
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundGradientFrom: '#1E293B',
                        backgroundGradientTo: '#1E293B',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(56,189,248,${opacity})`,
                        labelColor: () => '#E5E7EB',
                        propsForDots: {
                            r: '6',
                            strokeWidth: '3',
                            stroke: '#38BDF8',
                        },
                        propsForBackgroundLines: {
                            stroke: '#334155',
                        },
                    }}
                    bezier
                    style={{ borderRadius: 16 }}
                />
            </View>

            {/* BAR CHART */}
            <View className="bg-[#1E293B] rounded-2xl p-4 mb-6 border border-[#334155]">
                <Text className="text-white font-bold mb-2">
                    Comparación diaria
                </Text>
                <BarChart
                    data={{
                        labels: ordersPerDay.map((o) => o.date.slice(5)),
                        datasets: [
                            {
                                data: ordersPerDay.map((o) => o.count),
                            },
                        ],
                    }}
                    width={screenWidth - 32}
                    height={230}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundGradientFrom: '#1E293B',
                        backgroundGradientTo: '#1E293B',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(52,211,153,${opacity})`,
                        labelColor: () => '#E5E7EB',
                        propsForBackgroundLines: {
                            stroke: '#334155',
                        },
                        barPercentage: 0.7,
                    }}
                    style={{ borderRadius: 16 }}
                />
            </View>

            {/* PIE CHART */}
            <View className="bg-[#1E293B] rounded-2xl p-4 mb-10 border border-[#334155]">
                <Text className="text-white font-bold mb-2">
                    Pedidos por estado
                </Text>
                <PieChart
                    data={ordersByStatus.map((s) => ({
                        name: s.name,
                        population: s.count,
                        color: s.color,
                        legendFontColor: s.legendFontColor,
                        legendFontSize: s.legendFontSize,
                    }))}
                    width={screenWidth - 32}
                    height={260}
                    chartConfig={{
                        color: () => '#fff',
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="20"
                    absolute
                />
            </View>
        </ScrollView>
    );
}