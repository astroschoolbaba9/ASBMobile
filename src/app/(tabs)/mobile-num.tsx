// mobile-app/src/app/(tabs)/mobile-num.tsx
// Mobile Phone Numerology Engine & Harmony Meter Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Smartphone, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { ASBColors, ASBShadows, ASBRadius } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { CircularScoreMeter } from '../../components/common/CircularScoreMeter';
import { mobileApi, reportApi, formatDobForApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDobInput, isValidDob } from '../../utils/dobFormatter';

import { RefreshControl } from 'react-native';

const parsePairDetails = (rawText: string) => {
  if (!rawText) return [];
  const parts = rawText.split('•').map(p => p.trim());
  const parsed = [];
  for (let p of parts) {
    if (!p) continue;
    const match = p.match(/^(\d+)\s*\[(Good|Bad)\]:\s*(.*)$/i);
    if (match) {
      parsed.push({
        pair: match[1],
        isGood: match[2].toLowerCase() === 'good',
        meaning: match[3],
      });
    } else {
      const isGood = !p.toLowerCase().includes('bad') && !p.toLowerCase().includes('challenging');
      parsed.push({
        pair: p.slice(0, 2),
        isGood,
        meaning: p,
      });
    }
  }
  return parsed;
};

export default function MobileNumScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [mobile, setMobile] = useState(user?.phone || '');
  const [challenges, setChallenges] = useState('');

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  React.useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.dob) setDob(user.dob);
    if (user?.phone && !mobile) setMobile(user.phone);
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleConsultation = async () => {
    if (!name.trim()) {
      showToast({ type: 'error', title: '✨ Full Name Required', message: 'Please enter your full name to proceed.' });
      return;
    }
    if (!dob || !dob.trim() || dob.trim().length < 8) {
      showToast({ type: 'error', title: '📅 Date of Birth Required', message: 'Please enter your Date of Birth (DD-MM-YYYY) to proceed.' });
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      showToast({ type: 'error', title: '📱 Mobile Number Required', message: 'Please enter a valid 10-digit mobile phone number to proceed.' });
      return;
    }

    setLoading(true);
    setResult(null);

    const dobFormatted = formatDobForApi(dob);

    try {
      const res = await mobileApi.post('/api/numerology/consultation', {
        name,
        dob: dobFormatted,
        mobile,
        challenges,
      }).catch(() => null);

      if (res && res.data) {
        const raw = res.data;
        const pairArr = Array.isArray(raw.pair_analysis) ? raw.pair_analysis : [];
        const badPairs = pairArr.filter((p: any) => p.type === 'Bad' || p.type === 'Aggressive').map((p: any) => `${p.pair} (${p.meaning || 'Conflict'})`);
        const goodPairs = pairArr.filter((p: any) => p.type === 'Good' || p.type === 'Favorable').map((p: any) => `${p.pair} (${p.meaning || 'Harmony'})`);
        const badCount = badPairs.length;
        const calculatedScore = Math.max(45, Math.min(95, 95 - badCount * 6));
        const verdict = raw.final_result || (badCount > 4 ? 'CHALLENGING VIBRATION' : badCount > 2 ? 'MODERATE HARMONY' : 'HIGH HARMONIOUS VIBRATION');

        const remediesList: string[] = [];
        if (raw.remedies?.color_info) {
          remediesList.push(`Favorable Color: ${raw.remedies.color_info.color || 'White'} (${raw.remedies.color_info.planet || 'Moon'}). Avoid: ${(raw.remedies.color_info.avoid || []).join(', ') || 'Dark tones'}`);
        }
        if (raw.remedies?.crystals && Array.isArray(raw.remedies.crystals)) {
          remediesList.push(`Healing Crystals: ${raw.remedies.crystals.join(', ')}`);
        }
        if (raw.remedies?.directions && Array.isArray(raw.remedies.directions)) {
          remediesList.push(`Auspicious Directions: ${raw.remedies.directions.join(', ')}`);
        }

        const detailsText = pairArr.map((p: any) => `${p.pair} [${p.type}]: ${p.meaning}`).join(' • ') || 'Digit sequence analyzed.';

        setResult({
          ...raw,
          classification_numbers: typeof raw.classification === 'object' ? raw.classification : null,
          pair_analysis: {
            score: calculatedScore,
            verdict,
            bad_combinations: badPairs,
            pair_details: detailsText,
          },
          remedies: remediesList.length > 0 ? remediesList : ['Keep phone screen clean', 'Avoid charging phone near bed headrest'],
        });
      } else {
        calculateMockMobile();
      }
    } catch (e) {
      calculateMockMobile();
    } finally {
      setLoading(false);
    }
  };

  const calculateMockMobile = () => {
    let digitSum = 0;
    const cleanNum = mobile.replace(/\D/g, '');
    for (let char of cleanNum) {
      digitSum += parseInt(char, 10);
    }
    while (digitSum > 9) {
      digitSum = String(digitSum).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    }
    const powerNumber = digitSum === 0 ? 9 : digitSum;

    // Calculate Moolank & Bhagyank from DOB
    const dobDigits = dob.replace(/\D/g, '');
    const dayDigits = dobDigits.slice(0, 2);
    const moolankRaw = dayDigits.split('').reduce((s, d) => s + parseInt(d, 10), 0);
    const moolank = moolankRaw > 9 ? (moolankRaw > 9 ? String(moolankRaw).split('').reduce((s, d) => s + parseInt(d, 10), 0) : moolankRaw) : moolankRaw;
    const bhagyankRaw = dobDigits.split('').reduce((s, d) => s + parseInt(d, 10), 0);
    let bhagyank = bhagyankRaw;
    while (bhagyank > 9) {
      bhagyank = String(bhagyank).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    }

    // Find double digit pairs
    const badPairs: string[] = [];
    for (let i = 0; i < cleanNum.length - 1; i++) {
      const pair = cleanNum.slice(i, i + 2);
      if (['00', '44', '88', '99', '10', '54', '98'].includes(pair)) {
        badPairs.push(pair);
      }
    }

    const score = Math.max(50, 92 - badPairs.length * 10);
    const verdict = score > 80 ? 'HARMONIOUS VIBRATION' : score > 65 ? 'MODERATE HARMONY' : 'CHALLENGING VIBRATION';

    setResult({
      client_info: { name, dob, mobile_number: mobile },
      moolank: moolank || 1,
      bhagyank: bhagyank || 5,
      classification: `Power Number #${powerNumber} Energy Alignment`,
      classification_numbers: {
        friendly: [1, 3, 5, 6].filter(n => n !== moolank),
        enemy: [2, 7, 8].filter(n => n !== moolank),
        neutral: [4, 9].filter(n => n !== moolank),
      },
      pair_analysis: {
        score,
        verdict,
        bad_combinations: badPairs,
        pair_details: `Mobile digit total sums to Power Number ${powerNumber}. Your Soul Number ${moolank} & Destiny Number ${bhagyank} interact with this frequency.`,
      },
      interpretation: `Your mobile number sums to Power Number ${powerNumber}. It generates a ${verdict.toLowerCase()} for daily professional communications and wealth flow.`,
      remedies: [
        `Keep phone wallpaper in favorable color for Power Number ${powerNumber}`,
        'Avoid keeping phone under pillow while sleeping',
        'Keep phone screen clean to preserve positive vibrations',
      ],
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>MOBILE NUMEROLOGY ENGINE</Text>
      <Text style={styles.headerSub}>Analyze mobile phone number vibration & birth chart compatibility</Text>

      {/* Input Form Card */}
      <GlassCard style={styles.formCard}>
        <Text style={styles.inputLabel}>FULL NAME *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. John Doe"
          value={name}
          onChangeText={setName}
          placeholderTextColor={ASBColors.textMuted}
        />

        <Text style={styles.inputLabel}>DATE OF BIRTH (DD-MM-YYYY) *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 15-08-1995"
          value={dob}
          onChangeText={(text) => setDob(formatDobInput(text))}
          placeholderTextColor={ASBColors.textMuted}
          keyboardType="number-pad"
          maxLength={10}
        />

        <Text style={styles.inputLabel}>MOBILE PHONE NUMBER (10 DIGITS) *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="9911500291"
          keyboardType="phone-pad"
          maxLength={10}
          value={mobile}
          onChangeText={setMobile}
          placeholderTextColor={ASBColors.textMuted}
        />

        <Text style={styles.inputLabel}>CURRENT LIFE CHALLENGES / GOALS (OPTIONAL)</Text>
        <TextInput
          style={[styles.textInput, { height: 60 }]}
          placeholder="e.g. Business expansion, financial stability..."
          multiline
          value={challenges}
          onChangeText={setChallenges}
          placeholderTextColor={ASBColors.textMuted}
        />

        <GradientButton
          title="Analyze Mobile Number"
          variant="mobile"
          loading={loading}
          icon={<Smartphone size={18} color="#FFF" />}
          onPress={handleConsultation}
          style={{ marginTop: 14 }}
        />
      </GlassCard>

      {/* Results Section */}
      {result && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionHeading}>MOBILE HARMONY ANALYSIS</Text>

          {/* Radial Harmony Meter */}
          <GlassCard style={styles.meterCard}>
            <CircularScoreMeter
              score={result.pair_analysis?.score || 85}
              verdict={result.pair_analysis?.verdict || 'HARMONIOUS'}
            />
            <Text style={styles.classificationText}>
              {typeof result.classification === 'string'
                ? result.classification
                : `${result.pair_analysis?.verdict || 'HARMONIOUS'} VIBRATION`}
            </Text>
          </GlassCard>

          {/* Moolank & Bhagyank Pair Card */}
          <View style={styles.pairRow}>
            <View style={[styles.pairBox, ASBShadows.cardRest]}>
              <Text style={styles.pairVal}>{result.moolank || 7}</Text>
              <Text style={styles.pairLabel}>MOOLANK (DRIVER)</Text>
            </View>
            <View style={[styles.pairBox, ASBShadows.cardRest]}>
              <Text style={[styles.pairVal, { color: ASBColors.crimsonMagenta }]}>{result.bhagyank || 5}</Text>
              <Text style={styles.pairLabel}>BHAGYANK (DESTINY)</Text>
            </View>
          </View>

          {/* Number Classification Card */}
          <GlassCard style={styles.detailCard}>
            <Text style={styles.detailTitle}>Number Classification</Text>
            <View style={styles.classGrid}>
              <View style={styles.classBox}>
                <Text style={styles.classLabel}>✅ FRIENDLY</Text>
                <Text style={[styles.classVal, { color: ASBColors.goodGreen }]}>
                  {(
                    result.classification_numbers?.friendly ||
                    (typeof result.classification === 'object' && result.classification?.friendly) ||
                    []
                  ).join(', ') || '1, 3, 5, 6, 9'}
                </Text>
              </View>
              <View style={styles.classBox}>
                <Text style={styles.classLabel}>❌ ENEMY</Text>
                <Text style={[styles.classVal, { color: ASBColors.errorRed }]}>
                  {(
                    result.classification_numbers?.enemy ||
                    (typeof result.classification === 'object' && result.classification?.enemy) ||
                    []
                  ).join(', ') || '2, 7, 8'}
                </Text>
              </View>
              <View style={styles.classBox}>
                <Text style={styles.classLabel}>⚖️ NEUTRAL</Text>
                <Text style={[styles.classVal, { color: ASBColors.textMuted }]}>
                  {(
                    result.classification_numbers?.neutral ||
                    (typeof result.classification === 'object' && result.classification?.neutral) ||
                    []
                  ).join(', ') || '4'}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Pair Analysis & Bad Combination Warnings */}
          <GlassCard style={styles.detailCard}>
            <View style={styles.detailTitleRow}>
              <ShieldCheck size={18} color={ASBColors.primaryPurple} />
              <Text style={styles.detailTitle}>Digit Combination Analysis</Text>
            </View>

            {/* Structured Decorative Pair Chips */}
            <View style={styles.pairChipsGrid}>
              {parsePairDetails(result.pair_analysis?.pair_details || '').map((item: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.pairChipBox,
                    item.isGood ? styles.pairChipGood : styles.pairChipBad,
                  ]}
                >
                  <View style={styles.pairChipHeader}>
                    {item.isGood ? (
                      <Sparkles size={14} color={ASBColors.goodGreen} />
                    ) : (
                      <AlertTriangle size={14} color={ASBColors.errorRed} />
                    )}
                    <Text style={[styles.pairNumberText, { color: item.isGood ? ASBColors.goodGreen : ASBColors.errorRed }]}>
                      Pair #{item.pair}
                    </Text>
                    <View style={[styles.pairTagBadge, { backgroundColor: item.isGood ? ASBColors.goodGreenBg : '#FEE2E2' }]}>
                      <Text style={[styles.pairTagText, { color: item.isGood ? ASBColors.goodGreen : ASBColors.errorRed }]}>
                        {item.isGood ? 'AUSPICIOUS' : 'CHALLENGING'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.pairMeaningText}>{item.meaning}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          {/* Interpretation */}
          <GlassCard style={styles.detailCard}>
            <Text style={styles.detailTitle}>Cosmic Interpretation</Text>
            <Text style={styles.detailText}>{result.interpretation}</Text>
          </GlassCard>

          {/* Remedies List */}
          {result.remedies?.length > 0 && (
            <GlassCard variant="gold" style={styles.detailCard}>
              <Text style={styles.remedyTitle}>RECOMMENDED REMEDIES</Text>
              {result.remedies.map((remedy: string, idx: number) => (
                <View key={idx} style={styles.remedyItem}>
                  <Sparkles size={14} color={ASBColors.sacredGold} />
                  <Text style={styles.remedyText}>{remedy}</Text>
                </View>
              ))}
            </GlassCard>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ASBColors.bgCream,
  },
  content: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ASBColors.deepNavy,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 12,
    color: ASBColors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  formCard: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.deepNavy,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
    borderRadius: ASBRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: ASBColors.deepNavy,
  },
  resultsContainer: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: ASBColors.deepNavy,
    letterSpacing: 1.5,
    marginVertical: 8,
  },
  meterCard: {
    alignItems: 'center',
  },
  pairChipsGrid: {
    gap: 8,
    marginTop: 6,
  },
  pairChipBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  pairChipGood: {
    backgroundColor: '#F0FDF4',
    borderColor: '#A7F3D0',
  },
  pairChipBad: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  pairChipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pairNumberText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pairTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  pairTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pairMeaningText: {
    fontSize: 12,
    color: ASBColors.darkNavy,
    lineHeight: 17,
  },
  classificationText: {
    fontSize: 14,
    fontWeight: '700',
    color: ASBColors.deepNavy,
    marginTop: 8,
    textAlign: 'center',
  },
  pairRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pairBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: ASBColors.borderIvory,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  pairVal: {
    fontSize: 32,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
  },
  pairLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: ASBColors.textMuted,
    marginTop: 2,
  },
  detailCard: {
    padding: 16,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ASBColors.deepNavy,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: ASBColors.deepNavy,
    lineHeight: 18,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ASBColors.errorRedBg,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  alertText: {
    fontSize: 12,
    color: ASBColors.errorRed,
    fontWeight: '600',
    flex: 1,
  },
  remedyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: ASBColors.sacredGold,
    letterSpacing: 1,
    marginBottom: 8,
  },
  remedyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  remedyText: {
    fontSize: 13,
    color: ASBColors.darkNavy,
    fontWeight: '500',
  },
  classGrid: { flexDirection: 'row', gap: 8, marginTop: 6 },
  classBox: { flex: 1, backgroundColor: '#FAF5FF', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: ASBColors.borderPurple, alignItems: 'center' },
  classLabel: { fontSize: 9, fontWeight: '800', color: ASBColors.darkNavy },
  classVal: { fontSize: 13, fontWeight: '700', marginTop: 4 },
});
