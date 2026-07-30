// mobile-app/src/app/info/shipping.tsx
// Shipping Policy Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Truck, Clock, MapPin } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';

export default function ShippingScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Shipping Policy</Text>
      </View>

      <GlassCard variant="gold" style={styles.card}>
        <View style={styles.promoRow}>
          <Truck size={24} color={ASBColors.sacredGold} />
          <Text style={styles.promoText}>FREE shipping on orders above ₹999!</Text>
        </View>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.secTitle}>Delivery Timeline</Text>
        {[
          { icon: <MapPin size={16} color={ASBColors.primaryPurple} />, label: 'Metro Cities (Delhi, Mumbai, Bangalore)', time: '2–4 Business Days' },
          { icon: <MapPin size={16} color={ASBColors.royalViolet} />, label: 'Tier 2 & Tier 3 Cities', time: '4–7 Business Days' },
          { icon: <MapPin size={16} color={ASBColors.crimsonMagenta} />, label: 'Remote / Rural Areas', time: '7–10 Business Days' },
        ].map((item, idx) => (
          <View key={idx} style={styles.timeRow}>
            {item.icon}
            <View style={{ flex: 1 }}>
              <Text style={styles.timeLabel}>{item.label}</Text>
              <Text style={styles.timeVal}>{item.time}</Text>
            </View>
          </View>
        ))}
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.secTitle}>Shipping Charges</Text>
        <Text style={styles.secBody}>• Orders above ₹999: FREE Standard Shipping</Text>
        <Text style={styles.secBody}>• Orders below ₹999: Flat ₹99 shipping fee</Text>
        <Text style={styles.secBody}>• Express Shipping: ₹199 (1–2 days for metro cities)</Text>
        <Text style={styles.secBody}>• International Shipping: Contact support for rates</Text>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.secTitle}>Courier Partners</Text>
        <Text style={styles.secBody}>We ship via BlueDart Express, Delhivery, DTDC, and India Post depending on your location. Tracking details are shared via SMS and email after dispatch.</Text>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.secTitle}>Packaging</Text>
        <Text style={styles.secBody}>All crystals and spiritual items are carefully wrapped in protective bubble wrap and shipped in sturdy corrugated boxes. Gift-wrapped orders include premium tissue paper and a personalized message card.</Text>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 12 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  card: { padding: 16 },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  promoText: { fontSize: 14, fontWeight: '700', color: ASBColors.darkNavy, flex: 1 },
  secTitle: { fontSize: 14, fontWeight: '700', color: ASBColors.darkNavy, marginBottom: 8 },
  secBody: { fontSize: 13, color: ASBColors.darkNavy, lineHeight: 20, marginVertical: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3E8FF' },
  timeLabel: { fontSize: 13, fontWeight: '600', color: ASBColors.darkNavy },
  timeVal: { fontSize: 12, color: ASBColors.primaryPurple, fontWeight: '700' },
});
