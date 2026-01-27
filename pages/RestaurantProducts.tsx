import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

export default function RestaurantProducts({ route, navigation }: any) {
  const { restaurantId } = route.params || {};

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [cart, setCart] = useState<any[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [search, setSearch] = useState('');

  /* ================== FETCH ================== */
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('restaurante_id', restaurantId)
      .order('id', { ascending: true });

    if (error) return showAlert('Error', error.message);
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('id', { ascending: true });

    if (error) return showAlert('Error', error.message);
    setCategories(data || []);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      fetchCategories();
    }, [restaurantId])
  );

  /* ================== FILTROS ================== */
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.nombre
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      selectedCategory === null || p.categoria_id === selectedCategory;

    return matchSearch && matchCategory;
  });

  /* ================== CARRITO ================== */
  const addToCart = (product: any) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.producto_id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.producto_id === product.id
            ? {
              ...p,
              cantidad: p.cantidad + 1,
              subtotal: (p.cantidad + 1) * (product.precio || 0),
            }
            : p
        );
      }
      return [
        ...prev,
        {
          producto_id: product.id,
          nombre_producto: product.nombre,
          cantidad: 1,
          precio_unitario: product.precio || 0,
          subtotal: product.precio || 0,
        },
      ];
    });
  };

  const removeFromCart = (producto_id: number) => {
    setCart((prev) => prev.filter((p) => p.producto_id !== producto_id));
  };

  const totalGeneral = cart.reduce((s, p) => s + (p.subtotal || 0), 0);

  /* ================== PERMISOS UBICACIÓN ================== */
  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        showAlert(
          'Permiso concedido',
          'Se podrá guardar la ubicación al realizar el pedido.'
        );
      } else {
        showAlert(
          'Permiso denegado',
          '¿Deseas abrir los ajustes para activarlo?',
          [
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings() },
            { text: 'Cancelar', style: 'cancel' },
          ]
        );
      }
    } catch (e: any) {
      showAlert('Error', e.message || 'No se pudo comprobar permisos');
    }
  };

  /* ================== REALIZAR PEDIDO ================== */
  const placeOrder = async () => {
    if (!cart.length)
      return showAlert(
        'Carrito vacío',
        'Agrega productos antes de realizar el pedido'
      );

    try {
      const userResp: any = await supabase.auth.getUser();
      const user = userResp?.data?.user;
      if (!user)
        return showAlert(
          'Autenticación',
          'Debe iniciar sesión para realizar pedidos'
        );

      const { data: pedidoData, error: pedidoErr } = await supabase
        .from('pedidos')
        .insert({
          cliente_id: user.id,
          restaurante_id: restaurantId,
          total: totalGeneral,
          estado: 'pendiente',
        })
        .select('id')
        .single();

      if (pedidoErr) return showAlert('Error', pedidoErr.message);

      const pedidoId = pedidoData.id;

      const detalles = cart.map((p) => ({
        pedido_id: pedidoId,
        producto_id: p.producto_id,
        nombre_producto: p.nombre_producto,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario,
        subtotal: p.subtotal,
      }));

      const { error: detalleErr } = await supabase
        .from('detalle_pedidos')
        .insert(detalles);

      if (detalleErr) return showAlert('Error', detalleErr.message);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          await supabase.from('entregas').insert({
            pedido_id: pedidoId,
            latitud: loc.coords.latitude,
            longitud: loc.coords.longitude,
            estado: 'pendiente',
          });
        }
      } catch { }

      showAlert('Pedido exitoso', `Pedido esta a la espera de ser entregado`);
      setCart([]);
      setCartVisible(false);
      navigation.navigate('RestaurantesCliente');
    } catch (e: any) {
      showAlert('Error', e.message || String(e));
    }
  };

  /* ================== CARD PRODUCTO ================== */
  const renderProduct = ({ item }: { item: any }) => (
    <View className="w-1/2 p-2">
      <View className="bg-gray-200 rounded-3xl p-3 items-center">
        <Image
          source={{ uri: item.imagen_url }}
          className="w-24 h-24 rounded-full"
          resizeMode="cover"
        />

        <Text className="text-blue-700 font-extrabold mt-2 text-sm text-center">
          {item.nombre}
        </Text>

        <Text className="text-blue-700 text-xs font-semibold">
          2 tamaños
        </Text>

        <Text className="text-blue-700 text-xs font-extrabold">
          Bs {item.precio}
        </Text>

        <TouchableOpacity
          onPress={() => addToCart(item)}
          className="absolute bottom-2 right-2 bg-blue-600 w-8 h-8 rounded-full items-center justify-center"
        >
          <Text className="text-white text-lg">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">

      {/* ================= HEADER FIJO ================= */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-blue-700 text-2xl font-extrabold leading-[26px]">
              QUE SE TE
            </Text>
            <Text className="text-blue-700 text-2xl font-extrabold leading-[26px]">
              ANTOJA
            </Text>
            <Text className="text-blue-700 text-2xl font-extrabold leading-[26px]">
              HOY?
            </Text>
          </View>

          <Image
            source={require('../assets/logo2.png')}
            className="w-12 h-12"
            resizeMode="contain"
          />
        </View>

        {/* Buscador */}
        <View className="mt-3 bg-gray-200 rounded-full px-4 py-2 flex-row items-center">
          <Text className="mr-2 text-blue-700 text-base">🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar tu comida favorita..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-sm text-gray-700"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text className="text-gray-400 text-base">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categorías */}
        <FlatList
          data={[{ id: null, nombre: 'Todos' }, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id ?? 'all')}
          className="mt-3"
          renderItem={({ item }) => {
            const active = selectedCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                className={`px-4 py-1.5 mr-2 rounded-full ${active ? 'bg-blue-700' : 'bg-gray-200'
                  }`}
              >
                <Text
                  className={`text-xs font-extrabold ${active ? 'text-white' : 'text-blue-700'
                    }`}
                >
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ================= SOLO SCROLLEA LA LISTA ================= */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(i) => String(i.id)}
        numColumns={2}
        renderItem={renderProduct}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="text-center mt-10 text-gray-500">
            No hay productos
          </Text>
        }
      />

      {/* BOTÓN CARRITO */}
      <TouchableOpacity
        onPress={() => setCartVisible(true)}
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg z-50"
      >
        <Text className="text-white text-lg">🛒</Text>
      </TouchableOpacity>

      {/* ================= MODAL CARRITO ================= */}
      <Modal animationType="slide" transparent visible={cartVisible}>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[30px] p-5 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-blue-700 font-bold text-xl">
                🛒 Tu carrito
              </Text>
              <TouchableOpacity onPress={() => setCartVisible(false)}>
                <Text className="text-gray-500 text-xl">✕</Text>
              </TouchableOpacity>
            </View>

            {cart.length === 0 && (
              <Text className="text-center text-gray-500">
                Tu carrito está vacío
              </Text>
            )}

            <FlatList
              data={cart}
              keyExtractor={(c) => String(c.producto_id)}
              renderItem={({ item }) => (
                <View className="border-b border-gray-100 py-2">
                  <Text className="font-bold text-gray-800">
                    {item.nombre_producto}
                  </Text>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">
                      {item.cantidad} x Bs {item.precio_unitario}
                    </Text>
                    <Text className="text-blue-700 font-bold">
                      Bs {item.subtotal}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.producto_id)}
                  >
                    <Text className="text-red-500 text-sm">Quitar</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <View className="mt-4 border-t border-gray-200 pt-4">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold">Total</Text>
                <Text className="text-lg font-bold text-blue-700">
                  Bs {totalGeneral}
                </Text>
              </View>

              <TouchableOpacity
                onPress={checkLocationPermission}
                className="mt-3 bg-gray-100 py-3 rounded-xl items-center border border-gray-300"
              >
                <Text className="text-gray-700 font-semibold">
                  📍 Probar permisos de ubicación
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={placeOrder}
                className="mt-4 bg-blue-600 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-lg">
                  Confirmar pedido
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}