// mobile-app/src/hooks/useStreak.ts
// Habit-Forming Daily Streak & Karma XP Persistence Hook

import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const STREAK_KEY = 'asb_user_streak_data';

export interface StreakData {
  streakDays: number;
  lastCheckinDate: string;
  karmaXp: number;
  level: number;
  levelTitle: string;
}

const LEVEL_TITLES = [
  'Cosmic Seeker',
  'Vibrational Student',
  'Harmonious Alchemist',
  'Sacred Initiate',
  'Master Numerologist',
  'Universal Sage',
];

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData>({
    streakDays: 1,
    lastCheckinDate: '',
    karmaXp: 20,
    level: 1,
    levelTitle: 'Cosmic Seeker',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const stored = await SecureStore.getItemAsync(STREAK_KEY);
      const todayStr = new Date().toISOString().split('T')[0];

      if (stored) {
        const parsed: StreakData = JSON.parse(stored);
        const lastDate = parsed.lastCheckinDate;

        if (lastDate === todayStr) {
          // Already checked in today
          setStreakData(parsed);
        } else {
          // Check if yesterday
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          let newStreak = parsed.streakDays;
          if (lastDate === yesterdayStr) {
            newStreak += 1;
          } else if (lastDate !== todayStr) {
            newStreak = 1; // Reset streak if missed more than 1 day
          }

          const newXp = parsed.karmaXp + 10;
          const newLevel = Math.min(6, Math.floor(newXp / 50) + 1);
          const levelTitle = LEVEL_TITLES[newLevel - 1] || 'Universal Sage';

          const updated: StreakData = {
            streakDays: newStreak,
            lastCheckinDate: todayStr,
            karmaXp: newXp,
            level: newLevel,
            levelTitle,
          };

          await SecureStore.setItemAsync(STREAK_KEY, JSON.stringify(updated));
          setStreakData(updated);
        }
      } else {
        // Initial setup
        const initial: StreakData = {
          streakDays: 1,
          lastCheckinDate: todayStr,
          karmaXp: 20,
          level: 1,
          levelTitle: 'Cosmic Seeker',
        };
        await SecureStore.setItemAsync(STREAK_KEY, JSON.stringify(initial));
        setStreakData(initial);
      }
    } catch (e) {
      console.warn('Failed to load streak data:', e);
    } finally {
      setLoading(false);
    }
  };

  const addXp = async (points: number) => {
    try {
      const newXp = streakData.karmaXp + points;
      const newLevel = Math.min(6, Math.floor(newXp / 50) + 1);
      const levelTitle = LEVEL_TITLES[newLevel - 1] || 'Universal Sage';

      const updated = {
        ...streakData,
        karmaXp: newXp,
        level: newLevel,
        levelTitle,
      };

      await SecureStore.setItemAsync(STREAK_KEY, JSON.stringify(updated));
      setStreakData(updated);
    } catch (e) {
      console.warn('Failed to update XP:', e);
    }
  };

  return {
    ...streakData,
    loading,
    addXp,
    refetchStreak: loadStreak,
  };
}
