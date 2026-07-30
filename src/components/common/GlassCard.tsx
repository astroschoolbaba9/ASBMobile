// mobile-app/src/components/common/GlassCard.tsx
// Glassmorphic Luxury Container Component (Website Matched)

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ASBColors, ASBShadows, ASBRadius } from '../../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'glass' | 'white' | 'purple' | 'gold' | 'dark';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, variant = 'glass' }) => {
  if (variant === 'gold' || variant === 'purple') {
    return (
      <LinearGradient
        colors={['#F5F1FF', '#EBE4FF']}
        style={[styles.base, styles.purpleBorder, ASBShadows.cardRest, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (variant === 'dark') {
    return (
      <LinearGradient
        colors={['#1A1A3E', '#2A2A5E']}
        style={[styles.base, styles.darkBorder, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.base, styles.glassBg, styles.glassBorder, ASBShadows.cardRest, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: ASBRadius.xl,
    padding: 20,
    overflow: 'hidden',
  },
  glassBg: {
    backgroundColor: '#FFFFFF',
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
  },
  purpleBorder: {
    borderWidth: 1.5,
    borderColor: ASBColors.borderPurple,
  },
  darkBorder: {
    borderWidth: 1,
    borderColor: 'rgba(107, 91, 255, 0.3)',
  },
});
