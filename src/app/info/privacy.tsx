// mobile-app/src/app/info/privacy.tsx
// Privacy Policy Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';

export default function PrivacyScreen() {
  const router = useRouter();

  const sections = [
    { title: '1. Information We Collect', body: 'We collect personal information including your name, email, phone number, date of birth, gender, shipping addresses, and payment details necessary for providing numerology reports and marketplace services.' },
    { title: '2. How We Use Your Information', body: 'Your data is used to generate personalized numerology reports, process orders, deliver courses, and improve our AI prediction engine. Birth data is essential for accurate numerological calculations.' },
    { title: '3. Data Storage & Security', body: 'All data is encrypted and stored securely on MongoDB Atlas servers with AES-256 encryption. JWT tokens are used for session management. Payment data is processed by PayU and never stored on our servers.' },
    { title: '4. Third-Party Sharing', body: 'We do not sell your personal data. Information may be shared with courier partners (BlueDart, Delhivery) for order fulfilment and PayU for payment processing.' },
    { title: '5. Cookies & Analytics', body: 'We use standard analytics to improve user experience. The mobile app uses Expo SecureStore for token persistence. No third-party advertising trackers are used.' },
    { title: '6. Your Rights', body: 'You may request deletion of your account and all associated data by contacting support@asbcrystal.in. You may also update your profile information at any time through the app.' },
    { title: '7. Contact', body: 'For privacy-related queries, email us at privacy@asbcrystal.in or call +91-9911500291.' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Privacy Policy</Text>
      </View>
      <Text style={styles.updated}>Last Updated: July 2026</Text>

      {sections.map((s, idx) => (
        <GlassCard key={idx} style={styles.card}>
          <Text style={styles.secTitle}>{s.title}</Text>
          <Text style={styles.secBody}>{s.body}</Text>
        </GlassCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 12 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  updated: { fontSize: 11, color: ASBColors.textMuted, marginTop: -4 },
  card: { padding: 14 },
  secTitle: { fontSize: 14, fontWeight: '700', color: ASBColors.darkNavy, marginBottom: 6 },
  secBody: { fontSize: 13, color: ASBColors.darkNavy, lineHeight: 20 },
});
