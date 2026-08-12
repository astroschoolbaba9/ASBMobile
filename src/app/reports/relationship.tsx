// mobile-app/src/app/reports/relationship.tsx
// Relationship & Marriage Compatibility Report Screen with Social Share Cards

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Star, Sparkles } from 'lucide-react-native';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { reportApi, formatDobForApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SocialShareCard } from '../../components/common/SocialShareCard';
import { calculateRelationshipCompatibility } from '../../utils/numerologyMath';
import { formatDobInput, isValidDob } from '../../utils/dobFormatter';

export default function RelationshipReportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [partner1Name, setPartner1Name] = useState(user?.name || '');
  const [partner1Dob, setPartner1Dob] = useState(user?.dob || '');
  const [partner2Name, setPartner2Name] = useState('');
  const [partner2Dob, setPartner2Dob] = useState('');
  const [loading, setLoading] = useState(false);

  const initialCalc = (partner1Dob && partner2Dob) ? calculateRelationshipCompatibility(partner1Name || 'Partner 1', partner1Dob, partner2Name || 'Partner 2', partner2Dob) : null;
  const [report, setReport] = useState<any>(initialCalc);

  const handleAnalyze = async () => {
    if (!partner1Dob.trim() || !isValidDob(partner1Dob)) {
      showToast({ type: 'error', title: '🔮 Partner 1 Birth Date Needed', message: 'Please enter a valid Date of Birth for Partner 1 in DD-MM-YYYY format.' });
      return;
    }
    if (!partner2Dob.trim() || !isValidDob(partner2Dob)) {
      showToast({ type: 'error', title: '🔮 Partner 2 Birth Date Needed', message: 'Please enter a valid Date of Birth for Partner 2 in DD-MM-YYYY format.' });
      return;
    }

    setLoading(true);

    const dob1Formatted = formatDobForApi(partner1Dob);
    const dob2Formatted = formatDobForApi(partner2Dob);

    try {
      const res = await reportApi.get('/api/numerology/relationship-triangle.report.json', {
        params: { left: dob1Formatted, right: dob2Formatted },
      });
      if (res.data) {
        const bond = res.data.bond_assessment || {};
        const rawScore = typeof bond.score === 'number' ? bond.score : 3;
        const calcPercent = Math.min(98, Math.max(65, 70 + rawScore * 7));
        const ratingLabel = (bond.bucket || res.data.rating || 'HIGH SOUL MATCH').toUpperCase();

        const coreInterp = res.data.interpretations?.core || {};
        const efNote = coreInterp['Union EF (emotional–mental blend)']?.note || coreInterp['Union EF']?.note || '';
        const gNote = coreInterp['Shared G (relationship center)']?.meaning || coreInterp['Shared G']?.meaning || '';
        const pNote = coreInterp['Outcome P (direction of bond)']?.meaning || coreInterp['Outcome P']?.meaning || '';
        const specialNotes = res.data.special_notes?.notes?.join(' • ') || '';

        const emotionalText = [
          `Bond Status: ${bond.bucket || 'Favorable'} Match (Synergy #${res.data.combined_number || 8}).`,
          efNote ? `Emotional & Mental Blend: ${efNote}` : '',
          gNote ? `Foundation Core: ${gNote}` : '',
        ].filter(Boolean).join('\n\n');

        const outlookText = [
          pNote ? `Long-Term Outcome: ${pNote}` : '',
          specialNotes ? `Special Cosmic Indicators: ${specialNotes}` : '',
          !pNote && !specialNotes ? `Long-term marriage stability is exceptionally favorable for Personal Years 2026–2027.` : '',
        ].filter(Boolean).join('\n\n');

        setReport({
          score: calcPercent,
          rating: ratingLabel,
          emotional_harmony: emotionalText,
          marriage_outlook: outlookText,
        });
      }
    } catch (e) {
      console.warn('Relationship API fallback, calculating local Chaldean math:', e);
      const computed = calculateRelationshipCompatibility(partner1Name, partner1Dob, partner2Name, partner2Dob);
      setReport(computed);
    } finally {
      setLoading(false);
    }
  };

  const emotionalHarmonyText = report?.emotional_harmony || initialCalc?.emotional_harmony || 'Enter details above to analyze emotional synergy.';
  const marriageOutlookText = report?.marriage_outlook || initialCalc?.marriage_outlook || 'Enter details above to analyze long-term outlook.';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Relationship Compatibility</Text>
      </View>

      {/* Input Form Card */}
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>ENTER PARTNER DETAILS</Text>

        <View style={styles.partnerBox}>
          <Text style={styles.pLabel}>PARTNER 1 (YOU)</Text>
          <TextInput
            style={styles.input}
            value={partner1Name}
            onChangeText={setPartner1Name}
            placeholder="Full Name"
          />
          <TextInput
            style={styles.input}
            value={partner1Dob}
            onChangeText={(text) => setPartner1Dob(formatDobInput(text))}
            placeholder="DOB (DD-MM-YYYY)"
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        <View style={styles.partnerBox}>
          <Text style={[styles.pLabel, { color: ASBColors.crimsonMagenta }]}>PARTNER 2</Text>
          <TextInput
            style={styles.input}
            value={partner2Name}
            onChangeText={setPartner2Name}
            placeholder="Full Name"
          />
          <TextInput
            style={styles.input}
            value={partner2Dob}
            onChangeText={(text) => setPartner2Dob(formatDobInput(text))}
            placeholder="DOB (DD-MM-YYYY)"
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        <GradientButton
          title="Analyze Relationship Harmony"
          variant="primary"
          loading={loading}
          icon={<Heart size={18} color="#FFF" />}
          onPress={handleAnalyze}
          style={{ marginTop: 12 }}
        />
      </GlassCard>

      {/* Results */}
      {report && (
        <View style={{ gap: 12 }}>
          <GlassCard variant="purple" style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Star size={32} color={ASBColors.primaryPurple} fill={ASBColors.primaryPurple} />
              <View>
                <Text style={styles.scoreText}>{report.score || 88}% SYNERGY</Text>
                <Text style={styles.ratingText}>{report.rating || 'EXCELLENT SOUL MATCH'}</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.card}>
            <Text style={styles.boxTitle}>Emotional & Soul Connection</Text>
            <Text style={styles.boxText}>{emotionalHarmonyText}</Text>
          </GlassCard>

          <GlassCard style={styles.card}>
            <Text style={styles.boxTitle}>Long-Term Marriage Outlook</Text>
            <Text style={styles.boxText}>{marriageOutlookText}</Text>
          </GlassCard>

          {/* Social Story Share Badge */}
          <SocialShareCard
            name1={partner1Name}
            name2={partner2Name}
            matchScore={report.score || 88}
            verdict={report.rating || 'EXCELLENT SOUL MATCH'}
          />
        </View>
      )}
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
  card: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
    letterSpacing: 1,
    marginBottom: 12,
  },
  partnerBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  pLabel: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: ASBColors.bgWarmIvory,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: ASBColors.darkNavy,
  },
  scoreCard: {
    padding: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  scoreText: {
    fontSize: 22,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
  },
  boxTitle: {
    fontSize: 14,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
    marginBottom: 6,
  },
  boxText: {
    fontSize: 13,
    color: ASBColors.darkNavy,
    lineHeight: 18,
  },
});
