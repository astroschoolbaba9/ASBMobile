// mobile-app/src/app/(tabs)/_layout.tsx
// Polished Bottom Navigation Bar (Website Matched Theme)

import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Sparkles, FileText, User, Smartphone, ShoppingBag } from 'lucide-react-native';
import { ASBColors, ASBFonts } from '../../theme/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ASBColors.primaryPurple,
        tabBarInactiveTintColor: ASBColors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="name"
        options={{
          title: 'Name',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mobile-num"
        options={{
          title: 'Mobile',
          tabBarIcon: ({ color, size }) => <Smartphone size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Crystal Shop',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: ASBColors.borderIvory,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#6B5BFF',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
  },
});
