import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import "./global.css";
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import DrawerContent from './components/DrawerContent';
import AdminCategorias from './pages/AdminCategorias';
import AdminProductos from './pages/AdminProductos';
import AdminRestaurantes from './pages/AdminRestaurantes';
import AdminRoles from './pages/AdminRoles';
import AdminUsuarios from './pages/AdminUsuarios';
import Restaurantes from './pages/Restaurantes';
import RestaurantProducts from './pages/RestaurantProducts';
import DriverOrders from './pages/DriverOrders';
import DriverActiveOrders from './pages/DriverActiveOrders';
import DriverCompleteOrders from './pages/DriverCompleteOrders';
import ClientOrderHistory from './pages/ClientOrderHistory';
import OrdersStats from './pages/OrdersStats';

import AdminPanel from './pages/AdminPanel';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: true }}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="AdminPanel" component={AdminPanel} options={{ title: 'Panel de Admin' }} />
      <Drawer.Screen name="RestaurantesCliente" component={Restaurantes} options={{ title: 'Restaurantes' }} />
      <Drawer.Screen name="RestaurantProducts" component={RestaurantProducts} options={{ title: 'Productos del restaurante' }} />
      <Drawer.Screen name="DriverOrders" component={DriverOrders} options={{ title: 'Pedidos Disponibles' }} />
      <Drawer.Screen name="DriverActiveOrders" component={DriverActiveOrders} options={{ title: 'Mis Pedidos (Activos)' }} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = React.useState('Login');
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    // Importamos supabase dinámicamente como lo hacías o directamente si prefieres
    const initializeAuth = async () => {
      const { supabase } = await import('./supabase/supabase');

      // Comprobación inicial de la sesión
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setInitialRoute('Main');
      } else {
        setInitialRoute('Login');
      }
      setLoading(false);

      // Escuchar cambios en la autenticación (Login, Logout, Token Refreshed)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          //Si no hay sesión o el refresh token falló, mandamos a Login
          setInitialRoute('Login');
        } else {
          setInitialRoute('Main');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Main" component={MainDrawer} />

            {/* Rutas de Admin (fuera del Drawer para tener Botón de Atrás) */}
            <Stack.Screen name="AdminCategorias" component={AdminCategorias} options={{ headerShown: true, title: 'Categorías' }} />
            <Stack.Screen name="AdminProductos" component={AdminProductos} options={{ headerShown: true, title: 'Productos' }} />
            <Stack.Screen name="AdminRestaurantes" component={AdminRestaurantes} options={{ headerShown: true, title: 'Restaurantes' }} />
            <Stack.Screen name="AdminRoles" component={AdminRoles} options={{ headerShown: true, title: 'Roles' }} />
            <Stack.Screen name="AdminUsuarios" component={AdminUsuarios} options={{ headerShown: true, title: 'Usuarios' }} />
            <Stack.Screen name="OrdersStats" component={OrdersStats} options={{ headerShown: true, title: 'Estadísticas' }} />
            <Stack.Screen name="DriverCompleteOrders" component={DriverCompleteOrders} options={{ headerShown: true, title: 'Finalizar Pedidos' }} />
            <Stack.Screen name="ClientOrderHistory" component={ClientOrderHistory} options={{ headerShown: true, title: 'Historial de Pedidos' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
