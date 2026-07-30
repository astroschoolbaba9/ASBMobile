// mobile-app/src/components/anim/DailyCardModal.tsx
// Interactive 3D Reanimated Daily Guidance Card Draw (24-Hour Cooldown)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { Sparkles, X, CheckCircle, RefreshCw } from 'lucide-react-native';
import { ASBColors, ASBFonts, ASBShadows } from '../../theme/tokens';
import { GlassCard } from '../common/GlassCard';
import { GradientButton } from '../common/GradientButton';

const LAST_DRAW_KEY = 'asb_last_tarot_draw';
const { width } = Dimensions.get('window');

const DAILY_CARDS = [
  { title: 'The Sun ☀️', keyword: 'Abundance & Joy', advice: 'Your vibrational energy attracts high financial growth and clarity today. Take decisive action.' },
  { title: 'The Empress 👑', keyword: 'Creativity & Harmony', advice: 'Focus on collaboration and creative projects. Your intuitive channel is open.' },
  { title: 'The Chariot ⚔️', keyword: 'Willpower & Momentum', advice: 'Obstacles will clear effortlessly when you align your daily focus with your Soul Purpose.' },
  { title: 'The Magician 🪄', keyword: 'Manifestation', advice: 'You hold all the necessary tools to turn ideas into physical reality. Start today.' },
  { title: 'Wheel of Fortune 🎡', keyword: 'Destiny Shift', advice: 'A positive shift in career and relationships is approaching. Trust the cosmic cycle.' },
  { title: 'The Star 🌟', keyword: 'Hope & Vision', advice: 'Stay peaceful and clear. Your long-term vision is receiving divine alignment.' },
];

export const DailyCardModal: React.FC<{ visible: boolean; onClose: () => void; onDrawComplete?: () => void }> = ({
  visible,
  onClose,
  onDrawComplete,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Pick a card based on current day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setCardIndex(dayOfYear % DAILY_CARDS.length);
  }, []);

  const handleFlip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isFlipped) {
      rotation.value = withTiming(180, { duration: 600, easing: Easing.out(Easing.ease) });
      setIsFlipped(true);
      await SecureStore.setItemAsync(LAST_DRAW_KEY, new Date().toISOString());
      onDrawComplete?.();
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const activeCard = DAILY_CARDS[cardIndex];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <GlassCard style={styles.cardBox}>
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Sparkles size={20} color={ASBColors.primaryPurple} />
              <Text style={styles.headerTitle}>Daily Cosmic Guidance Card</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={ASBColors.darkNavy} />
            </TouchableOpacity>
          </View>

          {/* 3D Flip Card Container */}
          <TouchableOpacity activeOpacity={0.9} onPress={handleFlip} style={styles.flipWrapper}>
            {/* Front Face (Hidden Card Back) */}
            <Animated.View style={[styles.cardFace, styles.frontFace, frontAnimatedStyle]}>
              <View style={styles.sacredCircle}>
                <Sparkles size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.tapPrompt}>Tap to Reveal Today's Guidance ↻</Text>
            </Animated.View>

            {/* Back Face (Revealed Card) */}
            <Animated.View style={[styles.cardFace, styles.backFace, backAnimatedStyle]}>
              <Text style={styles.cardTag}>{activeCard.keyword}</Text>
              <Text style={styles.cardTitle}>{activeCard.title}</Text>
              <Text style={styles.cardAdvice}>{activeCard.advice}</Text>
              
              <View style={styles.drawnBadge}>
                <CheckCircle size={14} color={ASBColors.goodGreen} />
                <Text style={styles.drawnText}>Daily Card Claimed (+10 Karma XP)</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>

          {isFlipped && (
            <GradientButton
              title="Close & Return to Blueprint"
              onPress={onClose}
              style={{ marginTop: 16 }}
            />
          )}
        </GlassCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(15, 14, 38, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  cardBox: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: ASBFonts.subheading,
    color: ASBColors.darkNavy,
  },
  closeBtn: {
    padding: 4,
  },
  flipWrapper: {
    width: width * 0.75,
    height: width * 1.05,
    marginVertical: 10,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ASBColors.borderPurple,
  },
  frontFace: {
    backgroundColor: '#1A1A3E',
  },
  sacredCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(107, 91, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: '#6B5BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tapPrompt: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  backFace: {
    backgroundColor: '#FFFFFF',
    borderColor: ASBColors.primaryPurple,
    justifyContent: 'space-between',
  },
  cardTag: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.crimsonMagenta,
    letterSpacing: 1.5,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    textAlign: 'center',
    marginVertical: 8,
  },
  cardAdvice: {
    fontSize: 13,
    fontFamily: ASBFonts.body,
    color: ASBColors.darkNavy,
    textAlign: 'center',
    lineHeight: 20,
  },
  drawnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ASBColors.goodGreenBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  drawnText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.goodGreen,
  },
});
