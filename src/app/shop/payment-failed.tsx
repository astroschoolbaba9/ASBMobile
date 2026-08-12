// mobile-app/src/app/shop/payment-failed.tsx
// Payment Failed Screen — Retry / Back to Order

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { XCircle } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GradientButton } from '../../components/common/GradientButton';

export default function PaymentFailedScreen() {
  const router = useRouter();
  const { purpose, orderId, courseId } = useLocalSearchParams();

  const handleRetry = () => {
    if (purpose === 'shop' && orderId) {
      router.replace(`/shop/order/${orderId}` as any);
    } else if (purpose === 'course' && courseId) {
      router.replace(`/shop/course/${courseId}` as any);
    } else {
      router.replace('/(tabs)/marketplace' as any);
    }
  };

  return (
    <View style={styles.container}>
      <XCircle size={72} color={ASBColors.errorRed} />
      <Text style={styles.title}>Payment Failed</Text>
      <Text style={styles.sub}>Your payment could not be processed. Please try again or choose a different method.</Text>
      <GradientButton
        title="Retry Payment"
        variant="primary"
        onPress={handleRetry}
        style={{ marginTop: 20, width: '70%' }}
      />
      <GradientButton
        title="Go to Home"
        variant="crystal"
        onPress={() => router.replace('/(tabs)')}
        style={{ marginTop: 8, width: '70%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: ASBColors.darkNavy },
  sub: { fontSize: 13, color: ASBColors.textMuted, textAlign: 'center', paddingHorizontal: 20 },
});
