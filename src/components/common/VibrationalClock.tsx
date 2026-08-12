// mobile-app/src/components/common/VibrationalClock.tsx
// Real-Time Decision Clock displaying active high-energy windows

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Zap, Sun, Moon, Briefcase, Heart } from 'lucide-react-native';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { GlassCard } from './GlassCard';

interface WindowInfo {
  name: string;
  category: string;
  icon: React.ReactNode;
  bestFor: string;
  color: string;
}

export const VibrationalClock: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getActiveWindow = (date: Date): WindowInfo => {
    const hour = date.getHours();

    if (hour >= 6 && hour < 11) {
      return {
        name: '06:00 AM - 11:00 AM',
        category: 'Wealth & Manifestation',
        icon: <Sun size={18} color="#F59E0B" />,
        bestFor: 'Sales calls, financial decisions & strategic deals',
        color: '#F59E0B',
      };
    } else if (hour >= 11 && hour < 15) {
      return {
        name: '11:00 AM - 03:00 PM',
        category: 'Career & Executive Power',
        icon: <Briefcase size={18} color={ASBColors.primaryPurple} />,
        bestFor: 'Important meetings, public launches & contract signing',
        color: ASBColors.primaryPurple,
      };
    } else if (hour >= 15 && hour < 19) {
      return {
        name: '03:00 PM - 07:00 PM',
        category: 'Focus & Intellectual Strategy',
        icon: <Zap size={18} color={ASBColors.crimsonMagenta} />,
        bestFor: 'Complex problem solving, study & creative writing',
        color: ASBColors.crimsonMagenta,
      };
    } else {
      return {
        name: '07:00 PM - 06:00 AM',
        category: 'Peace & Restorative Vibration',
        icon: <Moon size={18} color={ASBColors.purple700} />,
        bestFor: 'Meditation, family time, and subconscious healing',
        color: ASBColors.purple700,
      };
    }
  };

  const activeWindow = getActiveWindow(now);
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <GlassCard style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Clock size={18} color={activeWindow.color} />
          <Text style={styles.title}>Real-Time Vibrational Clock</Text>
        </View>
        <Text style={[styles.digitalTime, { color: activeWindow.color }]}>{timeString}</Text>
      </View>

      <View style={styles.windowBox}>
        <View style={styles.windowHeader}>
          {activeWindow.icon}
          <View style={{ flex: 1 }}>
            <Text style={styles.windowCategory}>{activeWindow.category}</Text>
            <Text style={styles.windowHours}>{activeWindow.name}</Text>
          </View>
          <View style={[styles.activeBadge, { backgroundColor: `${activeWindow.color}18` }]}>
            <Text style={[styles.activeBadgeText, { color: activeWindow.color }]}>ACTIVE NOW</Text>
          </View>
        </View>

        <Text style={styles.bestForText}>
          <Text style={{ fontFamily: ASBFonts.bodyBold }}>Best For: </Text>
          {activeWindow.bestFor}
        </Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  digitalTime: {
    fontSize: 13,
    fontFamily: ASBFonts.heading,
    letterSpacing: 0.5,
  },
  windowBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
  },
  windowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  windowCategory: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  windowHours: {
    fontSize: 11,
    color: ASBColors.textMuted,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 9,
    fontFamily: ASBFonts.bodyBold,
  },
  bestForText: {
    fontSize: 11,
    color: ASBColors.darkNavy,
    lineHeight: 16,
    borderTopWidth: 1,
    borderTopColor: ASBColors.borderIvory,
    paddingTop: 8,
    marginTop: 4,
  },
});
