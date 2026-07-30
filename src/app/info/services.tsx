// mobile-app/src/app/info/services.tsx
// Our Services Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, FileText, Smartphone, User, ShoppingBag, BookOpen, UserCheck } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';

export default function ServicesScreen() {
  const router = useRouter();

  const services = [
    { icon: <FileText size={24} color={ASBColors.primaryPurple} />, title: 'AI Numerology Reports', desc: 'Get a comprehensive 100+ page cosmic blueprint covering profession, health, relationship, SWOT analysis, and time cycles based on your birth date.', action: 'Generate Report', route: '/(tabs)' },
    { icon: <User size={24} color={ASBColors.crimsonMagenta} />, title: 'Name Numerology Engine', desc: 'Analyze your name vibration using Chaldean system. Get smart spelling recommendations optimized for your career and personal growth.', action: 'Analyze Name', route: '/(tabs)/name' },
    { icon: <Smartphone size={24} color={ASBColors.royalViolet} />, title: 'Mobile Number Analysis', desc: 'Check if your phone number is harmonious with your birth chart. Get digit pair analysis, harmony score, and remedial suggestions.', action: 'Check Mobile', route: '/(tabs)/mobile-num' },
    { icon: <ShoppingBag size={24} color={ASBColors.sacredGold} />, title: 'Crystal & Spiritual Store', desc: 'Shop certified energised crystals, rudraksha, gemstones, yantras, and healing bracelets for vibrational alignment and spiritual growth.', action: 'Visit Store', route: '/(tabs)/marketplace' },
    { icon: <BookOpen size={24} color={ASBColors.primaryPurple} />, title: 'Online Courses', desc: 'Learn numerology, crystal healing, and chakra alignment from senior ASB experts through structured video courses.', action: 'Browse Courses', route: '/shop/courses' },
    { icon: <UserCheck size={24} color={ASBColors.crimsonMagenta} />, title: 'Private Consultations', desc: 'Book 1-on-1 sessions with Bhaskar Joshi or senior numerologists for personalized guidance on career, marriage, health, and business.', action: 'Book Session', route: '/tools/consult-booking' },
    { icon: <Sparkles size={24} color={ASBColors.sacredGold} />, title: 'AI Cosmic Assistant', desc: '24/7 AI-powered cosmic guide for quick numerology predictions on love, career, education, business, and daily guidance.', action: 'Ask AI', route: '/(tabs)' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Our Services</Text>
      </View>

      <Text style={styles.subtitle}>Complete suite of numerology, spiritual, and e-commerce services</Text>

      <View style={{ gap: 12 }}>
        {services.map((svc, idx) => (
          <GlassCard key={idx} style={styles.card}>
            <View style={styles.svcRow}>
              <View style={styles.svcIcon}>{svc.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.svcTitle}>{svc.title}</Text>
                <Text style={styles.svcDesc}>{svc.desc}</Text>
                <TouchableOpacity style={styles.svcAction} onPress={() => router.push(svc.route as any)}>
                  <Text style={styles.svcActionText}>{svc.action} →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 14 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  subtitle: { fontSize: 12, color: ASBColors.textMuted, marginTop: -4 },
  card: { padding: 14 },
  svcRow: { flexDirection: 'row', gap: 12 },
  svcIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FAF5FF', alignItems: 'center', justifyContent: 'center' },
  svcTitle: { fontSize: 15, fontWeight: '700', color: ASBColors.darkNavy },
  svcDesc: { fontSize: 12, color: ASBColors.textMuted, lineHeight: 18, marginTop: 4 },
  svcAction: { marginTop: 8 },
  svcActionText: { fontSize: 13, fontWeight: '700', color: ASBColors.primaryPurple },
});
