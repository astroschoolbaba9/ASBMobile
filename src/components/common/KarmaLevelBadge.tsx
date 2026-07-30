// mobile-app/src/components/common/KarmaLevelBadge.tsx
// Visual Karma XP Progress & Rank Badge Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Award, Sparkles, ChevronRight, Gift } from 'lucide-react-native';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { GlassCard } from './GlassCard';

interface KarmaLevelBadgeProps {
  level: number;
  levelTitle: string;
  karmaXp: number;
  onPressPerks?: () => void;
}

export const KarmaLevelBadge: React.FC<KarmaLevelBadgeProps> = ({
  level,
  levelTitle,
  karmaXp,
  onPressPerks,
}) => {
  const currentLevelBaseXp = (level - 1) * 50;
  const nextLevelXp = level * 50;
  const progressInLevel = karmaXp - currentLevelBaseXp;
  const progressPercent = Math.min(100, Math.max(0, (progressInLevel / 50) * 100));

  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badgeLeft}>
          <View style={styles.iconCircle}>
            <Award size={20} color={ASBColors.primaryPurple} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.levelTag}>LEVEL {level}</Text>
              <Sparkles size={12} color={ASBColors.crimsonMagenta} />
            </View>
            <Text style={styles.rankTitle}>{levelTitle}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onPressPerks} style={styles.perksBtn}>
          <Gift size={14} color={ASBColors.primaryPurple} />
          <Text style={styles.perksText}>Rank Perks</Text>
          <ChevronRight size={14} color={ASBColors.primaryPurple} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar towards Next Level */}
      <View style={styles.progressSection}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>Karma XP: {karmaXp} PTS</Text>
          <Text style={styles.xpTarget}>Next: {nextLevelXp} PTS</Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 91, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelTag: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    letterSpacing: 1,
  },
  rankTitle: {
    fontSize: 14,
    fontFamily: ASBFonts.subheading,
    color: ASBColors.darkNavy,
  },
  perksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(107, 91, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  perksText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: ASBColors.borderIvory,
    paddingTop: 10,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  xpTarget: {
    fontSize: 11,
    color: ASBColors.textMuted,
  },
  barTrack: {
    height: 6,
    backgroundColor: '#F3E8FF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: ASBColors.primaryPurple,
    borderRadius: 3,
  },
});
