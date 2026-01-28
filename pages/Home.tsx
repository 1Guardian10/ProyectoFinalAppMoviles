import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CAROUSEL_ITEMS = [
  {
    id: 1,
    title: 'Pide Comida Rápida',
    description: 'Ordena de tus restaurantes favoritos y recibe tu comida en minutos.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
    color: '#3B82F6',
  },
  {
    id: 2,
    title: 'Seguimiento en Tiempo Real',
    description: 'Observa cada paso de tu pedido desde la cocina hasta tu puerta.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop',
    color: '#10B981',
  },
  {
    id: 3,
    title: 'Variedad de Opciones',
    description: 'Desde comida local hasta restaurantes gourmet, todo en un solo lugar.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop',
    color: '#F59E0B',
  },
  {
    id: 4,
    title: 'Pago Seguro',
    description: 'Transacciones protegidas con múltiples métodos de pago disponibles.',
    image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&auto=format&fit=crop',
    color: '#8B5CF6',
  },
];

export default function HomePresentation({ navigation }: any) {
  const { width: windowWidth } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Determinarbreakpoints
  const isTablet = windowWidth >= 768;
  const isDesktop = windowWidth >= 1024;

  // Calcular dimensiones del carrusel
  const cardWidth = isDesktop ? (windowWidth - 200) / 3 : isTablet ? (windowWidth - 100) / 2 : windowWidth - 60;
  const snapInterval = cardWidth + 20;

  const renderCarouselItem = ({ item }: { item: typeof CAROUSEL_ITEMS[0] }) => (
    <View style={{ width: cardWidth, marginRight: 20 }}>
      <View className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 h-full">
        <View className="h-48">
          <Image
            source={{ uri: item.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/10" />
        </View>

        <View className="p-6">
          <View className="flex-row items-center mb-3">
            <View
              className="w-2 h-6 rounded-full mr-3"
              style={{ backgroundColor: item.color }}
            />
            <Text className="text-xl font-bold text-gray-900 flex-1" numberOfLines={1}>
              {item.title}
            </Text>
          </View>

          <Text className="text-gray-600 leading-relaxed mb-4" numberOfLines={3}>
            {item.description}
          </Text>

          <View className="pt-4 border-t border-gray-50">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="check-circle" size={18} color="#10B981" />
              <Text className="text-gray-500 text-sm ml-2">Funcionalidad Premium</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="check-circle" size={18} color="#10B981" />
              <Text className="text-gray-500 text-sm ml-2">Disponible 24/7</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Hero Section / Header */}
        <View className="bg-blue-600 rounded-b-[40px] md:rounded-b-[60px] overflow-hidden relative shadow-2xl">
          {/* Decorative Circles */}
          <View className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
          <View className="absolute bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />

          <View className="max-w-6xl mx-auto w-full px-6 py-12 md:py-20">
            <View className="flex-col md:flex-row items-center justify-between gap-10">
              <View className="flex-1 items-center md:items-start text-center md:text-left">
                <Text className="text-white text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                  MoshiApp
                </Text>
                <Text className="text-blue-100 text-lg md:text-2xl font-light mb-8 max-w-md">
                  La experiencia gastronómica definitiva en la palma de tu mano. Rápido, fresco y local.
                </Text>

                <View className="flex-row items-center bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                  <MaterialIcons name="local-shipping" size={24} color="white" />
                  <Text className="text-white font-medium ml-3">
                    Envíos gratis en tu primer pedido
                  </Text>
                </View>
              </View>

              <View className="bg-white/15 p-6 rounded-[40px] border border-white/20 backdrop-blur-sm shadow-2xl">
                <Image
                  source={require('../assets/logoderecha.png')}
                  className="w-40 h-40 md:w-64 md:h-64"
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Content Wrapper for Centralization on Desktop */}
        <View className="max-w-6xl mx-auto w-full">

          {/* Carrusel Section */}
          <View className="mt-12 px-6">
            <View className="flex-row items-end justify-between mb-8">
              <View>
                <Text className="text-3xl md:text-4xl font-black text-gray-900">
                  Explora MoshiApp
                </Text>
                <Text className="text-gray-500 text-lg mt-1">
                  Mucho más que solo comida a domicilio
                </Text>
              </View>
              {isDesktop && (
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
                    onPress={() => {/* Scroll Left Logic */ }}
                  >
                    <MaterialIcons name="chevron-left" size={24} color="#374151" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
                    onPress={() => {/* Scroll Right Logic */ }}
                  >
                    <MaterialIcons name="chevron-right" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={{ height: isDesktop ? 420 : 450 }}>
              <FlatList
                data={CAROUSEL_ITEMS}
                renderItem={renderCarouselItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={snapInterval}
                decelerationRate="fast"
                contentContainerStyle={{ paddingRight: 40 }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
                  setCurrentIndex(index);
                }}
              />
            </View>

            {/* Pagination dots (mainly for mobile) */}
            {!isDesktop && (
              <View className="flex-row justify-center mt-4">
                {CAROUSEL_ITEMS.map((_, index) => {
                  const opacity = scrollX.interpolate({
                    inputRange: [(index - 1) * snapInterval, index * snapInterval, (index + 1) * snapInterval],
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  });
                  return (
                    <Animated.View
                      key={index}
                      className="h-1.5 rounded-full bg-blue-600 mx-1"
                      style={{ width: index === currentIndex ? 20 : 8, opacity }}
                    />
                  );
                })}
              </View>
            )}
          </View>

          {/* Features Grid */}
          <View className="mt-16 px-6">
            <View className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-gray-100">
              <View className="flex-row items-center mb-10">
                <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-6">
                  <MaterialIcons name="stars" size={28} color="#2563EB" />
                </View>
                <Text className="text-2xl md:text-3xl font-bold text-gray-900">
                  ¿Por qué elegirnos?
                </Text>
              </View>

              <View className="flex-row flex-wrap -mx-2">
                {[
                  { icon: 'bolt', color: '#3B82F6', bg: 'bg-blue-50', title: 'Velocidad Extra', desc: 'Entregas en tiempo récord garantizadas.' },
                  { icon: 'security', color: '#10B981', bg: 'bg-green-50', title: 'Seguridad Total', desc: 'Tus pagos y datos siempre protegidos.' },
                  { icon: 'restaurant', color: '#8B5CF6', bg: 'bg-purple-50', title: 'Calidad Gourmet', desc: 'Seleccionamos solo lo mejor para ti.' },
                  { icon: 'favorite', color: '#F59E0B', bg: 'bg-amber-50', title: 'Atención 24/7', desc: 'Siempre aquí para resolver tus dudas.' },
                ].map((feature, index) => (
                  <View key={index} className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4">
                    <View className={`${feature.bg} p-6 rounded-3xl h-full border border-white/50`}>
                      <View className="bg-white w-12 h-12 rounded-2xl items-center justify-center shadow-sm mb-4">
                        <MaterialIcons name={feature.icon as any} size={24} color={feature.color} />
                      </View>
                      <Text className="text-gray-900 font-bold text-lg mb-2">{feature.title}</Text>
                      <Text className="text-gray-600 text-sm leading-relaxed">{feature.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Call to Action */}
          <View className="mt-16 px-6 mb-12">
            <TouchableOpacity
              className="bg-gray-900 rounded-[40px] overflow-hidden shadow-2xl"
              onPress={() => navigation.toggleDrawer()}
              activeOpacity={0.9}
            >
              <View className="flex-col md:flex-row items-center p-8 md:p-16">
                <View className="flex-1 items-center md:items-start text-center md:text-left mb-8 md:mb-0">
                  <Text className="text-white text-3xl md:text-5xl font-black mb-4">
                    ¿Hambre de más?
                  </Text>
                  <Text className="text-gray-400 text-lg md:text-xl max-w-sm">
                    Explora nuestra red completa de restaurantes y promociones exclusivas.
                  </Text>
                </View>

                <View className="bg-blue-600 px-10 py-5 rounded-full shadow-lg shadow-blue-500/20 flex-row items-center">
                  <Text className="text-white text-xl font-bold mr-3">Empezar Ahora</Text>
                  <MaterialIcons name="arrow-forward" size={24} color="white" />
                </View>
              </View>

              {/* Decorative background element for CTA */}
              <View className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
