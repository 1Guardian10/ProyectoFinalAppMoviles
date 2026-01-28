import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Image, useWindowDimensions, TextInput } from 'react-native';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

export default function Restaurantes({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { width } = useWindowDimensions();

  const isSmallPhone = width < 360;

  const fetch = async () => {
    const { data, error } = await supabase.from('restaurantes').select('*');
    if (error) return showAlert('Error', error.message);
    setItems(data || []);
  };

  useEffect(() => {
    fetch();
  }, []);

  // 🔍 Lista filtrada según el buscador
  const filteredItems = items.filter((item) =>
    item.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (item.direccion && item.direccion.toLowerCase().includes(search.toLowerCase()))
  );

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() =>
        navigation.navigate('RestaurantProducts', {
          restaurantId: item.id,
          restaurantName: item.nombre,
        })
      }
      className="flex-row items-center bg-white mx-3 my-2 p-3 rounded-2xl shadow-sm border border-gray-100 active:bg-blue-50"
    >
      <View className={`${isSmallPhone ? 'w-12 h-12' : 'w-16 h-16'} rounded-full mr-3 overflow-hidden bg-gray-100`}>
        <Image
          source={item.imagen_url ? { uri: item.imagen_url } : require('../assets/ramen.jpg')}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      <View className="flex-1">
        <Text
          numberOfLines={1}
          className={`text-blue-700 font-bold ${isSmallPhone ? 'text-sm' : 'text-base'}`}
        >
          {item.nombre}
        </Text>

        {item.direccion ? (
          <Text
            numberOfLines={1}
            className={`text-gray-500 ${isSmallPhone ? 'text-[10px]' : 'text-xs'}`}
          >
            {item.direccion}
          </Text>
        ) : null}

        <View className="flex-row items-center mt-1 flex-wrap">
          <Text className="text-blue-600 text-[10px] font-semibold">
            ⏱ 15-30 min
          </Text>
          <Text className="text-gray-400 mx-1">•</Text>
          <Text className="text-blue-600 text-[10px] font-semibold">
            🚚 Sin costo
          </Text>
        </View>
      </View>

      <View
        className={`
          ml-2 bg-blue-600 rounded-full items-center justify-center shadow-md
          ${isSmallPhone ? 'px-2 py-1' : 'px-4 py-2'}
        `}
      >
        <Text
          className={`text-white font-bold ${isSmallPhone ? 'text-[10px]' : 'text-xs'
            }`}
        >
          {isSmallPhone ? 'Ver →' : 'Ver productos →'}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* 🔍 Buscador mejorado - Diseño profesional */}
      <View className="mx-4 mt-6 mb-4">
        <View className={`flex-row items-center bg-white rounded-xl px-4 py-2.5 shadow-sm border transition-all duration-200 ${isFocused
          ? 'border-blue-500 shadow-md'
          : 'border-gray-200'
          }`}>

          {/* Icono de búsqueda mejorado */}
          <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 transition-colors duration-200 ${isFocused ? 'bg-blue-50' : 'bg-gray-50'
            }`}>
            <Text className={`text-lg ${isFocused ? 'text-blue-500' : 'text-gray-400'}`}>
              🔍
            </Text>
          </View>

          {/* Input con mejor tipografía y espaciado */}
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar restaurantes, direcciones..."
            placeholderTextColor="#94A3B8"
            className="flex-1 text-base text-gray-800 placeholder:text-sm font-normal"
            style={{ fontFamily: 'System' }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            clearButtonMode="never"
            returnKeyType="search"
          />

          {/* Botón limpiar mejorado */}
          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              className="w-8 h-8 rounded-full items-center justify-center ml-2 active:bg-gray-200"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View className="w-5 h-5 rounded-full bg-gray-100 items-center justify-center">
                <Text className="text-gray-500 text-xs font-semibold">✕</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Contador dinámico con mejor diseño */}
        <View className="flex-row justify-between items-center mt-3 px-1">
          <Text className="text-gray-700 font-semibold text-base">
            {filteredItems.length} {filteredItems.length === 1 ? 'local disponible' : 'locales disponibles'}
          </Text>

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch('')}
              className="px-3 py-1.5 rounded-lg bg-gray-100 active:bg-gray-200"
            >
              <Text className="text-gray-600 text-xs font-medium">Limpiar búsqueda</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Indicador de búsqueda activa */}
      {search.length > 0 && filteredItems.length > 0 && (
        <View className="mx-4 mb-3 px-4 py-2 bg-blue-50 rounded-lg">
          <Text className="text-blue-700 text-sm">
            Mostrando resultados para: <Text className="font-semibold">"{search}"</Text>
          </Text>
        </View>
      )}

      <FlatList
        data={filteredItems}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Text className="text-gray-400 text-2xl">🔍</Text>
            </View>
            <Text className="text-gray-500 text-lg font-medium mb-1">
              No encontramos resultados
            </Text>
            <Text className="text-gray-400 text-sm text-center px-8">
              {search.length > 0
                ? `No hay coincidencias para "${search}"`
                : 'No hay restaurantes disponibles en este momento'}
            </Text>
          </View>
        }
      />
    </View>
  );
}