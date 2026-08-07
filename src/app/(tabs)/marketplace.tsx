// mobile-app/src/app/(tabs)/marketplace.tsx
// ASB Crystal & Spiritual Storefront Screen (Website Theme + Universal Responsiveness)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ShoppingCart, Star, Sparkles, ShoppingBag, CheckCircle, X, Filter } from 'lucide-react-native';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { GradientButton } from '../../components/common/GradientButton';
import { useQuery } from '@tanstack/react-query';
import { crystalApi, getImageUrl } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function MarketplaceScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { cartCount, addToCart } = useCart();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [addingId, setAddingId] = useState<string | null>(null);

  const popularSearches = ['Pyrite', 'Rudraksha', '7 Chakra', 'Amethyst', 'Bracelet', 'Yantra'];

  // Responsive card calculation (2-column on mobile, multi-column on tablet/web)
  const isTabletOrWeb = width > 768;
  const numColumns = isTabletOrWeb ? 4 : 2;
  const cardWidth = `${Math.floor(100 / numColumns) - 2}%`;

  const categories = [
    { id: 'ALL', label: 'All Products' },
    { id: 'CRYSTALS', label: 'Energised Crystals' },
    { id: 'RUDRAKSHA', label: 'Rudraksha' },
    { id: 'GEMSTONES', label: 'Gemstones' },
    { id: 'YANTRAS', label: 'Yantras' },
    { id: 'BRACELETS', label: 'Healing Bracelets' },
  ];

  // Fetch Products Catalog from Real MERN API
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
    const q = search.toLowerCase().trim();
    const catName = item.category || item.categoryId?.name || item.categoryId?.group || item.group || '';
    const catMatch = selectedCategory === 'ALL' || catName.toUpperCase().includes(selectedCategory);

    if (!q) return catMatch;

    const titleMatch = (item.title || item.name || '').toLowerCase().includes(q);
    const descMatch = (item.description || '').toLowerCase().includes(q);
    const spiritualMatch = (item.spiritualUse || '').toLowerCase().includes(q);
    const categoryQueryMatch = catName.toLowerCase().includes(q);
    const tagMatch = Array.isArray(item.tags) && item.tags.some((t: string) => t.toLowerCase().includes(q));

    return (titleMatch || descMatch || spiritualMatch || categoryQueryMatch || tagMatch) && catMatch;
  });

  const { showToast } = useToast();

  const handleAddToCart = async (item: any) => {
    setAddingId(item._id);
    try {
      await addToCart(item, 1);
      showToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${item.title || item.name || 'Product'} added to your cart!`,
        actionLabel: 'VIEW CART',
        onAction: () => router.push('/shop/cart' as any),
      });
    } catch (e) {
      showToast({ type: 'error', title: 'Cart Error', message: 'Could not add item to cart.' });
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={18} color={ASBColors.sacredGold} />
              <Text style={styles.storeTitle}>ASB CRYSTAL STORE</Text>
            </View>
            <Text style={styles.storeSub}>100% Certified Vedic Energised Spiritual Remedies & Crystals</Text>
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

        {/* Enhanced Real Working Search Bar */}
        <View style={[styles.searchBar, search.length > 0 && styles.searchBarActive]}>
          <Search size={18} color={search.length > 0 ? ASBColors.primaryPurple : ASBColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crystals, rudraksha, gemstones..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={ASBColors.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn}>
              <X size={16} color={ASBColors.darkNavy} />
            </TouchableOpacity>
          )}
        </View>

        {/* Popular Quick Search Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
          <Text style={styles.tagHeader}>Popular:</Text>
          {popularSearches.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => setSearch(search === tag ? '' : tag)}
              style={[styles.tagPill, search.toLowerCase() === tag.toLowerCase() && styles.tagPillActive]}
            >
              <Text style={[styles.tagText, search.toLowerCase() === tag.toLowerCase() && styles.tagTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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

      {/* Product Grid - Universal Responsive Layout */}
      <ScrollView contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
        <View style={styles.promoBanner}>
          <Sparkles size={16} color={ASBColors.primaryPurple} />
          <Text style={styles.promoText}>Free Express Shipping on orders above ₹999!</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Loading Energised Products Catalog...</Text>
          </View>
        ) : productsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBag size={48} color={ASBColors.textMuted} />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySub}>
              {search ? `No products matching "${search}". Try a different term or clear filters.` : 'No products available in this category.'}
            </Text>
            {(search !== '' || selectedCategory !== 'ALL') && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSearch('');
                  setSelectedCategory('ALL');
                }}
              >
                <Text style={styles.resetBtnText}>Clear Search & Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.productGrid}>
            {productsList.map((item: any) => {
              const savings = item.mrp ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
              return (
                <View key={item._id} style={[styles.productCard, { width: cardWidth as any }]}>
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
                      <Text style={styles.ratingText}>{item.ratingAvg ? item.ratingAvg : 'New'}</Text>
                      {item.ratingCount ? <Text style={styles.ratingCount}>({item.ratingCount})</Text> : null}
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>₹{item.price}</Text>
                      {item.mrp > item.price && <Text style={styles.mrpText}>₹{item.mrp}</Text>}
                    </View>

                    {/* Direct Add to Cart without annoying modals */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ASBColors.bgWarmIvory,
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
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchBarActive: {
    borderColor: ASBColors.primaryPurple,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: ASBColors.darkNavy,
  },
  clearSearchBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#E5D5FF',
    marginLeft: 6,
  },
  tagScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tagHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: ASBColors.textMuted,
    alignSelf: 'center',
    marginRight: 6,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#F5F1E8',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagPillActive: {
    backgroundColor: '#F3E8FF',
    borderColor: ASBColors.primaryPurple,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: ASBColors.darkNavy,
  },
  tagTextActive: {
    color: ASBColors.primaryPurple,
    fontWeight: '700',
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: ASBColors.primaryPurple,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: ASBColors.darkNavy,
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  gridContent: {
    padding: 14,
    paddingBottom: 90,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    overflow: 'hidden',
    shadowColor: '#6B5BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  emptySub: {
    fontSize: 13,
    color: ASBColors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  resetBtn: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
  },
});
