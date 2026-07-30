// mobile-app/src/components/common/CircularScoreMeter.tsx
// Animated Circular Radial Meter for Mobile Numerology Score

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ASBColors } from '../../theme/tokens';

interface ScoreMeterProps {
  score: number; // 0 to 100
  verdict?: string;
}

export const CircularScoreMeter: React.FC<ScoreMeterProps> = ({ score, verdict = 'HARMONIOUS' }) => {
  const getScoreColor = () => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 50) return '#F59E0B'; // Yellow/Gold
    return '#EF4444'; // Red
  };

  return (
    <View style={styles.container}>
      <View style={[styles.outerRing, { borderColor: `${getScoreColor()}30` }]}>
        <View style={[styles.innerCircle, { borderColor: getScoreColor() }]}>
          <Text style={[styles.scoreValue, { color: getScoreColor() }]}>{score}%</Text>
          <Text style={styles.scoreLabel}>HARMONY SCORE</Text>
        </View>
      </View>
      <View style={[styles.verdictBadge, { backgroundColor: getScoreColor() }]}>
        <Text style={styles.verdictText}>{verdict.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  outerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  innerCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: ASBColors.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  verdictBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: -14,
  },
  verdictText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
