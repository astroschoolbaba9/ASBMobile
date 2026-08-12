// mobile-app/src/app/info/refund.tsx
// Refund & Cancellation Policy Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';

export default function RefundScreen() {
  const router = useRouter();

  const sections = [
    { title: '1. Product Returns', body: 'Physical products (crystals, rudraksha, gemstones, bracelets, yantras) may be returned within 7 days of delivery if the item is damaged, defective, or significantly different from the product listing. Items must be unused and in original packaging.' },
    { title: '2. Digital Products', body: 'Numerology reports (PDF), AI-generated consultations, and digital course enrollments are non-refundable once generated or accessed. Preview content is available before purchase.' },
    { title: '3. Refund Process', body: 'Approved refunds are processed within 5–7 business days to the original payment method. For COD orders, refunds are issued via bank transfer. Contact support@asbcrystal.in to initiate a return.' },
    { title: '4. Cancellation', body: 'Orders can be cancelled before shipment by contacting support. Once shipped, the standard return policy applies. Course enrollments cannot be cancelled after first lesson access.' },
    { title: '5. Exchange Policy', body: 'We offer free exchange for damaged or defective crystals. Contact us within 48 hours of delivery with photos of the damaged item for expedited exchange processing.' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Refund & Return Policy</Text>
      </View>
      <Text style={styles.updated}>Last Updated: July 2026</Text>

      {sections.map((s, idx) => (
        <GlassCard key={idx} style={styles.card}>
          <Text style={styles.secTitle}>{s.title}</Text>
          <Text style={styles.secBody}>{s.body}</Text>
        </GlassCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 12 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  updated: { fontSize: 11, color: ASBColors.textMuted, marginTop: -4 },
  card: { padding: 14 },
  secTitle: { fontSize: 14, fontWeight: '700', color: ASBColors.darkNavy, marginBottom: 6 },
  secBody: { fontSize: 13, color: ASBColors.darkNavy, lineHeight: 20 },
});
