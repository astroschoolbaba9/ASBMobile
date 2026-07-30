// mobile-app/src/app/shop/gift-orders.tsx
// Gift Orders Tracking Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Gift, Package, ChevronRight } from 'lucide-react-native';
import { ASBColors, ASBShadows } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { useQuery } from '@tanstack/react-query';
import { crystalApi } from '../../api/client';

export default function GiftOrdersScreen() {
  const router = useRouter();

  const { data: giftData } = useQuery({
    queryKey: ['gift-orders'],
    queryFn: async () => {
      const res = await crystalApi.get('/api/orders/my-orders?isGift=true');
      return res.data?.orders || [];
    },
  });

  const mockGifts = [
    { _id: 'GIFT-4021', recipientName: 'Priya Sharma', occasion: 'Birthday', createdAt: '2026-07-20', status: 'DELIVERED', total: 1499 },
    { _id: 'GIFT-3999', recipientName: 'Amit Jain', occasion: 'Wedding', createdAt: '2026-06-15', status: 'SHIPPED', total: 2999 },
  ];

  const gifts = giftData && giftData.length > 0 ? giftData : mockGifts;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Gift Orders</Text>
      </View>

      {gifts.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <Gift size={48} color={ASBColors.textMuted} />
          <Text style={styles.emptyTitle}>No Gift Orders Yet</Text>
          <Text style={styles.emptySub}>Send spiritual gifts to your loved ones from our store.</Text>
        </GlassCard>
      ) : (
        <View style={{ gap: 12 }}>
          {gifts.map((gift: any) => (
            <TouchableOpacity key={gift._id} style={[styles.giftCard, ASBShadows.cardRest]} activeOpacity={0.85} onPress={() => router.push(`/shop/order/${gift._id}` as any)}>
              <Gift size={22} color={ASBColors.crimsonMagenta} />
              <View style={{ flex: 1 }}>
                <Text style={styles.giftRecipient}>To: {gift.recipientName}</Text>
                <Text style={styles.giftOccasion}>{gift.occasion} | {gift.createdAt}</Text>
                <View style={[styles.statusBadge, gift.status === 'DELIVERED' ? styles.deliveredBadge : styles.shippedBadge]}>
                  <Text style={styles.statusText}>{gift.status}</Text>
                </View>
              </View>
              <Text style={styles.giftTotal}>₹{gift.total}</Text>
              <ChevronRight size={16} color={ASBColors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmCream },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 14 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  emptyCard: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  emptySub: { fontSize: 12, color: ASBColors.textMuted, textAlign: 'center' },
  giftCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: ASBColors.borderPurple },
  giftRecipient: { fontSize: 14, fontWeight: '700', color: ASBColors.darkNavy },
  giftOccasion: { fontSize: 11, color: ASBColors.textMuted, marginVertical: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  deliveredBadge: { backgroundColor: ASBColors.goodGreenBg },
  shippedBadge: { backgroundColor: '#F3E8FF' },
  statusText: { fontSize: 9, fontWeight: '800', color: ASBColors.goodGreen },
  giftTotal: { fontSize: 14, fontWeight: '800', color: ASBColors.crimsonMagenta },
});
