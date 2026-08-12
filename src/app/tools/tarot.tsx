// mobile-app/src/app/tools/tarot.tsx
// 3D Daily Tarot Card Reading Tool Screen (Real 22 Major Arcana Deck + Backend Sync)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Sparkles, RefreshCw, Sun, Flame, Droplets, Wind, Globe } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { reportApi } from '../../api/client';

export interface TarotCardData {
  num: string;
  name: string;
  element: string;
  keywords: string;
  meaning: string;
  advice: string;
}

const MAJOR_ARCANA_DECK: Record<string, TarotCardData> = {
  'The Fool': { num: '0', name: 'The Fool', element: 'Air 💨', keywords: 'New Beginnings • Innocence • Spontaneity', meaning: 'Embrace fresh beginnings and trust in the cosmic flow. Take a leap of faith.', advice: 'Step into new ventures with open arms and unshakeable trust.' },
  'The Magician': { num: 'I', name: 'The Magician', element: 'Air 💨', keywords: 'Manifestation • Action • Mastery', meaning: 'You possess all the tools required to turn thoughts into physical reality.', advice: 'Focus your intent and take direct action on your key priorities today.' },
  'The High Priestess': { num: 'II', name: 'The High Priestess', element: 'Water 🌊', keywords: 'Intuition • Mystery • Inner Wisdom', meaning: 'Listen to your inner voice. Divine knowledge lies in your subconscious.', advice: 'Meditate before making major decisions; trust your gut feelings.' },
  'The Empress': { num: 'III', name: 'The Empress', element: 'Earth 🌍', keywords: 'Abundance • Nurturing • Creation', meaning: 'A period of fertility, growth, and luxurious abundance surrounds you.', advice: 'Nurture creative projects and connect with nature.' },
  'The Emperor': { num: 'IV', name: 'The Emperor', element: 'Fire 🔥', keywords: 'Structure • Authority • Discipline', meaning: 'Stability and disciplined execution bring long-term success.', advice: 'Establish clear boundaries and organize your daily schedule.' },
  'The Hierophant': { num: 'V', name: 'The Hierophant', element: 'Earth 🌍', keywords: 'Tradition • Wisdom • Higher Learning', meaning: 'Seek guidance from spiritual traditions or trusted mentors.', advice: 'Honor Vedic wisdom and daily sacred rituals for mental peace.' },
  'The Lovers': { num: 'VI', name: 'The Lovers', element: 'Air 💨', keywords: 'Harmony • Connection • Choices', meaning: 'Alignment of values, soul partnerships, and heartfelt decisions.', advice: 'Choose relationships and paths that align with your highest integrity.' },
  'The Chariot': { num: 'VII', name: 'The Chariot', element: 'Water 🌊', keywords: 'Willpower • Victory • Determination', meaning: 'Overcome obstacles through sheer focus and inner determination.', advice: 'Stay focused on the goal despite minor distractions.' },
  'Strength': { num: 'VIII', name: 'Strength', element: 'Fire 🔥', keywords: 'Courage • Compassion • Grace', meaning: 'Soft power and emotional mastery win over brute force.', advice: 'Respond to challenges with patience, love, and quiet confidence.' },
  'The Hermit': { num: 'IX', name: 'The Hermit', element: 'Earth 🌍', keywords: 'Introspection • Solitude • Soul Light', meaning: 'Step back to find clarity within. Your inner lamp guides your path.', advice: 'Spend quiet time in reflection away from noisy opinions.' },
  'Wheel of Fortune': { num: 'X', name: 'Wheel of Fortune', element: 'Fire 🔥', keywords: 'Karmic Cycles • Turning Point • Luck', meaning: 'Destiny shifts in your favor. A positive turn of events unfolds.', advice: 'Adapt gracefully to change; luck favors positive momentum.' },
  'Justice': { num: 'XI', name: 'Justice', element: 'Air 💨', keywords: 'Truth • Balance • Cause & Effect', meaning: 'Karmic balance is restored. Truth and fair outcomes prevail.', advice: 'Act with absolute honesty and take accountability for past efforts.' },
  'The Hanged Man': { num: 'XII', name: 'The Hanged Man', element: 'Water 🌊', keywords: 'Surrender • Perspective • Pause', meaning: 'Pause and view life from a new angle. Surrender control to divine timing.', advice: 'Release impatience; resting allows the solution to emerge.' },
  'Death': { num: 'XIII', name: 'Death', element: 'Water 🌊', keywords: 'Transformation • Rebirth • Release', meaning: 'Old chapters close so powerful new blessings can enter.', advice: 'Let go of obsolete habits and welcome complete renewal.' },
  'Temperance': { num: 'XIV', name: 'Temperance', element: 'Fire 🔥', keywords: 'Balance • Harmony • Moderation', meaning: 'Blend energy carefully to achieve peaceful equilibrium.', advice: 'Avoid extremes; practice balance in diet, work, and speech.' },
  'The Devil': { num: 'XV', name: 'The Devil', element: 'Earth 🌍', keywords: 'Shadow Self • Attachments • Freedom', meaning: 'Recognize self-imposed limitations or unhealthy attachments.', advice: 'Break free from toxic patterns and reclaim your personal power.' },
  'The Tower': { num: 'XVI', name: 'The Tower', element: 'Fire 🔥', keywords: 'Breakthrough • Awakening • Truth', meaning: 'False structures crumble to reveal foundational truth.', advice: 'Welcome sudden revelations—they clear space for genuine growth.' },
  'The Star': { num: 'XVII', name: 'The Star', element: 'Air 💨', keywords: 'Hope • Faith • Cosmic Renewal', meaning: 'Spiritual rejuvenation and cosmic blessing flow directly to you.', advice: 'Keep faith in your dreams; bright blessings lie directly ahead.' },
  'The Moon': { num: 'XVIII', name: 'The Moon', element: 'Water 🌊', keywords: 'Intuition • Subconscious • Illusion', meaning: 'Navigate hidden fears by trusting your spiritual intuition.', advice: 'Do not fear the dark; pay attention to dreams and signs.' },
  'The Sun': { num: 'XIX', name: 'The Sun', element: 'Fire 🔥', keywords: 'Joy • Success • Vitality', meaning: 'Radiant success, clarity, and joyful energy fill your day.', advice: 'Celebrate achievements and share your warmth with others.' },
  'Judgement': { num: 'XX', name: 'Judgement', element: 'Fire 🔥', keywords: 'Rebirth • Higher Calling • Clarity', meaning: 'Hear your soul calling you toward your ultimate purpose.', advice: 'Release past guilt and step boldly into your higher mission.' },
  'The World': { num: 'XXI', name: 'The World', element: 'Earth 🌍', keywords: 'Fulfillment • Integration • Triumph', meaning: 'A major cosmic cycle completes successfully. You are whole.', advice: 'Celebrate your journey and prepare to start the next evolution.' },
};

