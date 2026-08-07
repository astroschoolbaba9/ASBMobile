// mobile-app/src/app/shop/section/[key].tsx
// Section Page (Gifts, Remedies, Stones, etc.)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, ShoppingBag, Filter } from 'lucide-react-native';
import { ASBColors, ASBShadows } from '../../../theme/tokens';
import { GlassCard } from '../../../components/common/GlassCard';
import { useQuery } from '@tanstack/react-query';
import { crystalApi, getImageUrl } from '../../../api/client';

export default function SectionScreen() {
  const router = useRouter();
  const { key } = useLocalSearchParams();
  const sectionKey = (key as string) || 'gifts';

  const [activeCategory, setActiveCategory] = useState('All');

  const { data: sectionData, isLoading } = useQuery({
    queryKey: ['section-products', sectionKey, activeCategory],
    queryFn: async () => {
      try {
        const catQuery = activeCategory !== 'All' ? `&category=${activeCategory}` : '';
        const res = await crystalApi.get(`/api/products?limit=100&section=${sectionKey}${catQuery}`);
        return res.data?.items || res.data?.products || (Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.warn('Section products API error:', e);
        return [];
      }
    },
  });

  const titles: Record<string, { title: string; desc: string }> = {
    gifts: { title: 'Spiritual Gifts', desc: 'Curated spiritual gifting for every divine occasion' },
    remedies: { title: 'Vibrational Remedies', desc: 'Astrological and numerological remedy items' },
    stones: { title: 'Crystals & Gemstones', desc: 'Certified energised crystals & gemstones' },
  };

  const currentMeta = titles[sectionKey] || { title: `${sectionKey.toUpperCase()} Collection`, desc: 'Explore curated products' };

  const categories = ['All', 'Popular', 'New Arrivals', 'Budget Friendly', 'Premium'];

  const list = Array.isArray(sectionData) ? sectionData : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={ASBColors.darkNavy} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{currentMeta.title}</Text>
            <Text style={styles.sub}>{currentMeta.desc}</Text>
          </View>
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
            >
              <Text style={[styles.catPillText, activeCategory === cat && styles.catPillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={list.length > 1 ? { gap: 12 } : undefined}
        ListEmptyComponent={
          <GlassCard style={{ padding: 24, alignItems: 'center', marginTop: 20 }}>
            <ShoppingBag size={40} color={ASBColors.textMuted} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: ASBColors.darkNavy, marginTop: 12 }}>No Products Found</Text>
            <Text style={{ fontSize: 12, color: ASBColors.textMuted, marginTop: 4, textAlign: 'center' }}>Check back soon for new spiritual items in this category.</Text>
          </GlassCard>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, ASBShadows.cardRest]}
            activeOpacity={0.85}
            onPress={() => router.push(`/shop/product/${item._id}` as any)}
          >
            <Image source={{ uri: getImageUrl(item.image || item.images?.[0]) }} style={styles.productImg} />
            <View style={styles.cardInfo}>
              <View style={styles.ratingRow}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>{item.ratingAvg ? item.ratingAvg : 'New'}</Text>
              </View>
              <Text style={styles.productTitle} numberOfLines={2}>{item.title || item.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceVal}>₹{item.price}</Text>
                {item.mrp > item.price && <Text style={styles.mrpVal}>₹{item.mrp}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmCream },
  header: { padding: 16, paddingTop: 54, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: ASBColors.borderPurple, gap: 12 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  title: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  sub: { fontSize: 11, color: ASBColors.textMuted },
  catScroll: { gap: 8, paddingVertical: 4 },
  catPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3E8FF' },
  catPillActive: { backgroundColor: ASBColors.primaryPurple },
  catPillText: { fontSize: 12, fontWeight: '600', color: ASBColors.primaryPurple },
  catPillTextActive: { color: '#FFFFFF' },
  gridContent: { padding: 16, paddingBottom: 40 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: ASBColors.borderPurple },
  productImg: { width: '100%', height: 140, resizeMode: 'cover' },
  cardInfo: { padding: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  ratingText: { fontSize: 11, fontWeight: '700', color: ASBColors.darkNavy },
  productTitle: { fontSize: 13, fontWeight: '600', color: ASBColors.darkNavy, minHeight: 36 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  priceVal: { fontSize: 15, fontWeight: '800', color: ASBColors.royalViolet },
  mrpVal: { fontSize: 11, color: ASBColors.textMuted, textDecorationLine: 'line-through' },
});
