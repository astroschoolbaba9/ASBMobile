// mobile-app/src/app/shop/payment-success.tsx
// Payment Success Screen — Redirects after PayU completes

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { purpose, courseId } = useLocalSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (purpose === 'course' && courseId) {
        router.replace(`/shop/course/${courseId}` as any);
      } else {
        router.replace('/shop/orders' as any);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [purpose, courseId]);

  return (
    <View style={styles.container}>
      <CheckCircle size={72} color={ASBColors.goodGreen} />
      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.sub}>Your order has been placed. Redirecting...</Text>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: ASBColors.darkNavy },
  sub: { fontSize: 13, color: ASBColors.textMuted, textAlign: 'center' },
  progressTrack: { width: '60%', height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginTop: 16, overflow: 'hidden' },
  progressFill: { width: '100%', height: '100%', backgroundColor: ASBColors.goodGreen, borderRadius: 2 },
});
