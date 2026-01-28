import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ADMIN_OPTIONS = [
    {
        id: 'restaurantes',
        title: 'Restaurantes',
        description: 'Gestionar lista de restaurantes',
        icon: 'restaurant',
        route: 'AdminRestaurantes',
        color: '#3B82F6',
        bg: 'bg-blue-50',
    },
    {
        id: 'productos',
        title: 'Productos',
        description: 'Gestionar menú y platillos',
        icon: 'restaurant-menu',
        route: 'AdminProductos',
        color: '#10B981',
        bg: 'bg-green-50',
    },
    {
        id: 'categorias',
        title: 'Categorías',
        description: 'Organizar por tipos de comida',
        icon: 'category',
        route: 'AdminCategorias',
        color: '#F59E0B',
        bg: 'bg-amber-50',
    },
    {
        id: 'usuarios',
        title: 'Usuarios',
        description: 'Control de clientes y repartidores',
        icon: 'people',
        route: 'AdminUsuarios',
        color: '#8B5CF6',
        bg: 'bg-purple-50',
    },
    {
        id: 'roles',
        title: 'Roles',
        description: 'Gestionar permisos del sistema',
        icon: 'admin-panel-settings',
        route: 'AdminRoles',
        color: '#EF4444',
        bg: 'bg-red-50',
    },
    {
        id: 'stats',
        title: 'Estadísticas',
        description: 'Ver métricas y rendimiento',
        icon: 'bar-chart',
        route: 'OrdersStats',
        color: '#EC4899',
        bg: 'bg-pink-50',
    },
    {
        id: 'historial',
        title: 'Pedidos',
        description: 'Historial completo de pedidos',
        icon: 'assignment',
        route: 'ClientOrderHistory',
        color: '#6366F1',
        bg: 'bg-indigo-50',
    },
];

export default function AdminPanel({ navigation }: any) {
    return (
        <SafeAreaView className="flex-1 bg-gray-50 uppercase shadow-none">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Header */}
                <View className="bg-blue-600 rounded-b-[40px] px-6 pt-12 pb-16 relative overflow-hidden shadow-xl">
                    {/* Decoraciones */}
                    <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                    <View className="absolute bottom-5 -left-5 w-24 h-24 bg-white/5 rounded-full" />

                    <View className="max-w-6xl mx-auto w-full flex-row items-center justify-between">
                        <View>
                            <Text className="text-white text-3xl md:text-4xl font-black">Panel Admin</Text>
                            <Text className="text-blue-100 text-lg mt-1">Habilitar el éxito de MoshiApp</Text>
                        </View>
                        <View className="bg-white/20 p-3 rounded-2xl border border-white/30 backdrop-blur-sm">
                            <MaterialIcons name="dashboard" size={32} color="white" />
                        </View>
                    </View>
                </View>

                {/* Grid de Opciones */}
                <View className="max-w-6xl mx-auto w-full px-6 -mt-8">
                    <View className="flex-row flex-wrap -mx-2">
                        {ADMIN_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4"
                                onPress={() => navigation.navigate(option.route)}
                                activeOpacity={0.7}
                            >
                                <View className="bg-white rounded-[32px] p-5 shadow-lg shadow-blue-900/10 border border-gray-100 flex-row sm:flex-col items-center">
                                    <View className={`${option.bg} w-16 h-16 rounded-3xl items-center justify-center mb-0 sm:mb-4 mr-4 sm:mr-0`}>
                                        <MaterialIcons name={option.icon as any} size={32} color={option.color} />
                                    </View>
                                    <View className="flex-1 sm:items-center">
                                        <Text className="text-gray-900 font-bold text-lg mb-1 sm:text-center">{option.title}</Text>
                                        <Text className="text-gray-500 text-xs text-left sm:text-center leading-tight">
                                            {option.description}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
