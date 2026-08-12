// mobile-app/src/components/anim/FlipNumerologyCard.tsx
// 3D Reanimated Flip Card for Core Numerology Numbers (G, E, F)

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ASBColors, ASBRadius, ASBShadows } from '../../theme/tokens';

interface FlipCardProps {
  code: 'G' | 'E' | 'F';
  title: string;
  subTitle: string;
  numberValue: number | string;
  traitText: string;
  description: string;
}

export const FlipNumerologyCard: React.FC<FlipCardProps> = ({
  code,
  title,
  subTitle,
  numberValue,
  traitText,
  description,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const toggleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFlipped) {
      rotation.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });
    } else {
      rotation.value = withTiming(180, { duration: 500, easing: Easing.out(Easing.ease) });
    }
    setIsFlipped(!isFlipped);
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

  const getCodeColor = () => {
    switch (code) {
      case 'G':
        return ASBColors.primaryPurple;
      case 'E':
        return ASBColors.purple700;
      case 'F':
        return ASBColors.crimsonMagenta;
    }
  };

  return (
    <Pressable onPress={toggleFlip} style={styles.cardContainer}>
      {/* Front Face */}
      <Animated.View style={[styles.card, styles.frontCard, frontAnimatedStyle, ASBShadows.cardHover]}>
        <View style={styles.headerRow}>
          <Text style={[styles.codeBadge, { backgroundColor: `${getCodeColor()}15`, color: getCodeColor() }]}>
            NUMBER {code}
          </Text>
          <Text style={styles.tapHint}>Tap to Flip ↻</Text>
        </View>

        <View style={styles.numberContainer}>
          <Text style={[styles.numberText, { color: getCodeColor() }]}>{numberValue || '?'}</Text>
        </View>

        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.subTitleText}>{subTitle}</Text>
      </Animated.View>

      {/* Back Face */}
      <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle, ASBShadows.cardHover]}>
        <View style={styles.headerRow}>
          <Text style={[styles.codeBadge, { backgroundColor: `${getCodeColor()}15`, color: getCodeColor() }]}>
            DEEP ANALYSIS
          </Text>

          <Text style={styles.tapHint}>Tap to Flip ↻</Text>
        </View>

        <Text style={[styles.traitBadge, { color: getCodeColor() }]}>{traitText}</Text>
        <Text style={styles.descText} numberOfLines={6}>
          {description || 'Comprehensive cosmic alignment details generated for your birth date.'}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: 210,
    marginVertical: 8,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: ASBRadius.xl,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: ASBColors.borderPurple,
    justifyContent: 'space-between',
  },
  frontCard: {
    backgroundColor: '#FFFFFF',
  },
  backCard: {
    backgroundColor: '#FAF5FF',
    borderColor: ASBColors.primaryPurple,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeBadge: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ASBRadius.pill,
    letterSpacing: 1,
  },
  tapHint: {
    fontSize: 10,
    color: ASBColors.textMuted,
    fontWeight: '600',
  },
  numberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  numberText: {
    fontSize: 48,
    fontWeight: '700',
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: ASBColors.darkNavy,
    textAlign: 'center',
  },
  subTitleText: {
    fontSize: 12,
    color: ASBColors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  traitBadge: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 6,
  },
  descText: {
    fontSize: 13,
    color: ASBColors.darkNavy,
    lineHeight: 18,
  },
});
