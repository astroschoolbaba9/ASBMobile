// mobile-app/src/components/common/GradientButton.tsx
// ASB Luxury Gradient Button with Haptics

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ASBGradients, ASBShadows, ASBRadius } from '../../theme/tokens';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'gold' | 'crystal' | 'mobile' | 'name';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getGradientColors = () => {
    switch (variant) {
      case 'gold':
        return ASBGradients.goldButton;
      case 'crystal':
        return ASBGradients.crystalPrimary;
      case 'mobile':
        return ASBGradients.mobileAccent;
      case 'name':
        return ASBGradients.nameMain;
      case 'primary':
      default:
        return ASBGradients.mainAccent;
    }
  };

  const shadowStyle = variant === 'gold' ? ASBShadows.buttonGold : ASBShadows.buttonPurple;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[styles.touchable, shadowStyle, disabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={getGradientColors() as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: ASBRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    minHeight: 50,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.55,
  },
});
