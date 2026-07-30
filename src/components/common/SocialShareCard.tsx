// mobile-app/src/components/common/SocialShareCard.tsx
// Story-Ready Instagram/WhatsApp Soul Match Compatibility Share Badge

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Heart, Share2 } from 'lucide-react-native';
import { ASBColors, ASBFonts } from '../../theme/tokens';

interface SocialShareCardProps {
  name1: string;
  name2: string;
  matchScore: number;
  verdict: string;
}

export const SocialShareCard: React.FC<SocialShareCardProps> = ({
  name1,
  name2,
  matchScore,
  verdict,
}) => {
  const handleShareStory = async () => {
    try {
      await Share.share({
        message: `✨ ${name1} & ${name2} have a ${matchScore}% Cosmic Soulmate Match (${verdict})! 💜 Calculated with ASB Numerology. Download the app to check your blueprint!`,
      });
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['#1A1A3E', '#2D1B69', '#0F0E26']}
        style={styles.gradientCard}
      >
        <View style={styles.headerRow}>
          <Sparkles size={16} color="#D946EF" />
          <Text style={styles.brandTitle}>ASB NUMEROLOGY</Text>
          <Sparkles size={16} color="#D946EF" />
        </View>

        <Text style={styles.storyTag}>SACRED SOULMATCH</Text>

        <View style={styles.namesRow}>
          <Text style={styles.nameText}>{name1}</Text>
          <Heart size={20} color="#D946EF" fill="#D946EF" />
          <Text style={styles.nameText}>{name2}</Text>
        </View>

        {/* Large Percentage Badge */}
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNum}>{matchScore}%</Text>
          <Text style={styles.scoreLabel}>Soul Synergy</Text>
        </View>

        <Text style={styles.verdictText}>{verdict}</Text>
        <Text style={styles.footerNote}>Calculated via Chaldean Cosmic Engine</Text>

        <TouchableOpacity onPress={handleShareStory} style={styles.shareBtn}>
          <Share2 size={16} color="#FFFFFF" />
          <Text style={styles.shareBtnText}>Share to Instagram / WhatsApp Story</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 12,
  },
  gradientCard: {
    padding: 20,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 12,
    fontFamily: ASBFonts.heading,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  storyTag: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: '#D946EF',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  namesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  nameText: {
    fontSize: 18,
    fontFamily: ASBFonts.subheading,
    color: '#FFFFFF',
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(107, 91, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#6B5BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  scoreNum: {
    fontSize: 24,
    fontFamily: ASBFonts.heading,
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 8,
    fontFamily: ASBFonts.bodyBold,
    color: '#D946EF',
  },
  verdictText: {
    fontSize: 14,
    fontFamily: ASBFonts.bodyBold,
    color: '#FFFFFF',
    marginVertical: 6,
  },
  footerNote: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6B5BFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shareBtnText: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: '#FFFFFF',
  },
});
