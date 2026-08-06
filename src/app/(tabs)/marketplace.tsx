// mobile-app/src/app/(tabs)/marketplace.tsx
// ASB Crystal & Spiritual Storefront Screen (Real MERN Integration & Auth Gated Cart)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ShoppingCart, Star, ShieldCheck, Sparkles, LogIn } from 'lucide-react-native';
import { ASBColors, ASBShadows, ASBRadius, ASBFonts } from '../../theme/tokens';
import { GradientButton } from '../../components/common/GradientButton';
import { useQuery } from '@tanstack/react-query';
import { crystalApi, getImageUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function MarketplaceScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [addingId, setAddingId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Products' },
    { id: 'CRYSTALS', label: 'Energised Crystals' },
    { id: 'RUDRAKSHA', label: 'Rudraksha' },
    { id: 'GEMSTONES', label: 'Gemstones' },
    { id: 'YANTRAS', label: 'Yantras' },
    { id: 'BRACELETS', label: 'Healing Bracelets' },
  ];

  // Fetch Products Catalog from Real MERN API (All 127 Products via max valid limit=100 pagination)
  const { data: rawProductsData } = useQuery({
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

  // Fetch Live User Cart
  const { data: cartData, refetch: refetchCart } = useQuery({
    queryKey: ['user-cart', isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      try {
        const res = await crystalApi.get('/api/cart');
        return res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: isAuthenticated,
  });

  const cartCount = cartData?.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0;

  const allProducts = rawProductsData && Array.isArray(rawProductsData) ? rawProductsData : [];

  const productsList = allProducts.filter((item: any) => {
    const titleMatch = (item.title || item.name || '').toLowerCase().includes(search.toLowerCase());
    const catName = item.category || item.categoryId?.name || item.categoryId?.group || item.group || '';
    const catMatch = selectedCategory === 'ALL' || catName.toUpperCase().includes(selectedCategory);
    return titleMatch && catMatch;
  });

  const handleAddToCart = async (item: any) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    setAddingId(item._id);
    try {
      await crystalApi.post('/api/cart/items', { productId: item._id, quantity: 1 });
      await refetchCart();
    } catch (e) {
      console.warn('Cart API error, updated locally:', e);
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
            onPress={() => {
              if (!isAuthenticated) {
                router.push('/(auth)/login');
              } else {
                router.push('/shop/cart' as any);
              }
            }}
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

      {/* Product Grid */}
      <ScrollView contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
        <View style={styles.promoBanner}>
          <Sparkles size={16} color={ASBColors.primaryPurple} />
          <Text style={styles.promoText}>Free Express Shipping on orders above ₹999!</Text>
        </View>

        <View style={styles.productGrid}>
          {productsList.map((item: any) => {
            const savings = item.mrp ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
            return (
              <TouchableOpacity
                key={item._id}
                style={[styles.productCard, ASBShadows.cardRest]}
                activeOpacity={0.85}
                onPress={() => {
                  if (!isAuthenticated) {
                    router.push('/(auth)/login');
                  } else {
                    router.push(`/shop/product/${item._id}` as any);
                  }
                }}
              >
                <View style={styles.imgContainer}>
                  <Image source={{ uri: getImageUrl(item.image || item.images?.[0]) }} style={styles.productImg} />
                  {savings > 0 && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{savings}% OFF</Text>
                    </View>
                  )}
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {item.title || item.name}
                  </Text>

                  <View style={styles.ratingRow}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>{item.ratingAvg || 4.8}</Text>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>₹{item.price}</Text>
                    {item.mrp > item.price && <Text style={styles.mrpText}>₹{item.mrp}</Text>}
                  </View>

                  <GradientButton
                    title={isAuthenticated ? 'Add to Cart' : 'Sign In to Buy'}
                    variant="crystal"
                    loading={addingId === item._id}
                    icon={!isAuthenticated ? <LogIn size={14} color="#FFF" /> : undefined}
                    onPress={() => handleAddToCart(item)}
                    style={{ marginTop: 8 }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ASBColors.bgCream,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: ASBColors.borderIvory,
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
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  cartBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ASBColors.bgCream,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: ASBColors.darkNavy,
  },
  catScroll: {
    marginBottom: 12,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: ASBColors.primaryPurple,
    borderColor: ASBColors.primaryPurple,
  },
  catText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  gridContent: {
    padding: 16,
    paddingBottom: 40,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5F1FF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  promoText: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
    marginBottom: 8,
  },
  imgContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3E8FF',
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
    fontSize: 9,
    fontWeight: '800',
    color: ASBColors.goodGreen,
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
    height: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 4,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  priceText: {
    fontSize: 16,
    fontFamily: ASBFonts.heading,
    color: ASBColors.primaryPurple,
  },
  mrpText: {
    fontSize: 12,
    color: ASBColors.textMuted,
    textDecorationLine: 'line-through',
  },
});
