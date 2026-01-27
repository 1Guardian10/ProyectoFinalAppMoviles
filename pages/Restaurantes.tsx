import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import { supabase } from '../supabase/supabase';

export default function Restaurantes({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);

  const fetch = async () => {
    const { data, error } = await supabase.from('restaurantes').select('*');
    if (error) return Alert.alert('Error', error.message);
    setItems(data || []);
  };

  useEffect(() => {
    fetch();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
      <Text style={{ fontWeight: '600' }}>{item.nombre}</Text>
      {item.direccion ? <Text style={{ color: '#555' }}>{item.direccion}</Text> : null}
      <Button title="Ver productos" onPress={() => navigation.navigate('RestaurantProducts', { restaurantId: item.id, restaurantName: item.nombre })} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: 'bold', padding: 12 }}>Restaurantes</Text>
      <FlatList data={items} keyExtractor={(i) => String(i.id)} renderItem={renderItem} ListEmptyComponent={<Text style={{ padding: 12 }}>No hay restaurantes</Text>} />
    </View>
  );
}
