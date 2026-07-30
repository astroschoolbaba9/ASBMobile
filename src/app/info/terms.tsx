// mobile-app/src/app/info/terms.tsx
// Terms of Service Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';

export default function TermsScreen() {
  const router = useRouter();

  const sections = [
    { title: '1. Acceptance of Terms', body: 'By accessing or using the ASB Numerology application and website services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.' },
    { title: '2. Description of Services', body: 'ASB provides AI-powered numerology reports, name analysis, mobile number consultations, crystal & spiritual product marketplace, online courses, and 1-on-1 consultation booking services.' },
    { title: '3. User Accounts & Registration', body: 'You must provide accurate, complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. One account per individual is permitted.' },
    { title: '4. Payment & Billing', body: 'All purchases are processed securely via PayU payment gateway. Prices are listed in Indian Rupees (INR). Payment confirmation is sent to your registered email/phone.' },
    { title: '5. Intellectual Property', body: 'All content, reports, course materials, and software on ASB platforms are the intellectual property of ASB Numerology. Unauthorized reproduction or distribution is strictly prohibited.' },
    { title: '6. Limitation of Liability', body: 'Numerology reports are for guidance and entertainment purposes. ASB is not liable for any decisions made based on numerological predictions. Professional advice should be sought for medical, legal, or financial matters.' },
    { title: '7. Governing Law', body: 'These terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Noida, Uttar Pradesh, India.' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Terms of Service</Text>
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
