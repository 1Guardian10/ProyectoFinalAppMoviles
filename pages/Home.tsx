import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { supabase } from '../supabase/supabase';

export default function Home({ navigation }: any) {
  return (
    <View >
      <Text >Bienvenido</Text>
      <Text >Esta es la página principal.</Text>
      <Button title="Abrir menú" onPress={() => navigation.toggleDrawer()} />
    </View>
  );
}
