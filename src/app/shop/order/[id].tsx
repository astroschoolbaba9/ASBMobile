// mobile-app/src/app/shop/order/[id].tsx
// Order Detail Screen with Item Snapshots & Live Tracking Link

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, Truck, MapPin, Download, CheckCircle } from 'lucide-react-native';
import { ASBColors, ASBShadows } from '../../../theme/tokens';
import { GlassCard } from '../../../components/common/GlassCard';
import { useQuery } from '@tanstack/react-query';
import { crystalApi } from '../../../api/client';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data: orderData } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await crystalApi.get(`/api/orders/${id}`);
      return res.data?.order || res.data;
    },
    enabled: !!id,
  });

  const mockOrder = {
    _id: id || 'ORD-98212',
    createdAt: '2026-07-28',
    status: 'PAID',
    fulfilmentStatus: 'SHIPPED',
    subtotal: 2498,
    shipping: 0,
    total: 2498,
    shippingAddress: {
      fullName: 'Bhaskar Joshi',
      phone: '9911500291',
      line1: 'ASB Spiritual Center, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
    },
    tracking: {
      courier: 'BlueDart Express',
      trackingId: 'BD-8819203',
      trackingUrl: 'https://www.bluedart.com/tracking?id=BD-8819203',
    },
    items: [
      {
        productId: '1',
        title: 'Energised Amethyst Cluster',
        price: 1499,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=200',
      },
      {
        productId: '2',
        title: 'Natural Pyrite Money Magnet',
        price: 999,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200',
      },
    ],
  };

  const order = orderData || mockOrder;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Order #{order._id}</Text>
      </View>

      {/* Status Card */}
      <GlassCard variant="gold" style={styles.card}>
        <View style={styles.statusRow}>
          <Package size={24} color={ASBColors.sacredGold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.goldTag}>FULFILMENT STATUS</Text>
            <Text style={styles.statusTitle}>{order.fulfilmentStatus || 'SHIPPED'}</Text>
            <Text style={styles.statusSub}>Order placed on {order.createdAt}</Text>
          </View>
        </View>
      </GlassCard>

      {/* Tracking Card */}
      {order.tracking?.trackingId && (
        <GlassCard style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Truck size={18} color={ASBColors.royalViolet} />
            <Text style={styles.cardTitle}>Live Package Tracking</Text>
          </View>
          <Text style={styles.cardText}>
            Courier: <Text style={{ fontWeight: '700' }}>{order.tracking.courier}</Text>
          </Text>
          <Text style={styles.cardText}>
            Tracking ID: <Text style={{ fontWeight: '700' }}>{order.tracking.trackingId}</Text>
          </Text>

          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => {
              if (order.tracking.trackingUrl) Linking.openURL(order.tracking.trackingUrl);
            }}
          >
            <Text style={styles.trackBtnText}>Track Package on Courier Website</Text>
          </TouchableOpacity>
        </GlassCard>
      )}

      {/* Shipping Address */}
      <GlassCard style={styles.card}>
        <View style={styles.cardTitleRow}>
          <MapPin size={18} color={ASBColors.primaryPurple} />
          <Text style={styles.cardTitle}>Shipping Address</Text>
        </View>
        <Text style={styles.addressName}>{order.shippingAddress?.fullName}</Text>
        <Text style={styles.addressText}>{order.shippingAddress?.line1}</Text>
        <Text style={styles.addressText}>
          {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
        </Text>
        <Text style={styles.addressText}>Phone: {order.shippingAddress?.phone}</Text>
      </GlassCard>

      {/* Items List */}
      <GlassCard style={styles.card}>
        <Text style={styles.cardTitle}>Ordered Items ({order.items?.length || 0})</Text>
        {order.items?.map((item: any, idx: number) => (
          <View key={idx} style={styles.itemRow}>
            <Image source={{ uri: item.image }} style={styles.itemImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemQty}>Qty: {item.qty}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalVal}>₹{order.total}</Text>
        </View>
      </GlassCard>
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
  card: {
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goldTag: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.sacredGold,
    letterSpacing: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ASBColors.darkNavy,
    marginVertical: 2,
  },
  statusSub: {
    fontSize: 11,
    color: ASBColors.textMuted,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  cardText: {
    fontSize: 13,
    color: ASBColors.darkNavy,
    marginVertical: 2,
  },
  trackBtn: {
    backgroundColor: ASBColors.royalViolet,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: ASBColors.darkNavy,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: ASBColors.textMuted,
    lineHeight: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8FF',
  },
  itemImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: ASBColors.darkNavy,
  },
  itemQty: {
    fontSize: 11,
    color: ASBColors.textMuted,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: ASBColors.royalViolet,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: ASBColors.darkNavy,
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: ASBColors.royalViolet,
  },
});
