import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';
import { BarChart3 } from 'lucide-react-native';
// ICONOS
import {
  Home,
  List,
  Package,
  Store,
  Shield,
  Users,
  Truck,
  ShoppingBag,
  LogOut,
} from 'lucide-react-native';

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

        const rname = ((role as any)?.nombre || '').toString().toLowerCase();
        if (mounted) {
          setRoleName(rname || null);
          setIsAdmin(['admin', 'administrator'].includes(rname));
          setIsClient(rname === 'cliente' || rname === 'client');
          setIsDriver(rname === 'repartidor' || rname === 'driver');
          if (['admin', 'administrator', 'cliente', 'client', 'repartidor', 'driver'].includes(rname)) {
            setDebugMsg(null);
          } else {
            setDebugMsg("El rol del usuario no es 'admin', 'cliente' ni 'repartidor'");
          }
        }
      } catch (e) {
        if (mounted) setIsAdmin(false);
      }
    };

    loadRole();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadRole();
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      showAlert('Error', 'No se pudo cerrar sesión');
    }
  };

  // ITEM DEL MENÚ CON ICONO
  const MenuItem = ({
    title,
    onPress,
    icon,
  }: {
    title: string;
    onPress: () => void;
    icon: React.ReactNode;
  }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 rounded-xl mb-2 bg-white/90 active:bg-blue-600"
    >
      <View className="w-8 items-center">{icon}</View>
      <Text className="text-blue-700 text-base font-extrabold ml-2">
        {title}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-blue-700 px-4 pt-12">

      {/* HEADER */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center mb-2 overflow-hidden">
          <Image
            source={require('../assets/logoNavbar.png')}
            className="w-30 h-30"
            resizeMode="contain"
          />
        </View>

        <Text className="text-white text-xl font-extrabold">
          MOSHI APP
        </Text>

        {roleName && (
          <Text className="text-blue-200 text-sm capitalize mt-1">
            {roleName}
          </Text>
        )}
      </View>

      {/* MENÚ */}
      <View className="flex-1">
        <MenuItem
          title="Inicio"
          icon={<Home size={20} color="#2563EB" />}
          onPress={() => props.navigation.navigate('Home')}
        />

        {isAdmin && (
          <>
            <MenuItem
              title="Panel de Admin"
              icon={<Shield size={20} color="#2563EB" />}
              onPress={() => props.navigation.navigate('AdminPanel')}
            />
            <MenuItem
              title="Restaurantes"
              icon={<ShoppingBag size={20} color="#2563EB" />}
              onPress={() => props.navigation.navigate('RestaurantesCliente')}
            />
          </>
        )}

        {isClient && (
          <>
            <MenuItem
              title="Restaurantes"
              icon={<ShoppingBag size={20} color="#2563EB" />}
              onPress={() => props.navigation.navigate('RestaurantesCliente')}
            />
            <MenuItem
              title="Mis Pedidos"
              icon={<Package size={20} color="#2563EB" />}
              onPress={() => props.navigation.navigate('ClientOrderHistory')}
            />
          </>
        )}

        {isDriver && (
          <>
            <MenuItem
              title="Pedidos Disponibles"
              icon={<Truck size={20} color="#2563EB" />}
              onPress={() => props.navigation.navigate('DriverOrders')}
            />
            <MenuItem
              title="Mis Pedidos Activos"
              icon={<Package size={20} color="#2563EB" />}
              onPress={() => props.navigation.navigate('DriverActiveOrders')}
            />
            <MenuItem
              title="Finalizar Pedidos"
              icon={<ShoppingBag size={20} color="#2563EB" />}
              onPress={() => props.navigation.navigate('DriverCompleteOrders')}
            />
          </>
        )}
      </View>

      {/* FOOTER */}
      <View className="border-t border-blue-500 pt-4 mb-6">
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center px-4 py-3 rounded-xl bg-blue-600 active:bg-blue-700"
        >
          <LogOut size={20} color="white" />
          <Text className="text-white text-center font-extrabold ml-2">
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </View>
  );
}