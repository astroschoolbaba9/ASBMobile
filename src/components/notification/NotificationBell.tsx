// mobile-app/src/components/notification/NotificationBell.tsx
// Animated Header Bell Icon with Real-Time Unread Badge Counter

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationBell: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = ASBColors.darkNavy,
}) => {
  const { unreadCount, setDrawerOpen } = useNotifications();

  return (
    <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.container} activeOpacity={0.7}>
      <Bell size={size} color={color} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
