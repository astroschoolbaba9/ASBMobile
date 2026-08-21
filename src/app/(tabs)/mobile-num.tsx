import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { Smartphone, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { ASBColors, ASBShadows, ASBRadius } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { CircularScoreMeter } from '../../components/common/CircularScoreMeter';
import { mobileApi, formatDobForApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDobInput } from '../../utils/dobFormatter';
import { getGuestProfile, saveGuestProfile } from '../../utils/guestStorage';
import {
  getDynamicNumberClassification,
  PAIR_DATA,
  CRYSTAL_REMEDIES,
  NUMBER_RELATIONS
} from '../../utils/numerologyMath';

const extractMobilePairs = (mobileNumber: string) => {
  const clean = mobileNumber.replace(/\D/g, '').replace(/0/g, '');
  const pairMap = new Map<string, { pair: string; type: 'Good' | 'Bad' | 'Neutral'; meaning: string; count: number }>();

  for (let i = 0; i < clean.length - 1; i++) {
    const pair = clean.slice(i, i + 2);
    // Neglect double numbers (11, 22, 33, 44, 55, 66, 77, 88, 99)
    if (pair.length === 2 && pair[0] === pair[1]) {
      continue;
    }

    const info = PAIR_DATA[pair] || { type: 'Neutral', meaning: 'Balanced vibration' };
    if (pairMap.has(pair)) {
      pairMap.get(pair)!.count += 1;
    } else {
      pairMap.set(pair, {
        pair,
        type: info.type,
        meaning: info.meaning,
        count: 1,
      });
    }
  }
  return Array.from(pairMap.values());
};

export default function MobileNumScreen() {
  const { user, updateProfile } = useAuth();
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
    if (user?.name) setName(user.name);
    if (user?.dob) setDob(user.dob);
    if (user?.phone && !mobile) setMobile(user.phone);
    if (!user) {
      getGuestProfile().then((g) => {
        if (g.name && !name) setName(g.name);
        if (g.dob && !dob) setDob(g.dob);
      });
    }
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

    saveGuestProfile(name.trim(), dob.trim());
    updateProfile({ name: name.trim(), dob: dob.trim() });
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
        const parsedPairs = extractMobilePairs(mobile);
        const totalParsed = parsedPairs.reduce((sum: number, p: any) => sum + (p.count || 1), 0) || 1;
        const goodParsed = parsedPairs.filter((p: any) => p.type === 'Good').reduce((sum: number, p: any) => sum + (p.count || 1), 0);
        const badParsed = parsedPairs.filter((p: any) => p.type === 'Bad').reduce((sum: number, p: any) => sum + (p.count || 1), 0);
        const badPairs = parsedPairs.filter((p: any) => p.type === 'Bad').map((p: any) => `${p.pair}${p.count > 1 ? ` (x${p.count})` : ''} (${p.meaning})`);
        const detailsText = parsedPairs.map((p: any) => `${p.pair}${p.count > 1 ? ` (x${p.count})` : ''} [${p.type}]: ${p.meaning}`).join(' • ');

        const calculatedScore = totalParsed > 0 ? Math.round((goodParsed / totalParsed) * 100) : 100;
        const verdict = raw.final_result || (calculatedScore >= 80 ? 'HARMONIOUS VIBRATION' : calculatedScore >= 60 ? 'MODERATE HARMONY' : 'CHALLENGING VIBRATION');

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

        const dynamicInterpretation = goodParsed >= badParsed
          ? `Your mobile number generates a Harmonious Vibration (Score: ${calculatedScore}%). A majority (${goodParsed} of ${totalParsed}) of your digit combinations are favorable, supporting positive communication, personal vitality, and auspicious wealth flow.`
          : `Your mobile number generates a Challenging Vibration (Score: ${calculatedScore}%). A majority (${badParsed} of ${totalParsed}) of digit combinations show potential conflict. Applying recommended remedies is advised to harmonize vibrations.`;

        const refMoolank = raw.moolank || 1;
        const classificationObj = raw.classification_numbers || (typeof raw.classification === 'object' ? raw.classification : getDynamicNumberClassification(refMoolank));

        setResult({
          ...raw,
          classification_numbers: classificationObj,
          pair_analysis: {
            score: calculatedScore,
            verdict,
            bad_combinations: badPairs,
            pair_details: detailsText,
          },
          interpretation: dynamicInterpretation,
          remedies: remediesList.length > 0 ? remediesList : ['Keep phone wallpaper in favorable colors', 'Avoid keeping phone under pillow while sleeping'],
        });
      } else {
        calculateLocalMobileResult();
      }
    } catch (e) {
      calculateLocalMobileResult();
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalMobileResult = () => {
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
    let moolank = moolankRaw;
    while (moolank > 9) {
      moolank = String(moolank).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    }
    const bhagyankRaw = dobDigits.split('').reduce((s, d) => s + parseInt(d, 10), 0);
    let bhagyank = bhagyankRaw;
    while (bhagyank > 9) {
      bhagyank = String(bhagyank).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    }

    const parsedPairs = extractMobilePairs(mobile);
    const totalParsed = parsedPairs.reduce((sum: number, p: any) => sum + (p.count || 1), 0) || 1;
    const goodParsed = parsedPairs.filter((p: any) => p.type === 'Good').reduce((sum: number, p: any) => sum + (p.count || 1), 0);
    const badParsed = parsedPairs.filter((p: any) => p.type === 'Bad').reduce((sum: number, p: any) => sum + (p.count || 1), 0);
    const badPairs = parsedPairs.filter((p: any) => p.type === 'Bad').map((p: any) => `${p.pair}${p.count > 1 ? ` (x${p.count})` : ''} (${p.meaning})`);
    const detailsText = parsedPairs.map((p: any) => `${p.pair}${p.count > 1 ? ` (x${p.count})` : ''} [${p.type}]: ${p.meaning}`).join(' • ');

    const score = Math.round((goodParsed / totalParsed) * 100);
    const verdict = score >= 80 ? 'HARMONIOUS VIBRATION' : score >= 60 ? 'MODERATE HARMONY' : 'CHALLENGING VIBRATION';

    const refMoolank = moolank || 1;
    const classificationObj = getDynamicNumberClassification(refMoolank);

    setResult({
      client_info: { name, dob, mobile_number: mobile },
      moolank: refMoolank,
      bhagyank: bhagyank || 5,
      power_number: powerNumber,
      classification: `Power Number #${powerNumber} Energy Alignment`,
      classification_numbers: classificationObj,
      pair_analysis: {
        score,
        verdict,
        bad_combinations: badPairs,
        pair_details: detailsText,
      },
      interpretation: goodParsed >= badParsed
        ? `Your mobile number sums to Power Number #${powerNumber} and generates a Harmonious Vibration (Score: ${score}%). A majority (${goodParsed} of ${totalParsed}) of non-zero digit combinations are favorable, promoting clear communications and wealth flow.`
        : `Your mobile number sums to Power Number #${powerNumber} and generates a Challenging Vibration (Score: ${score}%). A majority (${badParsed} of ${totalParsed}) of digit combinations present potential conflicts. Applying remedies is advised.`,
      remedies: [
        `Healing Crystal: ${CRYSTAL_REMEDIES[refMoolank] || 'Clear Quartz'}`,
        `Keep phone wallpaper in favorable colors for Power Number ${powerNumber}`,
        'Avoid keeping phone under pillow while sleeping',
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
              {result.pair_analysis?.verdict || 'HARMONIOUS'} VIBRATION (POWER #{result.power_number || 1})
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
            <Text style={styles.detailTitle}>Number Classification (Driver #{result.moolank || 1})</Text>
            <View style={styles.classGrid}>
              <View style={styles.classBox}>
                <Text style={styles.classLabel}>✅ FRIENDLY</Text>
                <Text style={[styles.classVal, { color: ASBColors.goodGreen }]}>
                  {result.classification_numbers?.friendly?.length > 0
                    ? result.classification_numbers.friendly.join(', ')
                    : 'None'}
                </Text>
              </View>
              <View style={styles.classBox}>
                <Text style={styles.classLabel}>❌ ENEMY</Text>
                <Text style={[styles.classVal, { color: ASBColors.errorRed }]}>
                  {result.classification_numbers?.enemy?.length > 0
                    ? result.classification_numbers.enemy.join(', ')
                    : 'None'}
                </Text>
              </View>
              <View style={styles.classBox}>
                <Text style={styles.classLabel}>⚖️ NEUTRAL</Text>
                <Text style={[styles.classVal, { color: ASBColors.textMuted }]}>
                  {result.classification_numbers?.neutral?.length > 0
                    ? result.classification_numbers.neutral.join(', ')
                    : 'None'}
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
              {extractMobilePairs(mobile || result?.client_info?.mobile_number || '').map((item: any, idx: number) => {
                const isGood = item.type === 'Good';
                const isBad = item.type === 'Bad';
                const tagBg = isGood ? ASBColors.goodGreenBg : isBad ? '#FEE2E2' : '#FEF3C7';
                const tagColor = isGood ? ASBColors.goodGreen : isBad ? ASBColors.errorRed : '#D97706';

                return (
                  <View
                    key={idx}
                    style={[
                      styles.pairChipBox,
                      isGood ? styles.pairChipGood : isBad ? styles.pairChipBad : styles.pairChipNeutral,
                    ]}
                  >
                    <View style={styles.pairChipHeader}>
                      {isGood ? (
                        <Sparkles size={14} color={ASBColors.goodGreen} />
                      ) : isBad ? (
                        <AlertTriangle size={14} color={ASBColors.errorRed} />
                      ) : (
                        <Sparkles size={14} color="#D97706" />
                      )}
                      <Text style={[styles.pairNumberText, { color: tagColor }]}>
                        Pair #{item.pair}{item.count > 1 ? ` (x${item.count})` : ''}
                      </Text>
                      <View style={[styles.pairTagBadge, { backgroundColor: tagBg }]}>
                        <Text style={[styles.pairTagText, { color: tagColor }]}>
                          {isGood ? 'GOOD' : isBad ? 'CHALLENGING' : 'NEUTRAL'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.pairMeaningText}>{item.meaning}</Text>
                  </View>
                );
              })}
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
  pairChipNeutral: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
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
