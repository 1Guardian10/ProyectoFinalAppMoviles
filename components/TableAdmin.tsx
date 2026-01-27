import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native'; 
import { Perfil } from '../types/typesDatabase/Perfiles';

const TableAdmin = ({ data }: { data: Perfil[] }) => {

  // FlatList pasa un objeto con la propiedad 'item', por eso desestructuramos { item }
  const renderItem = ({ item }: { item: Perfil }) => {
    return (
      <View className="flex-row border-b border-gray-100 p-4 items-center bg-white">
        {/* Nombre del Usuario */}
        <Text className="flex-1 text-gray-800 font-medium">
          {item.nombre}
        </Text>
        <View className="flex-1 items-center">
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-700 text-xs font-semibold uppercase">
              {item.rol}
            </Text>
          </View>
        </View>            

        {/* Botón de Acción */}
        <View className="w-20 items-end">
          <TouchableOpacity 
            activeOpacity={0.7}
            className="bg-red-500 px-3 py-2 rounded-lg"
            onPress={() => console.log('Borrar ID:', item.id)}
          >
            <Text className="text-white text-center text-[10px] font-bold uppercase">
              Borrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 rounded-t-lg overflow-hidden">
      {/* Header Estático */}
      <View className="flex-row bg-slate-900 p-4">
        <Text className="flex-1 text-gray-100 text-xs font-bold uppercase">Usuario</Text>
        <Text className="flex-1 text-gray-100 text-xs font-bold uppercase text-center">Permisos</Text>
        <Text className="w-20 text-gray-100 text-xs font-bold uppercase text-right">Acción</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View className="p-10 items-center">
            <Text className="text-gray-400">No hay perfiles registrados</Text>
          </View>
        }
      />
    </View>
  );
};

export default TableAdmin;