export default function TarotScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState<TarotCardData | null>(null);

  const rotation = useSharedValue(0);

  const handleDrawCard = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    rotation.value = withTiming(0, { duration: 200 });

    try {
      const res = await reportApi.get('/api/numerology/tarot.json');
      const cardName = res.data?.card || 'The Magician';
      const deckMatch = MAJOR_ARCANA_DECK[cardName] || {
        num: 'I',
        name: cardName,
        element: 'Fire 🔥',
        keywords: 'Action • Power • Manifestation',
        meaning: res.data?.meaning || 'Action, the power to manifest, resourcefulness.',
        advice: 'Align intent with action to achieve your goal today.',
      };

      setActiveCard(deckMatch);
      rotation.value = withTiming(180, { duration: 600, easing: Easing.out(Easing.ease) });
    } catch (e) {
      const keys = Object.keys(MAJOR_ARCANA_DECK);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setActiveCard(MAJOR_ARCANA_DECK[randomKey]);
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
          <View style={styles.innerCardFrame}>
            <Sparkles size={48} color={ASBColors.sacredGold} />
            <Text style={styles.frontTitle}>ASB SACRED TAROT DECK</Text>
            <Text style={styles.frontSub}>Tap Draw Button Below</Text>
          </View>
        </Animated.View>

        {/* Card Back (Revealed Card Artwork) */}
        <Animated.View style={[styles.tarotCard, styles.cardBack, backStyle]}>
          <View style={styles.innerCardFrameRevealed}>
            <View style={styles.romanBadge}>
              <Text style={styles.romanBadgeText}>{activeCard?.num || 'I'}</Text>
            </View>

            <Sparkles size={32} color={ASBColors.primaryPurple} />

            <Text style={styles.cardName}>{activeCard?.name || 'The Magician'}</Text>

            <View style={styles.elementBadge}>
              <Text style={styles.elementText}>{activeCard?.element || 'Air 💨'}</Text>
            </View>

            <Text style={styles.keywordsText}>{activeCard?.keywords || 'Manifestation • Power'}</Text>
          </View>
        </Animated.View>
      </View>

      {/* Action Button */}
      <GradientButton
        title={activeCard ? 'Draw Another Tarot Card' : '🔮 Draw Your Daily Card'}
        variant="primary"
        loading={loading}
        icon={<RefreshCw size={18} color="#FFF" />}
        onPress={handleDrawCard}
        style={{ marginTop: 16 }}
      />

      {/* Revealed Guidance Details */}
      {activeCard && (
        <GlassCard style={styles.guidanceCard}>
          <View style={styles.guidanceHeaderRow}>
            <Sun size={18} color={ASBColors.primaryPurple} />
            <Text style={styles.guidanceTitle}>SPIRITUAL MEANING & GUIDANCE</Text>
          </View>

          <Text style={styles.guidanceMeaning}>{activeCard.meaning}</Text>

          <View style={styles.adviceBox}>
            <Sparkles size={14} color={ASBColors.primaryPurple} />
            <Text style={styles.adviceText}><Text style={{ fontWeight: '800' }}>Daily Advice: </Text>{activeCard.advice}</Text>
          </View>
        </GlassCard>
      )}
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
    marginBottom: 6,
  },
  cardContainer: {
    width: '100%',
    height: 310,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarotCard: {
    position: 'absolute',
    width: 230,
    height: 300,
    borderRadius: 22,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
  },
  cardFront: {
    backgroundColor: '#1E1B3A',
    borderColor: ASBColors.sacredGold,
  },
  innerCardFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
    borderColor: ASBColors.primaryPurple,
  },
  innerCardFrameRevealed: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  frontTitle: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.sacredGold,
    letterSpacing: 1.5,
    marginTop: 16,
    textAlign: 'center',
  },
  frontSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 6,
  },
  romanBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  romanBadgeText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
  },
  cardName: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    textAlign: 'center',
    marginVertical: 4,
  },
  elementBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  elementText: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
  },
  keywordsText: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.textMuted,
    textAlign: 'center',
  },
  guidanceCard: {
    padding: 16,
    gap: 10,
    marginTop: 10,
  },
  guidanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guidanceTitle: {
    fontSize: 12,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    letterSpacing: 1,
  },
  guidanceMeaning: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.darkNavy,
    lineHeight: 19,
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3E8FF',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  adviceText: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.primaryPurple,
    flex: 1,
    lineHeight: 17,
  },
});

