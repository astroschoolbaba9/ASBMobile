import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        {React.createElement((NativeTabs.Trigger as any).Label, null, 'Home')}
        {React.createElement((NativeTabs.Trigger as any).Icon, {
          src: require('@/assets/images/tabIcons/home.png'),
          renderingMode: 'template',
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        {React.createElement((NativeTabs.Trigger as any).Label, null, 'Explore')}
        {React.createElement((NativeTabs.Trigger as any).Icon, {
          src: require('@/assets/images/tabIcons/explore.png'),
          renderingMode: 'template',
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
