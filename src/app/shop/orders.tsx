// mobile-app/src/app/shop/orders.tsx
// User Orders History Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, ChevronRight, Truck, CheckCircle2, Clock } from 'lucide-react-native';
import { ASBColors, ASBShadows } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { useQuery } from '@tanstack/react-query';
import { crystalApi } from '../../api/client';

export default function OrdersScreen() {
  const router = useRouter();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      try {
        const res = await crystalApi.get('/api/orders/my-orders');
        return res.data?.orders || (Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.warn('User orders API error:', e);
        return [];
      }
    },
  });

  const orders = ordersData || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Orders ({orders.length})</Text>
      </View>

      {/* Orders List */}
      {orders.length === 0 ? (
        <GlassCard style={{ padding: 24, alignItems: 'center', marginTop: 20 }}>
          <Package size={44} color={ASBColors.textMuted} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: ASBColors.darkNavy, marginTop: 12 }}>No Orders Placed Yet</Text>
          <Text style={{ fontSize: 12, color: ASBColors.textMuted, marginTop: 4, textAlign: 'center' }}>Your purchased spiritual remedies and crystals will appear here.</Text>
        </GlassCard>
      ) : (
        <View style={styles.listContainer}>
          {orders.map((order: any) => (
          <TouchableOpacity
            key={order._id}
            activeOpacity={0.85}
            style={[styles.orderCard, ASBShadows.cardRest]}
            onPress={() => router.push(`/shop/order/${order._id}` as any)}
          >
            <View style={styles.orderHeader}>
              <View style={styles.orderIdRow}>
                <Package size={18} color={ASBColors.royalViolet} />
                <Text style={styles.orderId}>Order #{order._id}</Text>
              </View>
              <Text style={styles.orderDate}>{order.createdAt}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, order.status === 'PAID' ? styles.paidBadge : styles.pendingBadge]}>
                <Text style={[styles.statusText, order.status === 'PAID' ? styles.paidText : styles.pendingText]}>
                  {order.status}
                </Text>
              </View>

              <View style={styles.fulfilmentBadge}>
                <Truck size={12} color={ASBColors.primaryPurple} />
                <Text style={styles.fulfilmentText}>{order.fulfilmentStatus || 'PLACED'}</Text>
              </View>

              <Text style={styles.orderTotal}>Total: ₹{order.total}</Text>
            </View>

            {order.tracking?.trackingId && (
              <View style={styles.trackingRow}>
                <Text style={styles.trackingText}>
                  Courier: {order.tracking.courier} | Tracking ID: {order.tracking.trackingId}
                </Text>
                <ChevronRight size={16} color={ASBColors.royalViolet} />
              </View>
            )}
          </TouchableOpacity>
        ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ASBColors.bgWarmCream,
  },
  content: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 40,
    gap: 14,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  listContainer: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    gap: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  orderDate: {
    fontSize: 11,
    color: ASBColors.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  paidBadge: {
    backgroundColor: ASBColors.goodGreenBg,
  },
  pendingBadge: {
    backgroundColor: ASBColors.soonBadgeBg,
  },
  paidText: {
    color: ASBColors.goodGreen,
    fontSize: 10,
    fontWeight: '800',
  },
  pendingText: {
    color: ASBColors.soonBadgeText,
    fontSize: 10,
    fontWeight: '800',
  },
  fulfilmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fulfilmentText: {
    fontSize: 10,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
  },
  orderTotal: {
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '800',
    color: ASBColors.royalViolet,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ASBColors.bgWarmCream,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  trackingText: {
    fontSize: 11,
    color: ASBColors.darkNavy,
    fontWeight: '500',
  },
});
