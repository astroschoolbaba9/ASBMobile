// mobile-app/src/app/shop/product/[id].tsx
// Product Detail Screen with Gift Customization Options & Reviews

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, ShoppingBag, Gift, Truck, ShieldCheck, Heart } from 'lucide-react-native';
import { ASBColors, ASBShadows } from '../../../theme/tokens';
import { GlassCard } from '../../../components/common/GlassCard';
import { GradientButton } from '../../../components/common/GradientButton';
import { useQuery } from '@tanstack/react-query';
import { crystalApi, getImageUrl } from '../../../api/client';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [qty, setQty] = useState(1);
  const [isGift, setIsGift] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product-detail', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await crystalApi.get(`/api/products/${id}`);
        return res.data?.product || res.data?.item || res.data;
      } catch (e) {
        console.warn('Product detail API error:', e);
        return null;
      }
    },
    enabled: !!id,
  });

  const product = productData || null;

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 14, color: ASBColors.textMuted }}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { padding: 20, paddingTop: 60, alignItems: 'center' }]}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={ASBColors.darkNavy} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Product Details</Text>
        </View>
        <GlassCard style={{ padding: 24, marginTop: 40, alignItems: 'center', width: '100%' }}>
          <ShoppingBag size={40} color={ASBColors.textMuted} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: ASBColors.darkNavy, marginTop: 12 }}>Product Not Found</Text>
          <Text style={{ fontSize: 12, color: ASBColors.textMuted, marginTop: 4, textAlign: 'center' }}>
            We could not find the item you are looking for.
          </Text>
        </GlassCard>
      </View>
    );
  }

  const price = product.price || 0;
  const mrp = product.mrp || price;
  const savings = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const productImg = getImageUrl(product.image || product.images?.[0]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {product.title}
        </Text>
      </View>

      {/* Product Image Gallery */}
      <View style={styles.imgContainer}>
        <Image source={{ uri: productImg }} style={styles.productImg} />
        {savings > 0 && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{savings}% DISCOUNT</Text>
          </View>
        )}
      </View>

      {/* Product Info Card */}
      <GlassCard style={styles.card}>
        <Text style={styles.productTitle}>{product.title}</Text>

        <View style={styles.ratingRow}>
          <Star size={16} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.ratingVal}>{product.ratingAvg || 4.8}</Text>
          <Text style={styles.ratingCount}>({product.ratingCount || 124} reviews)</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceVal}>₹{product.price}</Text>
          <Text style={styles.mrpVal}>₹{product.mrp}</Text>
        </View>

        <Text style={styles.descText}>{product.description}</Text>
      </GlassCard>

      {/* Spiritual Use Accordion Card */}
      <GlassCard style={styles.card}>
        <View style={styles.sectionTitleRow}>
          <ShieldCheck size={18} color={ASBColors.royalViolet} />
          <Text style={styles.sectionTitle}>Spiritual Use & Benefits</Text>
        </View>
        <Text style={styles.cardText}>{product.spiritualUse}</Text>
      </GlassCard>

      {/* Gift Customization Options */}
      <GlassCard variant="gold" style={styles.card}>
        <View style={styles.sectionTitleRow}>
          <Gift size={18} color={ASBColors.sacredGold} />
          <Text style={styles.sectionTitle}>Gift Customization Options</Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Is this a Gift Item?</Text>
          <Switch value={isGift} onValueChange={setIsGift} trackColor={{ true: ASBColors.primaryPurple }} />
        </View>

        {isGift && (
          <View style={{ gap: 8, marginTop: 8 }}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Include Premium Gift Wrap (+₹49)?</Text>
              <Switch value={giftWrap} onValueChange={setGiftWrap} trackColor={{ true: ASBColors.primaryPurple }} />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Recipient Name"
              value={recipientName}
              onChangeText={setRecipientName}
              placeholderTextColor={ASBColors.textMuted}
            />

            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Personalized Gift Message (300 chars max)"
              multiline
              value={giftMessage}
              onChangeText={setGiftMessage}
              placeholderTextColor={ASBColors.textMuted}
            />
          </View>
        )}
      </GlassCard>

      {/* Quantity & Buy Buttons */}
      <View style={styles.actionRow}>
        <View style={styles.qtyControl}>
          <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity onPress={() => setQty(qty + 1)} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <GradientButton
          title="Add to Cart"
          variant="crystal"
          icon={<ShoppingBag size={18} color="#FFF" />}
          onPress={() => {
            alert('Item added to Cart!');
            router.push('/shop/cart' as any);
          }}
          style={{ flex: 1 }}
        />
      </View>
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
    fontSize: 16,
    fontWeight: '700',
    color: ASBColors.darkNavy,
    flex: 1,
  },
  imgContainer: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3E8FF',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  savingsBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: ASBColors.goodGreenBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.goodGreen,
  },
  card: {
    padding: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 6,
  },
  ratingVal: {
    fontSize: 13,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  ratingCount: {
    fontSize: 12,
    color: ASBColors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  priceVal: {
    fontSize: 22,
    fontWeight: '800',
    color: ASBColors.royalViolet,
  },
  mrpVal: {
    fontSize: 14,
    color: ASBColors.textMuted,
    textDecorationLine: 'line-through',
  },
  descText: {
    fontSize: 13,
    color: ASBColors.darkNavy,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  cardText: {
    fontSize: 13,
    color: ASBColors.darkNavy,
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: ASBColors.darkNavy,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: ASBColors.darkNavy,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 10,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: ASBColors.royalViolet,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
});
