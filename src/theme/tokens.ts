// mobile-app/src/theme/tokens.ts
// ASB Super-App Master Design System Tokens (Website Matched)

export const ASBColors = {
  // Website Primary Palette
  primaryPurple: '#6B5BFF',      // Official Main Brand Purple (#6b5bff)
  royalViolet: '#6B5BFF',        // Royal Violet Accent
  deepIndigo: '#6B5BFF',         // Deep Indigo Accent
  purple700: '#7C3AED',          // Button Start / Deep Purple Accent
  purple600: '#9333EA',          // Text Accent
  softViolet: '#9B5CF6',         // Soft Violet Secondary
  
  // Secondary / Energy Accents
  crimsonMagenta: '#D946EF',     // Main Gradient Magenta (#d946ef)
  crystalMagenta: '#C84CFF',     // Crystal Store Magenta
  
  // Primary Accents (Aligned to Website Magenta & Purple)
  sacredGold: '#6B5BFF',         // Replaced with Main Brand Purple (#6b5bff)
  lightGold: '#7C3AED',          // Replaced with Accent Purple
  brightGold: '#D946EF',         // Replaced with Bright Magenta
  goldShimmer: '#A855F7',        // Replaced with Violet Shimmer
  
  // Dark & Contrast Text (Website Specification)
  darkNavy: '#1A1A3E',           // Official Headings Text (#1a1a3e)
  deepNavy: '#1A1A3E',           // Deep Navy Text
  darkPurpleNavy: '#1A1A3E',     // Dark Headings
  
  // Background Colors (Website Light Theme Specification)
  bgWarmIvory: '#FDF8F4',        // Main Light Background (#fdf8f4)
  bgCream: '#F5F1E8',            // Official Background Cream (#f5f1e8)
  bgWarmCream: '#F5F1E8',        // Surface Warm Cream
  surfaceWhite: '#FFFFFF',       // Card Surfaces (#ffffff)
  
  // Muted & Secondary Text
  textMuted: '#5A5A7A',          // Official Secondary Text (#5a5a7a)
  textLight: '#5A5A7A',          // Helper Text
  
  // Borders & Dividers
  borderPurple: '#E9D5FF',       // Soft Purple Border
  borderIvory: '#E8E4DB',        // Official Light Border (#e8e4db)
  borderGlass: 'rgba(107, 91, 255, 0.2)',
  
  // Status Colors
  goodGreen: '#2D5A3D',
  goodGreenBg: '#E6F7ED',
  badOrangeBg: '#FFE8E0',
  errorRed: '#DC2626',
  errorRedBg: '#FEF2F2',
  soonBadgeBg: '#F3E8FF',
  soonBadgeText: '#6B5BFF',
};

export const ASBGradients = {
  mainAccent: ['#1A1A3E', '#6B5BFF'] as const,     // Official Main Gradient: 90deg, #1a1a3e, #6b5bff
  buttonAccent: ['#7C3AED', '#D946EF'] as const,   // Official Button Gradient: 90deg, #7c3aed, #d946ef
  crystalPrimary: ['#6B5BFF', '#C84CFF'] as const,
  mobileAccent: ['#7C3AED', '#D946EF'] as const,
  nameMain: ['#6B5BFF', '#D946EF'] as const,
  nameSecondary: ['#7C3AED', '#EC4899'] as const,
  goldButton: ['#7C3AED', '#D946EF'] as const,
  cardGlass: ['rgba(255, 255, 255, 0.95)', 'rgba(245, 241, 232, 0.75)'] as const,
};

export const ASBFonts = {
  heading: 'PlayfairDisplay_600SemiBold',         // Official Heading Font: Playfair Display
  subheading: 'PlayfairDisplay_600SemiBold',
  body: 'Inter_400Regular',                        // Official Body Font: Inter
  bodyMedium: 'Inter_500Medium',
  bodyBold: 'Inter_600SemiBold',
  numerologyNumber: 'Cinzel_700Bold',              // Official Numerology Metric Font: Cinzel
};

import { Platform, ViewStyle } from 'react-native';

export const ASBShadows = {
  cardRest: (Platform.OS === 'web' ? ({
    boxShadow: '0px 4px 12px rgba(107, 91, 255, 0.08)',
  } as unknown as ViewStyle) : {
    shadowColor: '#6B5BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  }) as ViewStyle,
  cardHover: (Platform.OS === 'web' ? ({
    boxShadow: '0px 10px 20px rgba(107, 91, 255, 0.18)',
  } as unknown as ViewStyle) : {
    shadowColor: '#6B5BFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  }) as ViewStyle,
  buttonPurple: (Platform.OS === 'web' ? ({
    boxShadow: '0px 8px 16px rgba(124, 58, 237, 0.35)',
  } as unknown as ViewStyle) : {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  }) as ViewStyle,
  buttonGold: (Platform.OS === 'web' ? ({
    boxShadow: '0px 8px 16px rgba(124, 58, 237, 0.35)',
  } as unknown as ViewStyle) : {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  }) as ViewStyle,
};

export const ASBRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  hero: 32,
  pill: 9999,
};
