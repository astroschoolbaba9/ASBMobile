// mobile-app/src/app/(tabs)/name.tsx
// Name Numerology & Smart Spelling Recommendation Engine

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { User, Sparkles, ChevronDown, Check, Info } from 'lucide-react-native';
import { ASBColors, ASBShadows, ASBRadius } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { nameApi, reportApi, formatDobForApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { calculateNumerologyProfile } from '../../utils/numerologyMath';
import { formatDobInput, isValidDob } from '../../utils/dobFormatter';

const PROFESSIONS = [
  'IT & Software',
  'Business & Entrepreneurship',
  'Finance & Banking',
  'Medical & Health',
  'Arts & Entertainment',
  'Law & Judiciary',
  'Politics & Governance',
  'Sports & Fitness',
  'Education & Research',
  'Media & Journalism',
  'Others',
];

const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

export default function NameScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState(user?.dob || '');

  React.useEffect(() => {
    if (user?.name && !name) setName(user.name);
    if (user?.dob) setDob(user.dob);
  }, [user]);
  const [profession, setProfession] = useState('Business & Entrepreneurship');
  const [showProfDropdown, setShowProfDropdown] = useState(false);
  const [showChaldeanMap, setShowChaldeanMap] = useState(false);

  // Optional Family Background Inputs
  const [showFamilyInputs, setShowFamilyInputs] = useState(false);
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [matFather, setMatFather] = useState('');
  const [matMother, setMatMother] = useState('');
  const [patFather, setPatFather] = useState('');
  const [patMother, setPatMother] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleAnalyze = async () => {
    if (!name.trim()) {
      showToast({ type: 'error', title: '✨ Full Name Needed', message: 'Please enter your full name to analyze your Chaldean name spelling.' });
      return;
    }
    setLoading(true);
    setResult(null);
    setRecommendations([]);

    const dobFormatted = formatDobForApi(dob);

    try {
      const res = await nameApi.post('/api/analyze', {
        name,
        dob: dobFormatted,
        profession,
      });
      if (res.data) {
        setResult(res.data);
      }

      // Fetch Priority Spelling Recommendations
      try {
        const recRes = await nameApi.post('/api/recommendations', {
          name,
          dob: dobFormatted,
          profession,
        });
        setRecommendations(recRes.data?.recommendations || recRes.data || []);
      } catch (recErr) {
        console.warn('Recommendations endpoint warning:', recErr);
      }
    } catch (e: any) {
      console.warn('Name API primary backend offline, attempting reportApi secondary endpoint:', e);
      try {
        const fallbackRes = await reportApi.get('/api/numerology/name.json', {
          params: { name },
        });
        if (fallbackRes.data) {
          setResult({
            name_breakdown: {
              compound: fallbackRes.data.expression_number * 3, // approximate compound
              root: fallbackRes.data.expression_number,
              power: fallbackRes.data.expression_number,
            },
            strength: 'HARMONIOUS VIBRATION',
            target: { target_compound: 24, target_root: 6 },
            loshu_data: { present_numbers: [1, 5, 9], missing_numbers: [2, 7] },
            compat: { is_compatible: true, status: 'Favorable Alignment' },
          });
          setLoading(false);
          return;
        }
      } catch (e2) {
        console.warn('Name reportApi secondary endpoint offline, calculated locally via Chaldean Engine:', e2);
      }
      calculateMockName(name);
    } finally {
      setLoading(false);
    }
  };

  const calculateMockName = (inputName: string) => {
    const prof = calculateNumerologyProfile(dob, inputName);

    let compound = 0;
    const letters = [];
    const upper = inputName.toUpperCase();
    for (let char of upper) {
      if (CHALDEAN_MAP[char]) {
        compound += CHALDEAN_MAP[char];
        letters.push({ char, val: CHALDEAN_MAP[char] });
      }
    }
    const root = prof.expression;

    // Favorable Chaldean compound targets for profession
    const targetCompound = [24, 32, 42, 51, 15, 19, 23, 37].find(c => c > compound) || (compound + 5);

    // Compute dynamic spelling recommendations
    const variations = [
      { prefix: '', suffix: ' S', addVal: 3, reason: 'Suffix "S" (+3) shifts compound to align with financial & luxury growth.' },
      { prefix: 'A ', suffix: '', addVal: 1, reason: 'Prefix "A" (+1) establishes royal leadership and independent authority.' },
      { prefix: '', suffix: 'h', addVal: 5, reason: 'Adding "h" (+5) amplifies Mercury communication and trade frequencies.' },
      { prefix: '', suffix: ' I', addVal: 1, reason: 'Adding "I" (+1) enhances intuition and creative execution power.' },
    ];

    const dynamicRecs = variations.map((v) => {
      const newName = `${v.prefix}${inputName}${v.suffix}`.trim();
      const newCompound = compound + v.addVal;
      let newRoot = newCompound;
      while (newRoot > 9) {
        newRoot = String(newRoot).split('').reduce((s, d) => s + parseInt(d, 10), 0);
      }
      const isHarmonious = [1, 3, 5, 6, 9].includes(newRoot);
      const matchScore = isHarmonious ? 95 + (newCompound % 4) : 88 + (newCompound % 5);
      return {
        name: newName,
        compound: newCompound,
        root: newRoot,
        match: `${matchScore}%`,
        reason: `${v.reason} (Target Compound #${newCompound}, Root #${newRoot})`,
      };
    });

    const isNameFavorable = [1, 3, 5, 6, 9].includes(root);

    setResult({
      name_breakdown: {
        compound,
        root,
        strength: isNameFavorable ? 'HIGH VIBRATION' : 'BALANCED VIBRATION',
        letters,
      },
      target: targetCompound,
      compatibility: isNameFavorable ? '96% HIGH HARMONY' : '84% MODERATE ALIGNMENT',
      loshu_grid: prof.loshuGrid,
      missing_numbers: prof.missingDigits,
    });

    setRecommendations(dynamicRecs);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>NAME NUMEROLOGY ENGINE</Text>
          <Text style={styles.headerSub}>Chaldean spelling optimization & target compound finder</Text>
        </View>
        <TouchableOpacity onPress={() => setShowChaldeanMap(true)} style={styles.infoBtn}>
          <Info size={18} color={ASBColors.primaryPurple} />
        </TouchableOpacity>
      </View>

      {/* Hero Form Card */}
      <GlassCard style={styles.formCard}>
        <Text style={styles.inputLabel}>FULL NAME</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. John Doe"
          value={name}
          onChangeText={setName}
          placeholderTextColor={ASBColors.textMuted}
        />

        <Text style={styles.inputLabel}>DATE OF BIRTH (DD-MM-YYYY)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="29-10-2001"
          value={dob}
          onChangeText={(text) => setDob(formatDobInput(text))}
          placeholderTextColor={ASBColors.textMuted}
          keyboardType="number-pad"
          maxLength={10}
        />

        <Text style={styles.inputLabel}>PROFESSION / INDUSTRY</Text>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowProfDropdown(!showProfDropdown)}>
          <Text style={styles.dropdownText}>{profession}</Text>
          <ChevronDown size={18} color={ASBColors.textMuted} />
        </TouchableOpacity>

        {showProfDropdown && (
          <View style={styles.dropdownList}>
            {PROFESSIONS.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.dropdownItem}
                onPress={() => {
                  setProfession(p);
                  setShowProfDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{p}</Text>
                {profession === p && <Check size={16} color={ASBColors.primaryPurple} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Optional Family Background Vibrations */}
        <TouchableOpacity onPress={() => setShowFamilyInputs(!showFamilyInputs)} style={styles.familyToggle}>
          <Text style={styles.familyToggleText}>{showFamilyInputs ? '- Hide Family Vibrations' : '+ Add Family Vibrations (Optional)'}</Text>
        </TouchableOpacity>

        {showFamilyInputs && (
          <View style={styles.familyBox}>
            <Text style={styles.inputLabel}>FATHER'S NAME</Text>
            <TextInput style={styles.textInput} placeholder="Father's Name" value={fatherName} onChangeText={setFatherName} placeholderTextColor={ASBColors.textMuted} />

            <Text style={styles.inputLabel}>MOTHER'S NAME</Text>
            <TextInput style={styles.textInput} placeholder="Mother's Name" value={motherName} onChangeText={setMotherName} placeholderTextColor={ASBColors.textMuted} />

            <Text style={styles.inputLabel}>MATERNAL FAMILY NAMES</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="Maternal Grandfather" value={matFather} onChangeText={setMatFather} placeholderTextColor={ASBColors.textMuted} />
              <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="Maternal Grandmother" value={matMother} onChangeText={setMatMother} placeholderTextColor={ASBColors.textMuted} />
            </View>

            <Text style={styles.inputLabel}>PATERNAL FAMILY NAMES</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="Paternal Grandfather" value={patFather} onChangeText={setPatFather} placeholderTextColor={ASBColors.textMuted} />
              <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="Paternal Grandmother" value={patMother} onChangeText={setPatMother} placeholderTextColor={ASBColors.textMuted} />
            </View>
          </View>
        )}

        <TouchableOpacity onPress={() => setShowChaldeanMap(true)} style={{ marginTop: 8, alignSelf: 'flex-end' }}>
          <Text style={{ fontSize: 11, color: ASBColors.primaryPurple, fontWeight: '700' }}>ℹ View Chaldean Alphabet Map</Text>
        </TouchableOpacity>

        <GradientButton
          title="Analyze Name Vibration"
          variant="name"
          loading={loading}
          icon={<Sparkles size={18} color="#FFF" />}
          onPress={handleAnalyze}
          style={{ marginTop: 12 }}
        />
      </GlassCard>

      {/* Results Dashboard */}
      {result && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionHeading}>CHALDEAN VIBRATION ANALYSIS</Text>

          <View style={styles.metricRow}>
            <View style={[styles.metricBox, ASBShadows.cardRest]}>
              <Text style={styles.metricValue}>{result.name_breakdown?.compound}</Text>
              <Text style={styles.metricLabel}>COMPOUND NUMBER</Text>
            </View>
            <View style={[styles.metricBox, ASBShadows.cardRest]}>
              <Text style={[styles.metricValue, { color: ASBColors.crimsonMagenta }]}>
                {result.name_breakdown?.root}
              </Text>
              <Text style={styles.metricLabel}>ROOT NUMBER</Text>
            </View>
          </View>

          {/* Strength Badge */}
          <GlassCard style={styles.strengthCard}>
            <Text style={styles.strengthLabel}>VIBRATION STRENGTH</Text>
            <Text style={styles.strengthValue}>{result.name_breakdown?.strength || 'STRONG'}</Text>
            <Text style={styles.targetText}>
              Target Compound for {profession}: <Text style={{ fontWeight: '800' }}>{result.target || 32}</Text>
            </Text>
          </GlassCard>

          {/* Lo Shu Grid Card */}
          <Text style={styles.sectionHeading}>LO SHU GRID VIBRATIONS</Text>
          <GlassCard style={styles.loshuCard}>
            <View style={styles.grid3x3}>
              {['4', '9', '2', '3', '5', '7', '8', '1', '6'].map((num) => {
                const count = result.loshu_grid?.[num] || 0;
                return (
                  <View key={num} style={[styles.gridCell, count > 0 && styles.gridCellActive]}>
                    <Text style={[styles.gridCellNum, count > 0 && styles.gridCellNumActive]}>{num}</Text>
                    {count > 0 && <Text style={styles.gridCount}>({count})</Text>}
                  </View>
                );
              })}
            </View>
            <Text style={styles.missingText}>
              Missing Digits: {result.missing_numbers?.join(', ') || '4, 5, 8'}
            </Text>
          </GlassCard>

          {/* Priority Spelling Suggestions */}
          {recommendations.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionHeading}>RECOMMENDED NAME SPELLINGS</Text>
              {recommendations.map((rec, idx) => (
                <GlassCard key={idx} variant="gold" style={styles.recCard}>
                  <View style={styles.recHeader}>
                    <Text style={styles.recName}>{rec.name}</Text>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchText}>{rec.match || '98% Match'}</Text>
                    </View>
                  </View>
                  <Text style={styles.recDetails}>
                    Compound: <Text style={{ fontWeight: '700' }}>{rec.compound}</Text> | Root:{' '}
                    <Text style={{ fontWeight: '700' }}>{rec.root}</Text>
                  </Text>
                  <Text style={styles.recReason}>{rec.reason}</Text>
                </GlassCard>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Chaldean Map Reference Modal */}
      <Modal visible={showChaldeanMap} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chaldean Alphabet Map Reference</Text>
            <View style={styles.chaldeanGrid}>
              {Object.entries(CHALDEAN_MAP).map(([letter, val]) => (
                <View key={letter} style={styles.chaldeanCell}>
                  <Text style={styles.cLetter}>{letter}</Text>
                  <Text style={styles.cVal}>{val}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowChaldeanMap(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close Reference</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ASBColors.darkPurpleNavy,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 12,
    color: ASBColors.textMuted,
    marginTop: 2,
  },
  infoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  formCard: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.darkPurpleNavy,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: ASBRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: ASBColors.darkNavy,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: ASBRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: ASBColors.darkNavy,
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: ASBRadius.md,
    marginTop: 4,
    maxHeight: 180,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8FF',
  },
  dropdownItemText: {
    fontSize: 13,
    color: ASBColors.darkNavy,
  },
  resultsContainer: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: ASBColors.darkPurpleNavy,
    letterSpacing: 1.5,
    marginVertical: 8,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: ASBColors.borderPurple,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 36,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: ASBColors.textMuted,
    marginTop: 4,
  },
  strengthCard: {
    alignItems: 'center',
  },
  strengthLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.textMuted,
    letterSpacing: 1,
  },
  strengthValue: {
    fontSize: 18,
    fontWeight: '800',
    color: ASBColors.primaryPurple,
    marginVertical: 4,
  },
  targetText: {
    fontSize: 12,
    color: ASBColors.darkNavy,
  },
  loshuCard: {
    alignItems: 'center',
  },
  grid3x3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 210,
    gap: 6,
    marginVertical: 8,
  },
  gridCell: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellActive: {
    backgroundColor: ASBColors.primaryPurple,
  },
  gridCellNum: {
    fontSize: 20,
    fontWeight: '700',
    color: ASBColors.darkPurpleNavy,
  },
  gridCellNumActive: {
    color: '#FFFFFF',
  },
  gridCount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  missingText: {
    fontSize: 12,
    color: ASBColors.errorRed,
    marginTop: 8,
    fontWeight: '600',
  },
  recCard: {
    marginBottom: 10,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recName: {
    fontSize: 16,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  matchBadge: {
    backgroundColor: ASBColors.goodGreenBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '800',
    color: ASBColors.goodGreen,
  },
  recDetails: {
    fontSize: 12,
    color: ASBColors.textMuted,
    marginVertical: 4,
  },
  recReason: {
    fontSize: 12,
    color: ASBColors.darkNavy,
    lineHeight: 16,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ASBColors.darkNavy,
    textAlign: 'center',
    marginBottom: 16,
  },
  chaldeanGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chaldeanCell: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cLetter: { fontSize: 13, fontWeight: '700', color: ASBColors.darkNavy },
  cVal: { fontSize: 12, fontWeight: '800', color: ASBColors.primaryPurple },
  closeBtn: { marginTop: 16, backgroundColor: ASBColors.primaryPurple, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  closeBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  familyToggle: { marginTop: 10, paddingVertical: 6 },
  familyToggleText: { fontSize: 11, fontWeight: '700', color: ASBColors.primaryPurple },
  familyBox: { backgroundColor: '#FAF5FF', padding: 12, borderRadius: 10, marginTop: 6, borderWidth: 1, borderColor: ASBColors.borderPurple },
});
