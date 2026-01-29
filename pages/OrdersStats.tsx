import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    Dimensions,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { supabase } from '../supabase/supabase';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

type OrderRow = {
    id: number;
    fecha: string | null;
    estado: string | null;
    total: number | null;
    cliente_id: string | null;
    repartidor_id: string | null;
    restaurante_id: number | null;
    direccion_entrega: string | null;
};

type StatsSummary = {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    todayOrders: number;
    weekGrowth: number;
    popularStatus: string;
    avgOrdersPerDay: number;
    maxOrdersDay: number;
    successRate: number;
};

type DailyStat = {
    date: string;
    count: number;
    revenue: number;
    avgOrderValue: number;
};

type StatusStat = {
    name: string;
    count: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
    percentage: string;
    revenue?: number;
};

export default function OrdersStats() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [ordersPerDay, setOrdersPerDay] = useState<DailyStat[]>([]);
    const [ordersByStatus, setOrdersByStatus] = useState<StatusStat[]>([]);
    const [statsSummary, setStatsSummary] = useState<StatsSummary | null>(null);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
    const [selectedChart, setSelectedChart] = useState<'line' | 'bar'>('line');
    const [error, setError] = useState<string | null>(null);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    }, [timeRange]);

    useEffect(() => {
        loadStats();
    }, [timeRange]);

    const loadStats = async () => {
        try {
            setError(null);
            setLoading(true);

            // Obtener datos de pedidos según el esquema correcto
            const { data, error } = await supabase
                .from('pedidos')
                .select('id, fecha, estado, total, cliente_id, repartidor_id, restaurante_id, direccion_entrega')
                .order('fecha', { ascending: false });

            if (error) {
                console.error('Error cargando pedidos:', error);
                setError('Error al cargar los datos de pedidos');
                return;
            }

            const orders: OrderRow[] = data ?? [];

            if (orders.length === 0) {
                setError('No hay datos de pedidos disponibles');
                return;
            }

            // Calcular resumen de métricas
            const summary = calculateSummary(orders);
            setStatsSummary(summary);

            // Filtrar por rango de tiempo
            const filteredOrders = filterOrdersByTimeRange(orders, timeRange);

            // Calcular pedidos por día
            const perDay = calculateOrdersPerDay(filteredOrders);
            setOrdersPerDay(perDay);

            // Calcular pedidos por estado
            const statusData = calculateOrdersByStatus(filteredOrders);
            setOrdersByStatus(statusData);

        } catch (e) {
            console.error('Error en loadStats:', e);
            setError('Error al procesar los datos estadísticos');
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (orders: OrderRow[]): StatsSummary => {
        const today = new Date().toISOString().split('T')[0];
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastWeekStr = lastWeek.toISOString().split('T')[0];

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Contar por estados (ajusta según tus estados reales)
        const completedOrders = orders.filter(o => o.estado?.toLowerCase() === 'completado' || o.estado?.toLowerCase() === 'entregado').length;
        const pendingOrders = orders.filter(o => o.estado?.toLowerCase() === 'pendiente' || o.estado?.toLowerCase() === 'en_proceso').length;
        const cancelledOrders = orders.filter(o => o.estado?.toLowerCase() === 'cancelado').length;
        const todayOrders = orders.filter(o => o.fecha?.startsWith(today)).length;

        // Calcular crecimiento semanal
        const thisWeekOrders = orders.filter(o =>
            o.fecha && o.fecha >= lastWeekStr
        ).length;
        const prevWeekOrders = totalOrders - thisWeekOrders;
        const weekGrowth = prevWeekOrders > 0
            ? ((thisWeekOrders - prevWeekOrders) / prevWeekOrders) * 100
            : (thisWeekOrders > 0 ? 100 : 0);

        // Estado más popular
        const statusCounts = orders.reduce((acc, order) => {
            const status = order.estado?.toLowerCase() || 'desconocido';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const popularStatus = Object.entries(statusCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

        // Calcular estadísticas diarias
        const dailyStats = calculateOrdersPerDay(orders);
        const avgOrdersPerDay = dailyStats.length > 0
            ? dailyStats.reduce((sum, day) => sum + day.count, 0) / dailyStats.length
            : 0;
        const maxOrdersDay = dailyStats.length > 0
            ? Math.max(...dailyStats.map(o => o.count))
            : 0;

        const successRate = totalOrders > 0
            ? (completedOrders / totalOrders) * 100
            : 0;

        return {
            totalOrders,
            totalRevenue,
            avgOrderValue,
            completedOrders,
            pendingOrders,
            cancelledOrders,
            todayOrders,
            weekGrowth,
            popularStatus: popularStatus.toUpperCase(),
            avgOrdersPerDay,
            maxOrdersDay,
            successRate,
        };
    };

    const filterOrdersByTimeRange = (orders: OrderRow[], range: 'week' | 'month' | 'quarter') => {
        const now = new Date();
        const cutoffDate = new Date();

        switch (range) {
            case 'week':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoffDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                cutoffDate.setMonth(now.getMonth() - 3);
                break;
        }

        return orders.filter(order =>
            order.fecha && new Date(order.fecha) >= cutoffDate
        );
    };

    const calculateOrdersPerDay = (orders: OrderRow[]): DailyStat[] => {
        const perDay: Record<string, { count: number; revenue: number; orderValues: number[] }> = {};

        orders.forEach((order) => {
            if (!order.fecha) return;
            const day = order.fecha.split('T')[0];
            if (!perDay[day]) {
                perDay[day] = { count: 0, revenue: 0, orderValues: [] };
            }
            perDay[day].count++;
            const orderTotal = order.total || 0;
            perDay[day].revenue += orderTotal;
            perDay[day].orderValues.push(orderTotal);
        });

        return Object.keys(perDay)
            .sort()
            .map((key) => {
                const dayData = perDay[key];
                const avgOrderValue = dayData.count > 0 ? dayData.revenue / dayData.count : 0;

                return {
                    date: key,
                    count: dayData.count,
                    revenue: dayData.revenue,
                    avgOrderValue: avgOrderValue,
                };
            });
    };

    const calculateOrdersByStatus = (orders: OrderRow[]): StatusStat[] => {
        const statusColors: Record<string, string> = {
            'completado': '#10B981', // verde
            'entregado': '#10B981', // verde
            'pendiente': '#F59E0B', // amarillo
            'en_proceso': '#3B82F6', // azul
            'cancelado': '#EF4444', // rojo
            'preparando': '#8B5CF6', // violeta
            'en_camino': '#F97316', // naranja
            'desconocido': '#6B7280', // gris
        };

        const byStatus: Record<string, { count: number; revenue: number }> = {};

        orders.forEach((order) => {
            const status = order.estado?.toLowerCase() || 'desconocido';
            if (!byStatus[status]) {
                byStatus[status] = { count: 0, revenue: 0 };
            }
            byStatus[status].count++;
            byStatus[status].revenue += order.total || 0;
        });

        return Object.entries(byStatus)
            .sort(([, a], [, b]) => b.count - a.count)
            .map(([status, data]) => ({
                name: status.toUpperCase(),
                count: data.count,
                color: statusColors[status] || '#6B7280',
                legendFontColor: '#E5E7EB',
                legendFontSize: 12,
                percentage: ((data.count / orders.length) * 100).toFixed(1) + '%',
                revenue: data.revenue,
            }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'VES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatPercentage = (value: number) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    const formatShortDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        }).replace('.', '');
    };

    const renderMetricCard = (
        title: string,
        value: string | number,
        icon: string,
        color: string,
        subtitle?: string,
        trend?: number
    ) => (
        <View className="bg-[#1E293B] rounded-xl p-4 flex-1 m-1 min-w-[48%] border border-[#334155]">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-400 text-sm font-medium">{title}</Text>
                <View className="flex-row items-center">
                    {trend !== undefined && (
                        <Ionicons
                            name={trend >= 0 ? 'trending-up' : 'trending-down'}
                            size={16}
                            color={trend >= 0 ? '#10B981' : '#EF4444'}
                            style={{ marginRight: 4 }}
                        />
                    )}
                    <Ionicons name={icon as any} size={20} color={color} />
                </View>
            </View>
            <Text className="text-2xl font-bold text-white mb-1">{value}</Text>
            {subtitle && <Text className="text-gray-400 text-xs">{subtitle}</Text>}
        </View>
    );

    const renderNoData = () => (
        <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="stats-chart-outline" size={64} color="#4B5563" />
            <Text className="text-gray-400 text-lg font-medium mt-4">No hay datos disponibles</Text>
            <Text className="text-gray-500 text-center mt-2">
                No se encontraron pedidos para el período seleccionado
            </Text>
            <TouchableOpacity
                onPress={loadStats}
                className="bg-[#38BDF8] rounded-lg px-6 py-3 mt-6"
            >
                <Text className="text-white font-medium">Reintentar</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View className="flex-1 items-center justify-center bg-[#0F172A]">
                <ActivityIndicator size="large" color="#38BDF8" />
                <Text className="mt-3 text-gray-300">Cargando estadísticas…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-[#0F172A] p-4">
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className="text-red-400 text-lg font-medium mt-4">Error</Text>
                <Text className="text-gray-400 text-center mt-2 mb-6">{error}</Text>
                <TouchableOpacity
                    onPress={loadStats}
                    className="bg-[#38BDF8] rounded-lg px-6 py-3"
                >
                    <Text className="text-white font-medium">Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-[#0F172A]"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#38BDF8']}
                    tintColor="#38BDF8"
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* HEADER */}
            <View className="bg-gradient-to-b from-[#1E293B] to-[#0F172A] p-6 pb-8">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-2xl font-extrabold text-white">
                            📊 Dashboard de Pedidos
                        </Text>
                        <Text className="text-gray-400 mt-1">
                            {timeRange === 'week' ? 'Últimos 7 días' : timeRange === 'month' ? 'Últimos 30 días' : 'Últimos 90 días'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={loadStats}
                        className="bg-[#334155] rounded-full p-2"
                    >
                        <Ionicons name="refresh" size={24} color="#38BDF8" />
                    </TouchableOpacity>
                </View>

                {/* TIME RANGE SELECTOR */}
                <View className="flex-row bg-[#0F172A] rounded-lg p-1 mb-2">
                    {(['week', 'month', 'quarter'] as const).map((range) => (
                        <TouchableOpacity
                            key={range}
                            onPress={() => setTimeRange(range)}
                            className={`flex-1 py-3 px-4 rounded-md ${timeRange === range ? 'bg-[#38BDF8]' : ''}`}
                        >
                            <Text className={`text-center font-medium ${timeRange === range ? 'text-white' : 'text-gray-400'}`}>
                                {range === 'week' ? '7 días' : range === 'month' ? '30 días' : '90 días'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* METRICS SUMMARY */}
            <View className="px-4 -mt-4">
                <Text className="text-lg font-bold text-white mb-4 px-2">📈 Resumen General</Text>
                <View className="flex-row flex-wrap mb-6">
                    {statsSummary && (
                        <>
                            {renderMetricCard(
                                'Pedidos Totales',
                                statsSummary.totalOrders,
                                'cart-outline',
                                '#38BDF8',
                                `+${statsSummary.todayOrders} hoy`,
                                statsSummary.weekGrowth
                            )}
                            {renderMetricCard(
                                'Ingresos',
                                formatCurrency(statsSummary.totalRevenue),
                                'cash-outline',
                                '#10B981',
                                `Avg: ${formatCurrency(statsSummary.avgOrderValue)}`,
                                statsSummary.weekGrowth
                            )}
                            {renderMetricCard(
                                'Completados',
                                statsSummary.completedOrders,
                                'checkmark-circle-outline',
                                '#10B981',
                                `${statsSummary.successRate.toFixed(1)}% éxito`
                            )}
                            {renderMetricCard(
                                'Pendientes',
                                statsSummary.pendingOrders,
                                'time-outline',
                                '#F59E0B',
                                `${((statsSummary.pendingOrders / statsSummary.totalOrders) * 100).toFixed(1)}% total`
                            )}
                        </>
                    )}
                </View>

                {/* STATUS DISTRIBUTION */}
                <View className="bg-[#1E293B] rounded-2xl p-5 mb-6 border border-[#334155]">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-white">📋 Distribución por Estado</Text>
                        <Text className="text-gray-400 text-sm">
                            Total: {statsSummary?.totalOrders} pedidos
                        </Text>
                    </View>

                    {ordersByStatus.length > 0 ? (
                        <>
                            {ordersByStatus.map((status) => (
                                <View key={status.name} className="flex-row items-center justify-between py-3 border-b border-[#334155] last:border-b-0">
                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-3 h-3 rounded-full mr-3"
                                            style={{ backgroundColor: status.color }}
                                        />
                                        <View className="flex-1">
                                            <Text className="text-white font-medium">{status.name}</Text>
                                            {status.revenue !== undefined && (
                                                <Text className="text-gray-400 text-xs">
                                                    {formatCurrency(status.revenue)}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="text-white font-bold mr-3 text-lg">{status.count}</Text>
                                        <Text className="text-gray-400 text-sm bg-[#334155] px-2 py-1 rounded">
                                            {status.percentage}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </>
                    ) : (
                        <Text className="text-gray-400 text-center py-4">
                            No hay datos de estados disponibles
                        </Text>
                    )}
                </View>

                {/* CHART SELECTOR */}
                <View className="flex-row justify-center mb-4 bg-[#1E293B] rounded-lg p-1 mx-2">
                    <TouchableOpacity
                        onPress={() => setSelectedChart('line')}
                        className={`flex-1 py-3 px-6 rounded-md ${selectedChart === 'line' ? 'bg-[#38BDF8]' : ''}`}
                    >
                        <Text className={`text-center font-medium ${selectedChart === 'line' ? 'text-white' : 'text-gray-400'}`}>
                            Tendencia
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setSelectedChart('bar')}
                        className={`flex-1 py-3 px-6 rounded-md ${selectedChart === 'bar' ? 'bg-[#38BDF8]' : ''}`}
                    >
                        <Text className={`text-center font-medium ${selectedChart === 'bar' ? 'text-white' : 'text-gray-400'}`}>
                            Comparación
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* CHART SECTION */}
                {ordersPerDay.length > 0 ? (
                    <View className="bg-[#1E293B] rounded-2xl p-5 mb-6 border border-[#334155]">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-white">
                                📊 {selectedChart === 'line' ? 'Tendencia de Pedidos' : 'Volumen Diario'}
                            </Text>
                            <Text className="text-gray-400 text-sm">
                                {ordersPerDay.length} días
                            </Text>
                        </View>

                        {selectedChart === 'line' ? (
                            <LineChart
                                data={{
                                    labels: ordersPerDay.map((o) => formatShortDate(o.date)),
                                    datasets: [
                                        {
                                            data: ordersPerDay.map((o) => o.count),
                                            color: () => '#38BDF8',
                                            strokeWidth: 3,
                                        },
                                    ],
                                }}
                                width={screenWidth - 56}
                                height={220}
                                yAxisSuffix=""
                                yAxisInterval={1}
                                chartConfig={{
                                    backgroundGradientFrom: '#1E293B',
                                    backgroundGradientTo: '#1E293B',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(56,189,248,${opacity})`,
                                    labelColor: () => '#94A3B8',
                                    propsForDots: {
                                        r: '5',
                                        strokeWidth: '2',
                                        stroke: '#0F172A',
                                    },
                                    propsForBackgroundLines: {
                                        stroke: '#334155',
                                        strokeDasharray: '5',
                                    },
                                    propsForLabels: {
                                        fontSize: 10,
                                    },
                                }}
                                bezier
                                style={{ borderRadius: 16 }}
                                withVerticalLines={false}
                                withInnerLines={true}
                            />
                        ) : (
                            <BarChart
                                data={{
                                    labels: ordersPerDay.map((o) => formatShortDate(o.date)),
                                    datasets: [
                                        {
                                            data: ordersPerDay.map((o) => o.count),
                                        },
                                    ],
                                }}
                                width={screenWidth - 56}
                                height={220}
                                yAxisLabel=""
                                yAxisSuffix=""
                                chartConfig={{
                                    backgroundGradientFrom: '#1E293B',
                                    backgroundGradientTo: '#1E293B',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(52,211,153,${opacity})`,
                                    labelColor: () => '#94A3B8',
                                    propsForBackgroundLines: {
                                        stroke: '#334155',
                                    },
                                    barPercentage: 0.6,
                                    barRadius: 4,
                                }}
                                style={{ borderRadius: 16 }}
                                showValuesOnTopOfBars={true}
                            />
                        )}

                        {/* CHART STATS */}
                        <View className="flex-row justify-between mt-6 pt-4 border-t border-[#334155]">
                            <View className="items-center">
                                <Text className="text-gray-400 text-sm">Total período</Text>
                                <Text className="text-white font-bold text-lg">
                                    {ordersPerDay.reduce((sum, day) => sum + day.count, 0)}
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-gray-400 text-sm">Promedio/día</Text>
                                <Text className="text-white font-bold text-lg">
                                    {ordersPerDay.length > 0
                                        ? (ordersPerDay.reduce((sum, day) => sum + day.count, 0) / ordersPerDay.length).toFixed(1)
                                        : '0'
                                    }
                                </Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-gray-400 text-sm">Día pico</Text>
                                <Text className="text-white font-bold text-lg">
                                    {ordersPerDay.length > 0
                                        ? Math.max(...ordersPerDay.map(o => o.count))
                                        : '0'
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="bg-[#1E293B] rounded-2xl p-8 mb-6 border border-[#334155] items-center">
                        <Ionicons name="analytics-outline" size={48} color="#4B5563" />
                        <Text className="text-gray-400 mt-3">No hay datos para el gráfico</Text>
                    </View>
                )}

                {/* PIE CHART */}
                {ordersByStatus.length > 0 && (
                    <View className="bg-[#1E293B] rounded-2xl p-5 mb-6 border border-[#334155]">
                        <Text className="text-lg font-bold text-white mb-4">🥧 Distribución Porcentual</Text>

                        <View className="items-center">
                            <PieChart
                                data={ordersByStatus}
                                width={screenWidth - 56}
                                height={200}
                                chartConfig={{
                                    color: () => '#fff',
                                }}
                                accessor="count"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                                hasLegend={false}
                            />
                        </View>

                        {/* CUSTOM LEGEND */}
                        <View className="flex-row flex-wrap justify-center mt-4 gap-2">
                            {ordersByStatus.map((status, index) => (
                                <View key={index} className="flex-row items-center bg-[#334155] rounded-lg px-3 py-2 m-1">
                                    <View
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: status.color }}
                                    />
                                    <Text className="text-gray-300 text-sm">
                                        {status.name}: <Text className="text-white font-medium">{status.count}</Text>
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* INSIGHTS SECTION */}
                <View className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-5 mb-10 border border-[#334155]">
                    <Text className="text-lg font-bold text-white mb-4">💡 Insights y Recomendaciones</Text>

                    <View className="space-y-4">
                        <View className="flex-row items-start bg-[#334155]/30 rounded-xl p-4">
                            <Ionicons name="analytics-outline" size={24} color="#38BDF8" />
                            <View className="ml-3 flex-1">
                                <Text className="text-white font-medium">Rendimiento del Período</Text>
                                <Text className="text-gray-400 text-sm mt-1">
                                    {statsSummary && statsSummary.weekGrowth > 0
                                        ? `Crecimiento positivo del ${formatPercentage(statsSummary.weekGrowth)} respecto al período anterior.`
                                        : statsSummary && statsSummary.weekGrowth < 0
                                            ? `Disminución del ${formatPercentage(Math.abs(statsSummary.weekGrowth))}. Considera revisar estrategias.`
                                            : 'Crecimiento estable. Mantén el ritmo actual.'
                                    }
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-start bg-[#334155]/30 rounded-xl p-4">
                            <Ionicons name="alert-circle-outline" size={24} color="#F59E0B" />
                            <View className="ml-3 flex-1">
                                <Text className="text-white font-medium">Acción Requerida</Text>
                                <Text className="text-gray-400 text-sm mt-1">
                                    {statsSummary && statsSummary.pendingOrders > 0
                                        ? `${statsSummary.pendingOrders} pedidos pendientes requieren atención. Prioriza los más antiguos.`
                                        : 'Todos los pedidos están gestionados. Buen trabajo!'
                                    }
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-start bg-[#334155]/30 rounded-xl p-4">
                            <Ionicons name="trending-up-outline" size={24} color="#10B981" />
                            <View className="ml-3 flex-1">
                                <Text className="text-white font-medium">Oportunidad</Text>
                                <Text className="text-gray-400 text-sm mt-1">
                                    {statsSummary && statsSummary.avgOrdersPerDay > 0
                                        ? `Promedio de ${statsSummary.avgOrdersPerDay.toFixed(1)} pedidos/día. Objetivo: alcanzar ${statsSummary.maxOrdersDay} pedidos diarios consistentemente.`
                                        : 'Establece una línea base para medir el crecimiento futuro.'
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* DATA REFRESH INFO */}
                <View className="items-center pb-8">
                    <Text className="text-gray-500 text-sm">
                        Última actualización: {new Date().toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        })}
                    </Text>
                    <TouchableOpacity onPress={onRefresh} className="mt-2">
                        <Text className="text-[#38BDF8] text-sm font-medium">
                            Actualizar datos ahora
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}