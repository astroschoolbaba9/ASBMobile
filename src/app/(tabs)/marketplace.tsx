// mobile-app/src/app/(tabs)/marketplace.tsx
// ASB Crystal & Spiritual Storefront Screen (Amazon/Flipkart Enterprise UI + Cart Engine)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ShoppingCart, Star, ShieldCheck, Sparkles, ShoppingBag, CheckCircle, UserCheck } from 'lucide-react-native';
import { ASBColors, ASBShadows, ASBRadius, ASBFonts } from '../../theme/tokens';
import { GradientButton } from '../../components/common/GradientButton';
import { GlassCard } from '../../components/common/GlassCard';
import { useQuery } from '@tanstack/react-query';
import { crystalApi, getImageUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function MarketplaceScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cartCount, addToCart } = useCart();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);
  const [authPromptVisible, setAuthPromptVisible] = useState(false);

  const categories = [
    { id: 'ALL', label: 'All Products' },
    { id: 'CRYSTALS', label: 'Energised Crystals' },
    { id: 'RUDRAKSHA', label: 'Rudraksha' },
    { id: 'GEMSTONES', label: 'Gemstones' },
    { id: 'YANTRAS', label: 'Yantras' },
    { id: 'BRACELETS', label: 'Healing Bracelets' },
  ];

  // Fetch Products Catalog from Real MERN API (All 127 Products via max valid limit=100 pagination)
  const { data: rawProductsData, isLoading } = useQuery({
    queryKey: ['products-catalog'],
    queryFn: async () => {
      try {
        const [res1, res2] = await Promise.all([
          crystalApi.get('/api/products?limit=100&page=1'),
          crystalApi.get('/api/products?limit=100&page=2'),
        ]);
        const items1 = res1.data?.items || res1.data?.products || (Array.isArray(res1.data) ? res1.data : []);
        const items2 = res2.data?.items || res2.data?.products || (Array.isArray(res2.data) ? res2.data : []);
        return [...items1, ...items2];
      } catch (e) {
        console.warn('Real MERN Products Catalog API error:', e);
        return [];
      }
    },
  });

  const allProducts = rawProductsData && Array.isArray(rawProductsData) ? rawProductsData : [];

  const productsList = allProducts.filter((item: any) => {
    const titleMatch = (item.title || item.name || '').toLowerCase().includes(search.toLowerCase());
    const catName = item.category || item.categoryId?.name || item.categoryId?.group || item.group || '';
    const catMatch = selectedCategory === 'ALL' || catName.toUpperCase().includes(selectedCategory);
    return titleMatch && catMatch;
  });

  const handleAddToCart = async (item: any) => {
    setAddingId(item._id);
    try {
      await addToCart(item, 1);
      setAddedItemName(item.title || item.name);
      setTimeout(() => setAddedItemName(null), 2500);

      if (!isAuthenticated) {
        setAuthPromptVisible(true);
      }
    } catch (e) {
      console.warn('Cart addition error:', e);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header & Search Bar */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.storeTitle}>ASB CRYSTAL STORE</Text>
            <Text style={styles.storeSub}>Energised High-Vibration Spiritual Remedies</Text>
          </View>

          <TouchableOpacity
            style={styles.cartIconBtn}
            onPress={() => router.push('/shop/cart' as any)}
          >
            <ShoppingCart size={22} color={ASBColors.primaryPurple} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={ASBColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crystals, rudraksha, gemstones..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={ASBColors.textMuted}
          />
        </View>

        {/* Category Chips Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCategory(c.id)}
              style={[styles.catChip, selectedCategory === c.id && styles.catChipActive]}
            >
              <Text style={[styles.catText, selectedCategory === c.id && styles.catTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Added Toast Alert */}
      {addedItemName && (
        <View style={styles.toast}>
          <CheckCircle size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>Added "{addedItemName.slice(0, 24)}..." to Cart</Text>
        </View>
      )}

      {/* Product Grid - Enterprise Flipkart/Amazon Style */}
      <ScrollView contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
        <View style={styles.promoBanner}>
          <Sparkles size={16} color={ASBColors.primaryPurple} />
          <Text style={styles.promoText}>Free Express Shipping on orders above ₹999!</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Loading Energised Products Catalog...</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {productsList.map((item: any) => {
              const savings = item.mrp ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
              return (
                <View key={item._id} style={styles.productCard}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => router.push(`/shop/product/${item._id}` as any)}
                  >
                    <View style={styles.imgContainer}>
                      <Image source={{ uri: getImageUrl(item.image || item.images?.[0]) }} style={styles.productImg} />
                      {savings > 0 && (
                        <View style={styles.savingsBadge}>
                          <Text style={styles.savingsText}>{savings}% OFF</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.productInfo}>
                    <TouchableOpacity onPress={() => router.push(`/shop/product/${item._id}` as any)}>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {item.title || item.name}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.ratingRow}>
                      <Star size={13} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{item.ratingAvg || 4.8}</Text>
                      <Text style={styles.ratingCount}>({item.ratingCount || 86})</Text>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>₹{item.price}</Text>
                      {item.mrp > item.price && <Text style={styles.mrpText}>₹{item.mrp}</Text>}
                    </View>

                    {/* Always display Add to Cart button */}
                    <GradientButton
                      title="Add to Cart"
                      variant="crystal"
                      loading={addingId === item._id}
                      icon={<ShoppingBag size={14} color="#FFF" />}
                      onPress={() => handleAddToCart(item)}
                      style={{ marginTop: 8 }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Guest Login Prompt Modal */}
      <Modal visible={authPromptVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <UserCheck size={36} color={ASBColors.primaryPurple} />
            <Text style={styles.modalTitle}>Item Saved to Cart!</Text>
            <Text style={styles.modalSub}>
              Sign in to sync your cart across devices, apply discount coupons, and track express orders.
            </Text>

            <View style={styles.modalBtnCol}>
              <GradientButton
                title="Sign In / Register"
                variant="crystal"
                onPress={() => {
                  setAuthPromptVisible(false);
                  router.push('/(auth)/login');
                }}
              />

              <TouchableOpacity
                style={styles.continueGuestBtn}
                onPress={() => setAuthPromptVisible(false)}
              >
                <Text style={styles.continueGuestText}>Continue Shopping as Guest</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeTitle: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    letterSpacing: 1,
  },
  storeSub: {
    fontSize: 11,
    color: ASBColors.textMuted,
  },
  cartIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 91, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: ASBColors.crimsonMagenta,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: ASBColors.darkNavy,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: ASBColors.primaryPurple,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: ASBColors.textMuted,
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  gridContent: {
    padding: 14,
    paddingBottom: 90,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3E8FF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  promoText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: ASBColors.textMuted,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  imgContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F9FAFB',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  savingsBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: ASBColors.goodGreenBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.goodGreen,
  },
  productInfo: {
    padding: 10,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: ASBColors.darkNavy,
    height: 36,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  ratingCount: {
    fontSize: 10,
    color: ASBColors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: ASBColors.primaryPurple,
  },
  mrpText: {
    fontSize: 11,
    color: ASBColors.textMuted,
    textDecorationLine: 'line-through',
  },
  toast: {
    position: 'absolute',
    top: 130,
    alignSelf: 'center',
    backgroundColor: ASBColors.goodGreen,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 999,
    elevation: 10,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: ASBColors.darkNavy,
    marginTop: 12,
  },
  modalSub: {
    fontSize: 13,
    color: ASBColors.textMuted,
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 18,
  },
  modalBtnCol: {
    width: '100%',
    gap: 10,
    marginTop: 10,
  },
  continueGuestBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  continueGuestText: {
    fontSize: 12,
    fontWeight: '600',
    color: ASBColors.textMuted,
  },
});
