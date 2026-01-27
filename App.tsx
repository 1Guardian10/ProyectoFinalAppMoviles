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
      <Drawer.Screen name="AdminCategorias" component={AdminCategorias} options={{ title: 'Categorías' }} />
      <Drawer.Screen name="AdminProductos" component={AdminProductos} options={{ title: 'Productos' }} />
      <Drawer.Screen name="AdminRestaurantes" component={AdminRestaurantes} options={{ title: 'Restaurantes' }} />
      <Drawer.Screen name="AdminRoles" component={AdminRoles} options={{ title: 'Roles' }} />
      <Drawer.Screen name="AdminUsuarios" component={AdminUsuarios} options={{ title: 'Usuarios' }} />
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
    async function checkSession() {
      try {
        const { data } = await import('./supabase/supabase').then(m => m.supabase.auth.getSession());
        if (data.session) {
          setInitialRoute('Main');
        }
      } catch (e) {
        // En caso de error, default a Login
      } finally {
        setLoading(false);
      }
    }
    checkSession();
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
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
