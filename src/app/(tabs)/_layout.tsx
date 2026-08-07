// mobile-app/src/app/(tabs)/_layout.tsx
// Bold & Prominent Bottom Navigation Bar (Matching Website Color Tokens)

import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
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
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconActiveWrapper]}>
              <Sparkles size={focused ? 22 : 20} color={focused ? ASBColors.primaryPurple : ASBColors.textMuted} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconActiveWrapper]}>
              <FileText size={focused ? 22 : 20} color={focused ? ASBColors.primaryPurple : ASBColors.textMuted} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="name"
        options={{
          title: 'Name',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconActiveWrapper]}>
              <User size={focused ? 22 : 20} color={focused ? ASBColors.primaryPurple : ASBColors.textMuted} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mobile-num"
        options={{
          title: 'Mobile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconActiveWrapper]}>
              <Smartphone size={focused ? 22 : 20} color={focused ? ASBColors.primaryPurple : ASBColors.textMuted} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: 'Crystal Shop',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconActiveWrapper]}>
              <ShoppingBag size={focused ? 22 : 20} color={focused ? ASBColors.primaryPurple : ASBColors.textMuted} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
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
    height: 68,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 12,
    shadowColor: '#6B5BFF',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  tabItem: {
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    fontWeight: '700',
    marginTop: 2,
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActiveWrapper: {
    backgroundColor: 'rgba(107, 91, 255, 0.12)',
  },
});
