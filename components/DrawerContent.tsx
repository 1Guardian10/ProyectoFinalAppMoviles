import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { supabase } from '../supabase/supabase';

export default function DrawerContent(props: DrawerContentComponentProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [debugMsg, setDebugMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      try {
        const userResp: any = await supabase.auth.getUser();
        const user = userResp?.data?.user;
        console.log('DrawerContent: supabase.auth.getUser ->', userResp);
        setUserId(user?.id ?? null);
        if (!user) {
          if (mounted) setIsAdmin(false);
          if (mounted) setDebugMsg('No hay usuario autenticado');
          return;
        }

        const { data: usuario, error: uErr } = await supabase
          .from('usuarios')
          .select('rol_id')
          .eq('id', user.id)
          .single();
        if (uErr || !usuario) {
          if (mounted) setIsAdmin(false);
          if (mounted) setDebugMsg('No existe fila en tabla usuarios para este id');
          console.log('DrawerContent: usuarios select error or empty', uErr, usuario);
          return;
        }

        if (usuario.rol_id == null) {
          if (mounted) setIsAdmin(false);
          return;
        }

        const { data: role, error: rErr } = await supabase
          .from('roles')
          .select('nombre')
          .eq('id', usuario.rol_id)
          .single();

        console.log('DrawerContent: role query', role, rErr);
        const rname = ((role as any)?.nombre || '').toString().toLowerCase();
        if (mounted) {
          setRoleName(rname || null);
          setIsAdmin(['admin', 'administrator'].includes(rname));
          setIsClient(rname === 'cliente' || rname === 'client');
          setIsDriver(rname === 'repartidor' || rname === 'driver');
          if (['admin', 'administrator'].includes(rname)) setDebugMsg(null);
          else if (rname === 'cliente' || rname === 'client') setDebugMsg(null);
          else if (rname === 'repartidor' || rname === 'driver') setDebugMsg(null);
          else setDebugMsg("El rol del usuario no es 'admin', 'cliente' ni 'repartidor'");
        }
      } catch (e) {
        if (mounted) setIsAdmin(false);
      }
    };

    loadRole();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
      loadRole();
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      props.navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo cerrar sesión');
    }
  };

  return (
    <View>
      <Text>Menú</Text>
      <Pressable onPress={() => props.navigation.navigate('Home')}>
        <Text>Inicio</Text>
      </Pressable>
      {isAdmin && (
        <>
          <Pressable onPress={() => props.navigation.navigate('AdminCategorias')}>
            <Text>Categorías (Admin)</Text>
          </Pressable>
          <Pressable onPress={() => props.navigation.navigate('AdminProductos')}>
            <Text>Productos (Admin)</Text>
          </Pressable>
          <Pressable onPress={() => props.navigation.navigate('AdminRestaurantes')}>
            <Text>Restaurantes (Admin)</Text>
          </Pressable>
          <Pressable onPress={() => props.navigation.navigate('AdminRoles')}>
            <Text>Roles (Admin)</Text>
          </Pressable>
          <Pressable onPress={() => props.navigation.navigate('AdminUsuarios')}>
            <Text>Usuarios (Admin)</Text>
          </Pressable>
          <Pressable onPress={() => props.navigation.navigate('RestaurantesCliente')}>
            <Text>Restaurantes</Text>
          </Pressable>
          <Pressable onPress={() => props.navigation.navigate('DriverOrders')}>
            <Text>Pedidos (Repartidor)</Text>
          </Pressable>
        </>
      )}
      {isClient && (
        <>
          <Pressable onPress={() => props.navigation.navigate('RestaurantesCliente')}>
            <Text>Restaurantes</Text>
          </Pressable>
        </>
      )}
      {isDriver && (
        <>
          <Pressable onPress={() => props.navigation.navigate('DriverOrders')}>
            <Text>Pedidos (Repartidor)</Text>
          </Pressable>
        </>
      )}
      <Pressable onPress={handleLogout}>
        <Text style={{ color: 'red' }}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}