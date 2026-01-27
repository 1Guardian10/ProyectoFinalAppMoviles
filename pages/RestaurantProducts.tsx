import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase/supabase';

export default function RestaurantProducts({ route, navigation }: any) {
  const { restaurantId, restaurantName } = route.params || {};
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const fetch = async () => {
    const { data, error } = await supabase.from('productos').select('*').eq('restaurante_id', restaurantId).order('id', { ascending: true });
    if (error) return Alert.alert('Error', error.message);
    setProducts(data || []);
  };

  useEffect(() => {
    fetch();
  }, []);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.producto_id === product.id);
      if (exists) {
        return prev.map((p) => (p.producto_id === product.id ? { ...p, cantidad: p.cantidad + 1, subtotal: (p.cantidad + 1) * (product.precio || 0) } : p));
      }
      return [...prev, { producto_id: product.id, nombre_producto: product.nombre, cantidad: 1, precio_unitario: product.precio || 0, subtotal: product.precio || 0 }];
    });
  };

  const removeFromCart = (producto_id: number) => {
    setCart((prev) => prev.filter((p) => p.producto_id !== producto_id));
  };

  const placeOrder = async () => {
    if (!cart.length) return Alert.alert('Carrito vacío', 'Agrega productos antes de realizar el pedido');

    try {
      const userResp: any = await supabase.auth.getUser();
      const user = userResp?.data?.user;
      if (!user) return Alert.alert('Autenticación', 'Debe iniciar sesión para realizar pedidos');

      const total = cart.reduce((s, p) => s + (p.subtotal || 0), 0);

      const { data: pedidoData, error: pedidoErr } = await supabase.from('pedidos').insert({ cliente_id: user.id, restaurante_id: restaurantId, total }).select('id').single();
      if (pedidoErr) {
        console.log('pedido insert error', pedidoErr);
        return Alert.alert('Error', pedidoErr.message || JSON.stringify(pedidoErr));
      }

      const pedidoId = pedidoData.id;
      const detalles = cart.map((p) => ({ pedido_id: pedidoId, producto_id: p.producto_id, nombre_producto: p.nombre_producto, cantidad: p.cantidad, precio_unitario: p.precio_unitario, subtotal: p.subtotal }));

      const { error: detalleErr } = await supabase.from('detalle_pedidos').insert(detalles);
      if (detalleErr) {
        console.log('detalle insert error', detalleErr);
        return Alert.alert('Error', detalleErr.message || JSON.stringify(detalleErr));
      }

      Alert.alert('Pedido creado', `Pedido #${pedidoId} creado correctamente`);
      setCart([]);
      navigation.navigate('Home');
    } catch (e: any) {
      Alert.alert('Error', e.message || String(e));
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
      <Text style={{ fontWeight: '600' }}>{item.nombre}</Text>
      <Text>Precio: {item.precio ?? '-'}</Text>
      <Button title="Agregar" onPress={() => addToCart(item)} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: 'bold', padding: 12 }}>{restaurantName || 'Productos'}</Text>

      <FlatList data={products} keyExtractor={(i) => String(i.id)} renderItem={renderProduct} ListEmptyComponent={<Text style={{ padding: 12 }}>No hay productos</Text>} />

      <View style={{ padding: 12, borderTopWidth: 1, borderColor: '#ddd' }}>
        <Text style={{ fontWeight: '600' }}>Carrito</Text>
        {cart.length === 0 && <Text>Vacío</Text>}
        {cart.map((c) => (
          <View key={c.producto_id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text>{c.nombre_producto} x{c.cantidad}</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => removeFromCart(c.producto_id)} style={{ marginLeft: 8 }}>
                <Text style={{ color: 'red' }}>Quitar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Button title="Realizar pedido" onPress={placeOrder} />
      </View>
    </View>
  );
}
