// mobile-app/src/components/common/AnimatedSplashScreen.tsx
// Animated Splash Screen with Glowing Royal Purple & Magenta Geometry (Website Matched)

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const AnimatedSplashScreen: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const glowRotation = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 1200, easing: Easing.back(1.5) });

    glowRotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    textOpacity.value = withSequence(
      withTiming(0, { duration: 400 }),
      withTiming(1, { duration: 1000 })
    );

    progressWidth.value = withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) });

    const timer = setTimeout(() => {
      onFinish?.();
    }, 950);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${glowRotation.value}deg` }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A3E', '#2D1B69', '#0F0E26']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Rotating Sacred Geometry Glow Ring */}
      <Animated.View style={[styles.glowRing, glowAnimatedStyle]}>
        <View style={styles.orbitDotTop} />
        <View style={styles.orbitDotBottom} />
      </Animated.View>

      {/* Center ASB Logo Badge */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.iconCircle}>
          <Image
            source={require('../../../assets/images/asb_logo.jpg')}
            style={styles.splashLogoImg}
          />
        </View>
      </Animated.View>

      {/* Brand Title & Subtitle */}
      <Animated.View style={[styles.textBlock, textAnimatedStyle]}>
        <Text style={styles.brandTitle}>ASB NUMEROLOGY</Text>
        <Text style={styles.tagline}>SACRED COSMIC ENGINE</Text>
        
        {/* Progress Line */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
        </View>

        <Text style={styles.footerNote}>Synchronizing Cosmic Frequencies...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A3E',
  },
  glowRing: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(107, 91, 255, 0.35)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDotTop: {
    position: 'absolute',
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6B5BFF',
    shadowColor: '#6B5BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  orbitDotBottom: {
    position: 'absolute',
    bottom: -6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D946EF',
    shadowColor: '#D946EF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(107, 91, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#6B5BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B5BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  splashLogoImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    resizeMode: 'cover',
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandTitle: {
    fontSize: 24,
    fontFamily: ASBFonts.heading,
    color: '#FFFFFF',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: '#D946EF',
    letterSpacing: 2,
    marginBottom: 28,
  },
  progressTrack: {
    width: 160,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B5BFF',
    borderRadius: 2,
  },
  footerNote: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: ASBFonts.body,
  },
});
