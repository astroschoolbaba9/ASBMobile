// mobile-app/src/app/(tabs)/reports.tsx
// Full Numerology Reports Center Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, Briefcase, Heart, Shield, Calendar, BookOpen, UserCheck, Sparkles, ChevronRight, CheckCircle, User, Lock } from 'lucide-react-native';
import { ASBColors, ASBFonts, ASBShadows } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { useAuth } from '../../context/AuthContext';

export default function ReportsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filters = [
    { id: 'ALL', label: 'All Reports' },
    { id: 'CAREER', label: 'Career & Wealth' },
    { id: 'HEALTH', label: 'Health' },
    { id: 'LOVE', label: 'Relationship' },
    { id: 'CYCLES', label: 'Predictions' },
  ];

  const reportsList = [
    {
      id: 'profession',
      category: 'CAREER',
      title: 'Profession & Career Alignment',
      desc: 'Ideal industries, Business vs Job verdict, financial growth timeline.',
      icon: <Briefcase size={22} color={ASBColors.primaryPurple} />,
      route: '/reports/profession',
    },
    {
      id: 'health',
      category: 'HEALTH',
      title: 'Health & Vitality Triangle',
      desc: 'Organ system vulnerability nodes, health cycles, dietary remedies.',
      icon: <Heart size={22} color={ASBColors.crimsonMagenta} />,
      route: '/reports/health',
    },
    {
      id: 'relationship',
      category: 'LOVE',
      title: 'Relationship & Marriage Compatibility',
      desc: 'Dual birth chart harmony, emotional synergy, favorable wedding years.',
      icon: <Heart size={22} color={ASBColors.royalViolet} />,
      route: '/reports/relationship',
    },
    {
      id: 'swot',
      category: 'ALL',
      title: 'SWOT Analysis Matrix',
      desc: 'Comprehensive Strengths, Weaknesses, Opportunities & Threats report based on your birth numbers.',
      icon: <Shield size={22} color={ASBColors.primaryPurple} />,
      route: '/reports/swot',
    },
    {
      id: 'mystical-triangle',
      category: 'ALL',
      title: 'Mystical Triangle & Sacred Chaldean Geometry',
      desc: 'Sacred Chaldean triangle geometry, compound vibration pairs, and karmic destiny lines.',
      icon: <Sparkles size={22} color={ASBColors.crimsonMagenta} />,
      route: '/reports/mystical-triangle',
      badge: 'FEATURED',
    },
    {
      id: 'time-cycles',
      category: 'CYCLES',
      title: 'Time Cycles & Daily Horoscope',
      desc: 'Today lucky numbers, 12-month personal year matrix, 9-year cycle graph.',
      icon: <Calendar size={22} color={ASBColors.purple700} />,
      route: '/reports/time-cycles',
    },
    {
      id: 'pdf-viewer',
      category: 'ALL',
      title: '100-Page Master PDF Report',
      desc: 'Full cosmic dossier generated for your birth date. Download & print.',
      icon: <FileText size={22} color={ASBColors.primaryPurple} />,
      route: '/reports/pdf-viewer',
      badge: 'PREMIUM',
    },
    {
      id: 'tarot',
      category: 'ALL',
      title: 'Daily 3D Tarot Reading',
      desc: 'Draw your daily tarot card for intuitive spiritual clarity.',
      icon: <BookOpen size={22} color={ASBColors.crimsonMagenta} />,
      route: '/tools/tarot',
    },
    {
      id: 'consult',
      category: 'ALL',
      title: 'Book 1-on-1 Consultation',
      desc: 'Schedule a private consultation session with senior ASB numerologists.',
      icon: <UserCheck size={22} color={ASBColors.primaryPurple} />,
      route: '/tools/consult-booking',
    },
  ];

  const filteredReports =
    selectedFilter === 'ALL'
      ? reportsList
      : reportsList.filter((item) => item.category === selectedFilter || item.category === 'ALL');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>COSMIC REPORTS CENTER</Text>
      <Text style={styles.headerSubtitle}>Select a report module to view deep numerical insights</Text>

      {/* Auto-Synced Profile Status Card */}
      <GlassCard style={{ marginBottom: 16, padding: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={16} color={user?.dob ? ASBColors.goodGreen : ASBColors.textMuted} />
            <Text style={{ fontSize: 12, fontFamily: ASBFonts.bodyBold, color: ASBColors.darkNavy }}>
              {user?.name ? `Profile Synced: ${user.name}` : 'Guest User'}
            </Text>
          </View>
          <Text style={{ fontSize: 11, fontFamily: ASBFonts.bodyMedium, color: ASBColors.primaryPurple }}>
            {user?.dob ? `DOB: ${user.dob}` : 'DOB: Not Set'}
          </Text>
        </View>
      </GlassCard>

      {/* Filter Category Carousel */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setSelectedFilter(f.id)}
            style={[styles.filterChip, selectedFilter === f.id && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, selectedFilter === f.id && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Report Cards List */}
      <View style={styles.listContainer}>
        {filteredReports.map((report) => (
          <TouchableOpacity
            key={report.id}
            activeOpacity={0.8}
            style={[styles.reportCard, ASBShadows.cardRest]}
            onPress={() => {
              if (report.badge === 'PREMIUM' && !isAuthenticated) {
                router.push('/(auth)/login');
              } else {
                router.push(report.route as any);
              }
            }}
          >
            <View style={styles.iconContainer}>{report.icon}</View>

            <View style={styles.infoCol}>
              <View style={styles.titleRow}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                {report.badge && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{report.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.reportDesc}>{report.desc}</Text>
            </View>

            <ChevronRight size={18} color={ASBColors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ASBColors.bgWarmIvory,
  },
  content: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 90,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ASBColors.darkNavy,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: ASBColors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: ASBColors.primaryPurple,
    borderColor: ASBColors.primaryPurple,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: ASBColors.darkNavy,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    gap: 12,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ASBColors.darkNavy,
    flex: 1,
  },
  badgeContainer: {
    backgroundColor: ASBColors.soonBadgeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: ASBColors.soonBadgeText,
  },
  reportDesc: {
    fontSize: 11,
    color: ASBColors.textMuted,
    lineHeight: 16,
  },
});
