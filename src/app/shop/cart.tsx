// mobile-app/src/app/shop/cart.tsx
// Cart Screen & Cost Breakdown connected to global CartContext

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2, ShoppingCart, Tag } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CartScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cartItems, updateQty, removeFromCart, subtotal } = useCart();
  const { showToast } = useToast();

  const handleCheckoutPress = () => {
    if (!isAuthenticated) {
      showToast({
        type: 'info',
        title: '🔐 Login Required to Checkout',
        message: 'Please sign in to your account to proceed with your order & tracking.',
      });
      router.push('/(auth)/login' as any);
      return;
    }

    router.push({
      pathname: '/shop/checkout',
      params: { promoCode: discount > 0 ? coupon.trim().toUpperCase() : '' },
    } as any);
  };

  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === 'AKSHAYA25') {
      const saved = Math.floor(subtotal * 0.25);
      setDiscount(saved);
      showToast({
        type: 'success',
        title: '✨ Sacred Offer Applied!',
        message: `Saved ₹${saved} (25% Off) with code AKSHAYA25.`,
      });
    } else if (code === 'ASB10') {
      const saved = Math.round(subtotal * 0.1);
      setDiscount(saved);
      showToast({
        type: 'success',
        title: '✨ Welcome Offer Applied!',
        message: `Saved ₹${saved} (10% Off) with code ASB10.`,
      });
    } else {
      showToast({
        type: 'error',
        title: 'Coupon Note',
        message: 'Invalid promo code. Try using AKSHAYA25 for 25% off or ASB10 for 10% off.',
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Shopping Cart ({cartItems.length})</Text>
      </View>

      {cartItems.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <ShoppingCart size={48} color={ASBColors.textMuted} />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySub}>Explore our high-vibration crystals and spiritual remedies.</Text>
          <GradientButton
            title="Explore Store"
            variant="crystal"
            onPress={() => router.push('/(tabs)/marketplace' as any)}
            style={{ marginTop: 14 }}
          />
        </GlassCard>
      ) : (
        <View style={{ gap: 14 }}>
          {/* Cart Item List */}
          {cartItems.map((item) => (
            <GlassCard key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImg} />
              <View style={styles.itemCol}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>

                <View style={styles.qtyRow}>
                  <TouchableOpacity onPress={() => updateQty(item.productId, -1)} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{item.qty}</Text>
                  <TouchableOpacity onPress={() => updateQty(item.productId, 1)} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => removeFromCart(item.productId)} style={styles.deleteBtn}>
                    <Trash2 size={16} color={ASBColors.errorRed} />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))}

          {/* Coupon Code Input */}
          <GlassCard style={styles.card}>
            <View style={styles.couponRow}>
              <Tag size={18} color={ASBColors.royalViolet} />
              <TextInput
                style={styles.couponInput}
                placeholder="Enter Coupon Code (e.g. ASB10)"
                value={coupon}
                onChangeText={setCoupon}
                placeholderTextColor={ASBColors.textMuted}
              />
              <TouchableOpacity onPress={handleApplyCoupon} style={styles.applyBtn}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Cost Summary Breakdown */}
          <GlassCard style={styles.card}>
            <Text style={styles.summaryTitle}>PRICE SUMMARY</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.sLabel}>Subtotal</Text>
              <Text style={styles.sVal}>₹{subtotal}</Text>
            </View>

            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.sLabel, { color: ASBColors.goodGreen }]}>Coupon Discount</Text>
                <Text style={[styles.sVal, { color: ASBColors.goodGreen }]}>-₹{discount}</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.sLabel}>Shipping Fee</Text>
              <Text style={styles.sVal}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalVal}>₹{grandTotal}</Text>
            </View>

            <GradientButton
              title={`Proceed to Checkout (₹${grandTotal})`}
              variant="crystal"
              onPress={handleCheckoutPress}
              style={{ marginTop: 14 }}
            />
          </GlassCard>
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
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
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
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  emptySub: {
    fontSize: 12,
    color: ASBColors.textMuted,
    textAlign: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  itemImg: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  itemCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: ASBColors.royalViolet,
    marginVertical: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: ASBColors.royalViolet,
  },
  qtyVal: {
    fontSize: 13,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  deleteBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  card: {
    padding: 16,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    fontSize: 13,
    color: ASBColors.darkNavy,
  },
  applyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: ASBColors.royalViolet,
    borderRadius: 10,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: ASBColors.darkNavy,
    letterSpacing: 1,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  sLabel: {
    fontSize: 13,
    color: ASBColors.textMuted,
  },
  sVal: {
    fontSize: 13,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F3E8FF',
    paddingTop: 10,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: ASBColors.darkNavy,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: ASBColors.royalViolet,
  },
});
