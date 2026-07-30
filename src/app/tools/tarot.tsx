// mobile-app/src/app/tools/tarot.tsx
// 3D Daily Tarot Card Reading Tool Screen (Theme Aligned)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Sparkles, RefreshCw } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { reportApi } from '../../api/client';

export default function TarotScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<any>(null);

  const rotation = useSharedValue(0);

  const handleDrawCard = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    rotation.value = withTiming(0, { duration: 200 });

    try {
      const res = await reportApi.get('/api/numerology/tarot.json');
      setCard(res.data);
      rotation.value = withTiming(180, { duration: 600, easing: Easing.out(Easing.ease) });
    } catch (e) {
      console.warn('Tarot card draw fallback:', e);
      setCard({
        card: 'The Magician',
        meaning: 'Action, the power to manifest, resourcefulness, and inspired momentum.',
      });
      rotation.value = withTiming(180, { duration: 600 });
    } finally {
      setLoading(false);
    }
  };

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Daily Tarot Reading</Text>
      </View>

      <Text style={styles.subtitle}>Draw a daily card for spiritual guidance and intuitive clarity</Text>

      {/* 3D Tarot Card Container */}
      <View style={styles.cardContainer}>
        {/* Card Front (Back of Tarot Deck) */}
        <Animated.View style={[styles.tarotCard, styles.cardFront, frontStyle]}>
          <Sparkles size={48} color="#FFFFFF" />
          <Text style={styles.frontTitle}>ASB SACRED TAROT DECK</Text>
          <Text style={styles.frontSub}>Tap Draw Button Below</Text>
        </Animated.View>

        {/* Card Back (Revealed Card) */}
        <Animated.View style={[styles.tarotCard, styles.cardBack, backStyle]}>
          <BookOpen size={36} color={ASBColors.primaryPurple} />
          <Text style={styles.cardName}>{card?.card || 'The Star'}</Text>
          <Text style={styles.cardMeaning}>
            {card?.meaning || 'Hope, faith, purpose, renewal, and spiritual illumination.'}
          </Text>
        </Animated.View>
      </View>

      {/* Action Button */}
      <GradientButton
        title={card ? 'Draw Another Tarot Card' : '🔮 Draw Your Daily Card'}
        variant="primary"
        loading={loading}
        icon={<RefreshCw size={18} color="#FFF" />}
        onPress={handleDrawCard}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ASBColors.bgWarmIvory,
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
    borderColor: ASBColors.borderIvory,
  },
  navTitle: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
  },
  subtitle: {
    fontSize: 12,
    color: ASBColors.textMuted,
    marginTop: -4,
    marginBottom: 10,
  },
  cardContainer: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarotCard: {
    position: 'absolute',
    width: 220,
    height: 270,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  cardFront: {
    backgroundColor: '#1A1A3E',
    borderColor: ASBColors.primaryPurple,
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
    borderColor: ASBColors.primaryPurple,
  },
  frontTitle: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginTop: 16,
    textAlign: 'center',
  },
  frontSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  cardName: {
    fontSize: 20,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    marginVertical: 10,
    textAlign: 'center',
  },
  cardMeaning: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.darkNavy,
    textAlign: 'center',
    lineHeight: 18,
  },
});
