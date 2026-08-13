// mobile-app/src/app/info/disclaimer.tsx
// Comprehensive Legal & Guidance Disclaimer Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Info } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';

export default function DisclaimerScreen() {
  const router = useRouter();

  const sections = [
    {
      title: '1. Purpose of Guidance & Energetic Alignment',
      body: 'Numerology insights, Chaldean vibrational calculations, name spelling recommendations, and digital reports provided by ASB Numerology are intended exclusively for personal growth, self-awareness, positive energy alignment, and educational reflection.'
    },
    {
      title: '2. Medical & Psychological Disclaimer',
      body: 'ASB Numerology tools, reports, and consultation recommendations do not evaluate, diagnose, treat, or cure any medical or psychological conditions. They should never be used as a substitute for professional medical advice, clinical diagnosis, or mental health therapy.'
    },
    {
      title: '3. Financial, Legal & Career Decision Disclaimer',
      body: 'Calculations regarding professional alignment, business naming, or financial time cycles are designed for intuitive inspiration. Users remain solely responsible for conducting independent due diligence before making binding legal contracts, career changes, or financial investments.'
    },
    {
      title: '4. Individual Action & Free Will Responsibility',
      body: 'Spiritual and numerical energies act as subtle guiding influences. Final real-world outcomes, personal achievements, health status, and life progress depend entirely on individual choices, personal effort, determination, and external environmental factors.'
    },
    {
      title: '5. Cultural & Ancient Wisdom Context',
      body: 'Our calculations draw from ancient Chaldean numerology traditions, Vedic numerical harmonics, and Lo Shu sacred geometry principles. Interpretations are intended to empower personal self-reflection within a respectful, modern digital context.'
    },
    {
      title: '6. Limitation of Liability',
      body: 'ASB Numerology, its founders, practitioners, and technology partners shall not be held liable for any direct, indirect, consequential, or decision-based outcomes arising from reliance upon numerology analyses or recommended name alterations.'
    },
    {
      title: '7. Age Requirement & Service Terms',
      body: 'By utilizing ASB Numerology applications, purchasing custom reports, or booking consultation sessions, you confirm that you are at least 18 years of age and agree to our Terms of Service and Privacy Policy.'
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Legal Disclaimer</Text>
      </View>
      <Text style={styles.updated}>Last Updated: August 2026</Text>

      {/* Primary Highlight Statement Card */}
      <GlassCard style={styles.highlightCard}>
        <View style={styles.headerRow}>
          <Info size={22} color={ASBColors.primaryPurple} />
          <Text style={styles.highlightTitle}>Official Legal Statement</Text>
        </View>
        <Text style={styles.highlightText}>
          Numerology insights and name spelling suggestions are provided for personal guidance, self-awareness, and positive energy alignment. They are not intended to replace legal, medical, or professional advice. Outcomes depend on individual actions and personal decisions.
        </Text>
      </GlassCard>

      {/* Detailed Sections */}
      {sections.map((s, idx) => (
        <GlassCard key={idx} style={styles.card}>
          <Text style={styles.secTitle}>{s.title}</Text>
          <Text style={styles.secBody}>{s.body}</Text>
        </GlassCard>
      ))}

      {/* Footer Navigation back to Terms & Privacy */}
      <View style={styles.footerLinksRow}>
        <TouchableOpacity onPress={() => router.push('/info/terms' as any)}>
          <Text style={styles.footerLinkText}>View Terms of Service</Text>
        </TouchableOpacity>
        <Text style={styles.footerDot}>•</Text>
        <TouchableOpacity onPress={() => router.push('/info/privacy' as any)}>
          <Text style={styles.footerLinkText}>View Privacy Policy</Text>
        </TouchableOpacity>
      </View>
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
  highlightCard: { padding: 16, backgroundColor: 'rgba(139, 92, 246, 0.08)', borderColor: ASBColors.borderPurple },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  highlightTitle: { fontSize: 14, fontWeight: '800', color: ASBColors.primaryPurple, letterSpacing: 0.5 },
  highlightText: { fontSize: 13, color: ASBColors.darkNavy, lineHeight: 20, fontWeight: '600' },
  card: { padding: 14 },
  secTitle: { fontSize: 14, fontWeight: '700', color: ASBColors.darkNavy, marginBottom: 6 },
  secBody: { fontSize: 13, color: ASBColors.darkNavy, lineHeight: 20 },
  footerLinksRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 12 },
  footerLinkText: { fontSize: 12, fontWeight: '700', color: ASBColors.primaryPurple, textDecorationLine: 'underline' },
  footerDot: { color: ASBColors.textMuted },
});
