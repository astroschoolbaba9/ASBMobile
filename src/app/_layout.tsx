// mobile-app/src/app/_layout.tsx
// Master Root Provider (Theme, QueryClient, AuthProvider, Fonts)

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ToastProvider } from '../context/ToastContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ASBColors } from '../theme/tokens';

import { AnimatedSplashScreen } from '../components/common/AnimatedSplashScreen';

try {
  const { activateKeepAwakeAsync } = require('expo-keep-awake');
  activateKeepAwakeAsync().catch(() => {});
} catch (e) {}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 mins caching
      retry: 2,
    },
  },
});

import { NotificationProvider } from '../context/NotificationContext';
import { NotificationDrawer } from '../components/notification/NotificationDrawer';

export default function RootLayout() {
  const [showSplash, setShowSplash] = React.useState(true);
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  if (showSplash) {
    return <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <StatusBar style="dark" />
              <NotificationDrawer />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  animationDuration: 220,
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/login" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="(auth)/register" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="(auth)/complete-profile" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="reports/profession" options={{ headerShown: false }} />
                <Stack.Screen name="reports/health" options={{ headerShown: false }} />
                <Stack.Screen name="reports/relationship" options={{ headerShown: false }} />
                <Stack.Screen name="reports/swot" options={{ headerShown: false }} />
                <Stack.Screen name="reports/mystical-triangle" options={{ headerShown: false }} />
                <Stack.Screen name="reports/time-cycles" options={{ headerShown: false }} />
                <Stack.Screen name="reports/pdf-viewer" options={{ headerShown: false }} />
                <Stack.Screen name="tools/tarot" options={{ headerShown: false }} />
                <Stack.Screen name="tools/consult-booking" options={{ headerShown: false }} />
                <Stack.Screen name="shop/product/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="shop/cart" options={{ headerShown: false }} />
                <Stack.Screen name="shop/checkout" options={{ headerShown: false }} />
                <Stack.Screen name="shop/orders" options={{ headerShown: false }} />
                <Stack.Screen name="shop/order/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="shop/gift-orders" options={{ headerShown: false }} />
                <Stack.Screen name="shop/courses" options={{ headerShown: false }} />
                <Stack.Screen name="shop/course/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="shop/section/[key]" options={{ headerShown: false }} />
                <Stack.Screen name="shop/addresses" options={{ headerShown: false }} />
                <Stack.Screen name="shop/my-courses" options={{ headerShown: false }} />
                <Stack.Screen name="shop/payment-success" options={{ headerShown: false }} />
                <Stack.Screen name="shop/payment-failed" options={{ headerShown: false }} />
                <Stack.Screen name="shop/payu-webview" options={{ headerShown: false }} />
                <Stack.Screen name="info/about" options={{ headerShown: false }} />
                <Stack.Screen name="info/terms" options={{ headerShown: false }} />
                <Stack.Screen name="info/privacy" options={{ headerShown: false }} />
                <Stack.Screen name="info/refund" options={{ headerShown: false }} />
                <Stack.Screen name="info/shipping" options={{ headerShown: false }} />
                <Stack.Screen name="info/contact" options={{ headerShown: false }} />
                <Stack.Screen name="info/services" options={{ headerShown: false }} />
              </Stack>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: ASBColors.bgWarmIvory,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
