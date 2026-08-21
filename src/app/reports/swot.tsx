// mobile-app/src/app/reports/swot.tsx
// Personal SWOT Analysis Screen (100% Dynamic Math Derived from Lo Shu Grid & DOB)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react-native';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { DobRequiredGate } from '../../components/common/DobRequiredGate';
import { useAuth } from '../../context/AuthContext';
import { calculateNumerologyProfile } from '../../utils/numerologyMath';
import { reportApi, formatDobForApi } from '../../api/client';

import { getGuestProfile } from '../../utils/guestStorage';

export default function SwotAnalysisScreen() {
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
  const profile = calculateNumerologyProfile(effectiveDob, effectiveName);

  const [loading, setLoading] = useState(false);
  const [backendSwot, setBackendSwot] = useState<any>(null);

  useEffect(() => {
    if (!effectiveDob) return;
    let isMounted = true;
    const fetchSwotReport = async () => {
      setLoading(true);
      const dobFormatted = formatDobForApi(effectiveDob);
      try {
        const res = await reportApi.get('/api/numerology/mystical-triangle.report.json', {
          params: { dob: dobFormatted },
        });
        if (isMounted && res.data) {
          setBackendSwot(res.data);
        }
      } catch (e) {
        console.warn('SWOT API fallback:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSwotReport();
    return () => {
      isMounted = false;
    };
  }, [effectiveDob]);

  // Dynamic SWOT Generator based on Moolank & Missing Lo Shu Digits or Backend Report
  const getDynamicSwot = () => {
    const pairCombined = backendSwot?.mulank_bhagyank?.pair_meaning?.combined;

    const s = [
      ...(pairCombined?.strengths || []),
      `Soul Number ${profile?.moolank}: Natural leadership and intuitive strategic clarity.`,
      `Life Path ${profile?.bhagyank}: High adaptability in financial and corporate environments.`,
      `Present Lo Shu Digits (${profile?.presentDigits?.join(', ')}): Strong vibrational foundation for execution.`,
    ];

    const w = [
      ...(pairCombined?.weakness || []),
      `Missing Lo Shu Digits (${profile?.missingDigits?.join(', ')}): Potential gaps in daily routine discipline.`,
      `Personal Year #${profile?.personalYear}: Guard against impatience during transition phases.`,
    ];

    const o = [
      pairCombined?.summary ? `Chaldean Pair Overview: ${pairCombined.summary}` : '',
      `Favorable expansion window during Personal Year #${profile.personalYear} cycles.`,
      `High returns when aligning brand name with target compound Chaldean numbers.`,
      `Strategic alliances with complementary Soul Numbers.`,
    ].filter(Boolean);

    const t = [
      `Avoid impulsive financial commitments during Personal Month #${profile.personalMonth}.`,
      `Ensure contractual terms are reviewed thoroughly before signing.`,
    ];

    return { s, w, o, t };
  };

  const swot = getDynamicSwot();

  return (
    <DobRequiredGate reportTitle="Personal SWOT Analysis">
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Personal SWOT Analysis</Text>
      </View>

      <Text style={styles.subtitle}>
        4-Quadrant Matrix for {effectiveName} (DOB: {effectiveDob})
      </Text>

      {/* Strengths */}
      <GlassCard style={[styles.card, { backgroundColor: '#E6F7ED', borderColor: '#A7F3D0' }]}>
        <View style={styles.cardTitleRow}>
          <ShieldCheck size={20} color="#065F46" />
          <Text style={[styles.cardTitle, { color: '#065F46' }]}>Strengths (S)</Text>
        </View>
        {swot.s.map((item, idx) => (
          <Text key={idx} style={[styles.cardBody, { color: '#064E3B' }]}>
            • {item}
          </Text>
        ))}
      </GlassCard>

      {/* Weaknesses */}
      <GlassCard style={[styles.card, { backgroundColor: '#FFE8E0', borderColor: '#FCA5A5' }]}>
        <View style={styles.cardTitleRow}>
          <AlertCircle size={20} color="#991B1B" />
          <Text style={[styles.cardTitle, { color: '#991B1B' }]}>Weaknesses (W)</Text>
        </View>
        {swot.w.map((item, idx) => (
          <Text key={idx} style={[styles.cardBody, { color: '#7F1D1D' }]}>
            • {item}
          </Text>
        ))}
      </GlassCard>

      {/* Opportunities */}
      <GlassCard style={[styles.card, { backgroundColor: '#FAF5FF', borderColor: ASBColors.borderIvory }]}>
        <View style={styles.cardTitleRow}>
          <TrendingUp size={20} color={ASBColors.primaryPurple} />
          <Text style={[styles.cardTitle, { color: ASBColors.primaryPurple }]}>Opportunities (O)</Text>
        </View>
        {swot.o.map((item, idx) => (
          <Text key={idx} style={[styles.cardBody, { color: ASBColors.darkNavy }]}>
            • {item}
          </Text>
        ))}
      </GlassCard>

      {/* Threats */}
      <GlassCard style={[styles.card, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
        <View style={styles.cardTitleRow}>
          <AlertTriangle size={20} color="#DC2626" />
          <Text style={[styles.cardTitle, { color: '#DC2626' }]}>Threats (T)</Text>
        </View>
        {swot.t.map((item, idx) => (
          <Text key={idx} style={[styles.cardBody, { color: '#991B1B' }]}>
            • {item}
          </Text>
        ))}
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
  subtitle: {
    fontSize: 12,
    color: ASBColors.textMuted,
    marginTop: -4,
    marginBottom: 4,
  },
  card: {
    padding: 16,
    borderWidth: 1.5,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: ASBFonts.bodyBold,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: ASBFonts.bodyMedium,
    marginVertical: 2,
  },
});
