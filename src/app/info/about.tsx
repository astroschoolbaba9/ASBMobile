// mobile-app/src/app/info/about.tsx
// About ASB Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Award, Users, Globe } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>About ASB Numerology</Text>
      </View>

      <GlassCard variant="gold" style={styles.card}>
        <View style={styles.headerRow}>
          <Sparkles size={32} color={ASBColors.sacredGold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>ASB Numerology</Text>
            <Text style={styles.heroSub}>Ancient Science • Modern Technology</Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>OUR MISSION</Text>
        <Text style={styles.bodyText}>
          ASB Numerology is dedicated to making the ancient science of numbers accessible to everyone. We combine time-tested Chaldean and Pythagorean numerology systems with cutting-edge AI technology to deliver highly accurate, personalized cosmic blueprints.
        </Text>
        <Text style={[styles.bodyText, { marginTop: 10 }]}>
          Founded by Bhaskar Joshi, ASB has served over 10,000+ individuals worldwide, helping them understand their life path, career alignment, relationship compatibility, and spiritual growth through the power of numbers.
        </Text>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>WHAT WE OFFER</Text>
        {[
          { icon: <Award size={18} color={ASBColors.primaryPurple} />, title: 'Personalized Numerology Reports', desc: '100+ page AI-generated cosmic blueprint covering all life areas' },
          { icon: <Users size={18} color={ASBColors.crimsonMagenta} />, title: 'Expert Consultations', desc: '1-on-1 sessions with senior ASB numerologists' },
          { icon: <Globe size={18} color={ASBColors.royalViolet} />, title: 'Crystal & Spiritual Store', desc: 'Energised crystals, rudraksha, gemstones & yantras' },
          { icon: <Sparkles size={18} color={ASBColors.sacredGold} />, title: 'Learning Courses', desc: 'Master numerology & crystal healing from experts' },
        ].map((item, idx) => (
          <View key={idx} style={styles.offerRow}>
            {item.icon}
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </GlassCard>

      <GlassCard variant="dark" style={styles.card}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>10K+</Text>
            <Text style={styles.statLabel}>Reports Generated</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>98.4%</Text>
            <Text style={styles.statLabel}>Accuracy Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>24/7</Text>
            <Text style={styles.statLabel}>AI Support</Text>
          </View>
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 14 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  card: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: ASBColors.darkNavy },
  heroSub: { fontSize: 12, color: ASBColors.sacredGold, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: ASBColors.darkNavy, letterSpacing: 1, marginBottom: 10 },
  bodyText: { fontSize: 13, color: ASBColors.darkNavy, lineHeight: 20 },
  offerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3E8FF' },
  offerTitle: { fontSize: 14, fontWeight: '700', color: ASBColors.darkNavy },
  offerDesc: { fontSize: 12, color: ASBColors.textMuted, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800', color: ASBColors.sacredGold },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 },
});
