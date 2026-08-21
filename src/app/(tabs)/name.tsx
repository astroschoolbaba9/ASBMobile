// mobile-app/src/app/(tabs)/name.tsx
// Name Numerology & Smart Spelling Recommendation Engine

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Sparkles, ChevronDown, Check, Info, Copy } from 'lucide-react-native';
import { ASBColors, ASBShadows, ASBRadius } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { nameApi, reportApi, crystalApi, formatDobForApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { calculateNumerologyProfile } from '../../utils/numerologyMath';
import { formatDobInput, isValidDob } from '../../utils/dobFormatter';
import { generateLocalRecommendations } from '../../utils/chaldeanRecommendations';

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

const PROFESSION_MAP: Record<string, string> = {
  'IT & Software': 'business',
  'Business & Entrepreneurship': 'business',
  'Finance & Banking': 'business',
  'Medical & Health': 'doctor',
  'Arts & Entertainment': 'artist',
  'Law & Judiciary': 'politician',
  'Politics & Governance': 'politician',
  'Sports & Fitness': 'others',
  'Education & Research': 'teacher',
  'Media & Journalism': 'artist',
  'Others': 'others',
};

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

const CHALDEAN_COMPOUND_MEANINGS: Record<number, string> = {
  10: 'The Wheel of Fortune — Honor, faith, and self-confidence.',
  11: 'A Lion Muzzled — Hidden warnings, high intuition, spiritual trials.',
  12: 'The Sacrifice — Educational lessons, introspection, deep knowledge.',
  13: 'Transformation & Power — Shift in plans, sudden renewal.',
  14: 'Movement & Business — Trade, travel, magnetic financial luck.',
  15: 'The Magician of Venus — Eloquence, charm, luxury attraction.',
  16: 'The Shattered Citadel — Unexpected warnings, spiritual awakening.',
  17: 'The Star of the Magi — High spiritual luck, lasting fame.',
  18: 'Material vs Spiritual Conflict — Strong courage, legal caution.',
  19: 'The Prince of Heaven — Ultimate success, honor, happiness.',
  20: 'The Awakening — Higher purpose, renewed ambition.',
  21: 'The Crown of the Magi — Universal advancement, total victory.',
  22: 'The Sacred Vision — High responsibility, master builder.',
  23: 'The Royal Star of the Lion — Divine protection, professional success.',
  24: 'Financial Growth & Protection — Help from high authority, wealth luck.',
  25: 'Wisdom Through Experience — Creative analysis, technical success.',
  26: 'Partnership Caution — Financial foresight required, long-term gain.',
  27: 'The Scepter of Command — High intelligence, leadership, authority.',
  28: 'Trusting Caution — Great potential requiring balanced judgment.',
  29: 'Grace Under Trial — Strong intuition, perseverance required.',
  30: 'Luminous Mind — Intellectual mastery, artistic success.',
  31: 'Self-Reliant Thinker — Independent path, high focus.',
  32: 'International Fame — Communication power, public applause.',
  33: 'Spiritual Teacher — Universal love, public blessing.',
  37: 'Royal Friendship — Good luck in partnerships and trade.',
  42: 'Creative Abundance — Artistic fame and financial stability.',
  51: 'High Military / Executive Power — Unstoppable ambition.',
};

const formatNameWords = (inputName: string, rawLetters: any[]) => {
  const words = inputName.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [{ word: '', letters: rawLetters || [] }];

  let letterIdx = 0;
  return words.map((word) => {
    const wordLetters: any[] = [];
    for (let i = 0; i < word.length; i++) {
      if (rawLetters && letterIdx < rawLetters.length) {
        wordLetters.push(rawLetters[letterIdx]);
        letterIdx++;
      } else {
        const char = word[i].toUpperCase();
        wordLetters.push({ char, val: CHALDEAN_MAP[char] || 1 });
      }
    }
    return { word, letters: wordLetters };
  });
};

import { getGuestProfile, saveGuestProfile } from '../../utils/guestStorage';

export default function NameScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState(user?.dob || '');

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  React.useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.dob) setDob(user.dob);
    if (!user) {
      getGuestProfile().then((g) => {
        if (g.name && !name) setName(g.name);
        if (g.dob && !dob) setDob(g.dob);
      });
    }
  }, [user]);

  const handleCopyName = (suggestedName: string) => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(suggestedName);
      } else {
        const RN = require('react-native');
        if (RN.Clipboard && typeof RN.Clipboard.setString === 'function') {
          RN.Clipboard.setString(suggestedName);
        }
      }
    } catch (e) { }
    showToast({
      type: 'success',
      title: '✨ Name Copied!',
      message: `"${suggestedName}" copied to clipboard.`,
    });
  };
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
  const [showRecsModal, setShowRecsModal] = useState(false);

  const handleAnalyze = async () => {
    if (!name.trim()) {
      showToast({ type: 'error', title: '✨ Full Name Required', message: 'Please enter your full name to analyze your Chaldean name spelling.' });
      return;
    }
    if (!dob || !dob.trim() || dob.trim().length < 8) {
      showToast({ type: 'error', title: '📅 Date of Birth Required', message: 'Please enter your Date of Birth (DD-MM-YYYY) to analyze your birth chart.' });
      return;
    }
    saveGuestProfile(name.trim(), dob.trim());
    updateProfile({ name: name.trim(), dob: dob.trim() });
    setLoading(true);
    setResult(null);
    setRecommendations([]);
    setShowRecsModal(false);

    const dobFormatted = formatDobForApi(dob);

    try {
      const mappedProfession = PROFESSION_MAP[profession] || 'others';
      // 1. Try Real Flask Name Numerology Backend API with graceful fallbacks
      const analyzeRes = await nameApi.post('/api/analyze', {
        name: name.trim(),
        dob: dobFormatted,
        profession: mappedProfession,
        father_name: fatherName.trim() || undefined,
        mother_name: motherName.trim() || undefined,
        maternal_father_name: matFather.trim() || undefined,
        maternal_mother_name: matMother.trim() || undefined,
        paternal_father_name: patFather.trim() || undefined,
        paternal_mother_name: patMother.trim() || undefined,
      }).catch((err: any) => {
        console.log('=== /api/analyze FAILED ===', err?.message, 'status:', err?.response?.status, 'data:', JSON.stringify(err?.response?.data)?.substring(0, 200));
        return null;
      });
      const recRes = await nameApi.post('/api/recommendations', {
        name: name.trim(),
        dob: dobFormatted,
        profession: mappedProfession,
        father_name: fatherName.trim() || undefined,
        mother_name: motherName.trim() || undefined,
        maternal_father_name: matFather.trim() || undefined,
        maternal_mother_name: matMother.trim() || undefined,
        paternal_father_name: patFather.trim() || undefined,
        paternal_mother_name: patMother.trim() || undefined,
      }).catch((err: any) => {
        console.log('=== /api/recommendations FAILED ===', err?.message, 'status:', err?.response?.status, 'data:', JSON.stringify(err?.response?.data)?.substring(0, 200));
        return null;
      });

      const mb = computeMulyankBhagyank(dob);

      if (analyzeRes && analyzeRes.data) {
        const raw = analyzeRes.data;
        const rawNb = raw.name_breakdown || raw.name_result || {};
        const rawLetters = rawNb.letters || raw.letters || [];
        const letters = (rawLetters.length > 0 ? rawLetters : computeLetterBreakdown(name.trim())).map((l: any) => ({
          char: l.letter || l.char,
          val: l.val || l.value
        }));

        const calcCompound = rawNb.compound ?? raw.compound_number ?? raw.compound ?? letters.reduce((sum: number, item: any) => sum + (item.val || 0), 0);
        let calcRoot = rawNb.root ?? raw.root_number ?? raw.root;
        if (calcRoot === undefined || calcRoot === null) {
          calcRoot = calcCompound;
          while (calcRoot > 9 && calcRoot !== 11 && calcRoot !== 22 && calcRoot !== 33) {
            calcRoot = String(calcRoot).split('').reduce((s: number, d: string) => s + parseInt(d, 10), 0);
          }
        }

        setResult({
          mulyank: raw.dob_numbers?.driver || mb.mulyank,
          bhagyank: raw.dob_numbers?.destiny || mb.bhagyank,
          dob_numbers: raw.dob_numbers || { driver: mb.mulyank, destiny: mb.bhagyank },
          name_breakdown: {
            compound: calcCompound,
            root: calcRoot,
            strength: rawNb.strength || raw.strength || computeRealStrength(calcCompound),
            letters,
          },
          target: raw.target || raw.target_compound || computeRealTarget(calcCompound, profession),
          compatibility: raw.compatibility || computeRealCompatibility(calcRoot, mb.mulyank, mb.bhagyank),
          loshu_grid: raw.loshu_grid || {},
          missing_numbers: raw.missing_numbers || [],
        });
      } else {
        calculateLocalNameResult(name.trim());
      }

      // Try to extract recommendations from backend response
      let parsedRecs = extractRecommendations(recRes?.data);
      if (parsedRecs.length === 0) {
        parsedRecs = extractRecommendations(analyzeRes?.data);
      }

      // If backend returned nothing (API down/unreachable), run the SAME real
      // Chaldean math locally — identical algorithm to Python numerology_engine.py
      if (parsedRecs.length === 0) {
        console.log('Backend returned no recommendations — running local Chaldean engine');
        parsedRecs = generateLocalRecommendations(name.trim(), dobFormatted, mappedProfession);
      }

      console.log('FINAL recommendations count:', parsedRecs.length);
      setRecommendations(parsedRecs);
    } catch (e: any) {
      console.log('=== BACKEND ERROR ===', e?.message, e?.response?.status, JSON.stringify(e?.response?.data)?.substring(0, 300));
      calculateLocalNameResult(name.trim());
    } finally {
      setLoading(false);
    }
  };

  const extractRecommendations = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    const target = data.recommendations !== undefined ? data.recommendations : data;

    if (Array.isArray(target)) return target;

    if (typeof target === 'object' && target !== null) {
      const items: any[] = [];
      if (target.best && typeof target.best === 'object') items.push(target.best);

      const p1 = target.priority_1 || data.priority_1 || [];
      const p2 = target.priority_2 || data.priority_2 || [];
      const p3 = target.priority_3 || data.priority_3 || [];
      const p4 = target.priority_4 || data.priority_4 || [];

      const rawCombined = [...items, ...p1, ...p2, ...p3, ...p4];
      const seen = new Set<string>();
      const combined: any[] = [];

      for (const item of rawCombined) {
        const n = (typeof item === 'string' ? item : item.name || item.spelling || '').trim().toLowerCase();
        if (n && !seen.has(n)) {
          seen.add(n);
          combined.push(item);
        }
      }

      if (combined.length > 0) return combined;
    }
    return [];
  };

  const computeMulyankBhagyank = (dobStr: string) => {
    const digits = dobStr.replace(/\D/g, '');
    if (!digits) return { mulyank: 2, bhagyank: 3 };

    let dayDigits = '';
    const parts = dobStr.trim().split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        dayDigits = parts[2];
      } else {
        dayDigits = parts[0];
      }
    } else {
      dayDigits = digits.substring(0, 2);
    }

    let mulyank = dayDigits.split('').reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);
    while (mulyank > 9) {
      mulyank = String(mulyank).split('').reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);
    }

    let bhagyank = digits.split('').reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);
    while (bhagyank > 9) {
      bhagyank = String(bhagyank).split('').reduce((acc, curr) => acc + (parseInt(curr, 10) || 0), 0);
    }

    return { mulyank, bhagyank };
  };

  const computeLetterBreakdown = (inputName: string) => {
    const letters = [];
    for (let char of inputName.toUpperCase()) {
      if (CHALDEAN_MAP[char]) {
        letters.push({ char, val: CHALDEAN_MAP[char] });
      }
    }
    return letters;
  };

  const computeRealStrength = (compound: number): string => {
    const STRONG = [14, 19, 23, 32, 37, 41, 46];
    const MEDIUM = [10, 11, 15, 21, 24, 33, 42];
    if (STRONG.includes(compound)) return 'Strong';
    if (MEDIUM.includes(compound)) return 'Medium';
    return 'Weak';
  };

  const computeRealTarget = (compound: number, _profStr: string): number => {
    const STRONG = [14, 19, 23, 32, 37, 41, 46];
    return STRONG.reduce((closest, num) => Math.abs(num - compound) < Math.abs(closest - compound) ? num : closest, STRONG[0]);
  };

  const computeRealCompatibility = (root: number, driver: number, destiny: number): string => {
    const ENEMY_PAIRS = [[1, 8], [3, 6]];
    const FRIENDLY_GROUPS = [
      new Set([1, 2, 3]), new Set([4, 5, 6]), new Set([7, 8, 9]),
      new Set([1, 4, 7]), new Set([2, 5, 8]), new Set([3, 6, 9]),
    ];
    const MASTER = [11, 22, 33];

    if (root === driver && driver === destiny) {
      return MASTER.includes(root) ? 'Excellent (Master Alignment)' : 'Excellent';
    }

    for (const [a, b] of ENEMY_PAIRS) {
      if ((a === root && (b === driver || b === destiny)) || (b === root && (a === driver || a === destiny))) {
        return 'Poor';
      }
    }

    let score = 0;
    if (root === driver || root === destiny || driver === destiny) score += 5;
    for (const g of FRIENDLY_GROUPS) {
      if (g.has(root) && g.has(driver)) score += 3;
      if (g.has(root) && g.has(destiny)) score += 3;
      if (g.has(driver) && g.has(destiny)) score += 2;
    }
    for (const [a, b] of ENEMY_PAIRS) {
      if ((a === driver && b === destiny) || (b === driver && a === destiny)) score -= 2;
    }
    if (MASTER.includes(root)) score += (MASTER.includes(driver) || MASTER.includes(destiny)) ? 4 : 2;

    if (score >= 8) return 'Excellent';
    if (score >= 4) return 'Good';
    if (score >= 0) return 'Average';
    return 'Poor';
  };

  const calculateLocalNameResult = (inputName: string) => {
    const prof = calculateNumerologyProfile(dob, inputName);
    const mb = computeMulyankBhagyank(dob);

    let compound = 0;
    const letters = computeLetterBreakdown(inputName);
    for (let item of letters) {
      compound += item.val;
    }
    let root = compound;
    while (root > 9 && root !== 11 && root !== 22 && root !== 33) {
      root = String(root).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    }

    const targetCompound = computeRealTarget(compound, profession);
    const strengthStr = computeRealStrength(compound);
    const compatStr = computeRealCompatibility(root, mb.mulyank, mb.bhagyank);

    setResult({
      mulyank: mb.mulyank,
      bhagyank: mb.bhagyank,
      dob_numbers: { driver: mb.mulyank, destiny: mb.bhagyank },
      name_breakdown: {
        compound,
        root,
        strength: strengthStr,
        letters,
      },
      target: targetCompound,
      compatibility: compatStr,
      loshu_grid: prof.loshuGrid,
      missing_numbers: prof.missingDigits,
    });
    // Run the same real Chaldean math locally for recommendations
    const dobFormatted = formatDobForApi(dob);
    const mappedProfession = PROFESSION_MAP[profession] || 'others';
    const localRecs = generateLocalRecommendations(inputName, dobFormatted, mappedProfession);
    setRecommendations(localRecs);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={ASBColors.primaryPurple} />
      }
    >
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
          <ScrollView
            style={styles.dropdownList}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
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
          </ScrollView>
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
          {/* Letter by Letter Chaldean Value Grid with Preserved Word Spaces */}
          {Array.isArray(result.name_breakdown?.letters) && result.name_breakdown.letters.length > 0 && (
            <GlassCard style={styles.letterBreakdownCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                <Text style={styles.letterCardTitle}>CHALDEAN LETTER BREAKDOWN</Text>
                <View style={{ backgroundColor: '#F3E8FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: ASBColors.primaryPurple }}>
                    Total: #{result.name_breakdown?.compound || result.name_breakdown.letters.reduce((acc: number, l: any) => acc + (l.val || 0), 0)}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: ASBColors.darkNavy }}>
                    (Vibration #{result.name_breakdown?.root || 0})
                  </Text>
                </View>
              </View>

              <View style={styles.wordsWrapRow}>
                {formatNameWords(name.trim(), result.name_breakdown.letters).map((wordObj: any, wIdx: number) => {
                  const wordSum = wordObj.letters.reduce((acc: number, l: any) => acc + (l.val || 0), 0);
                  return (
                    <View key={wIdx} style={styles.wordBlock}>
                      <View style={styles.letterGridRow}>
                        {wordObj.letters.map((item: any, idx: number) => (
                          <View key={idx} style={styles.letterChip}>
                            <Text style={styles.letterChar}>{item.char}</Text>
                            <View style={styles.letterValBadge}>
                              <Text style={styles.letterValText}>{item.val}</Text>
                            </View>
                          </View>
                        ))}
                        <View style={[styles.letterChip, { backgroundColor: '#F3E8FF', borderColor: ASBColors.primaryPurple }]}>
                          <Text style={[styles.letterChar, { fontSize: 10, color: ASBColors.primaryPurple }]}>SUM</Text>
                          <View style={[styles.letterValBadge, { backgroundColor: ASBColors.primaryPurple }]}>
                            <Text style={[styles.letterValText, { color: '#FFF' }]}>{wordSum}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          )}

          <View style={styles.metricRow}>
            <View style={[styles.metricBox, ASBShadows.cardRest] as any}>
              <Text style={styles.metricValue}>
                {result.mulyank || result.dob_numbers?.driver || computeMulyankBhagyank(dob).mulyank}
              </Text>
              <Text style={styles.metricLabel}>MULYANK (DRIVER)</Text>
            </View>
            <View style={[styles.metricBox, ASBShadows.cardRest] as any}>
              <Text style={[styles.metricValue, { color: ASBColors.crimsonMagenta }]}>
                {result.bhagyank || result.dob_numbers?.destiny || computeMulyankBhagyank(dob).bhagyank}
              </Text>
              <Text style={styles.metricLabel}>BHAGYANK (DESTINY)</Text>
            </View>
          </View>

          {/* Strength Badge */}
          <GlassCard style={styles.strengthCard}>
            <Text style={styles.strengthLabel}>VIBRATION STRENGTH</Text>
            <Text style={[
              styles.strengthValue,
              { color: result.name_breakdown?.strength === 'Strong' ? ASBColors.goodGreen : result.name_breakdown?.strength === 'Medium' ? '#D97706' : ASBColors.errorRed }
            ]}>
              {result.name_breakdown?.strength || 'Strong'}
            </Text>
          </GlassCard>

          {/* Compound Meaning */}
          {result.name_breakdown?.compound && CHALDEAN_COMPOUND_MEANINGS[result.name_breakdown.compound] && (
            <GlassCard style={{ padding: 14, backgroundColor: '#FAF5FF', borderColor: ASBColors.primaryPurple ? '#E9D5FF' : '#E9D5FF' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Sparkles size={14} color={ASBColors.primaryPurple} />
                <Text style={{ fontSize: 10, fontWeight: '800', color: ASBColors.primaryPurple, letterSpacing: 1 }}>COMPOUND #{result.name_breakdown.compound} MEANING</Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: ASBColors.darkNavy, lineHeight: 18 }}>
                {CHALDEAN_COMPOUND_MEANINGS[result.name_breakdown.compound]}
              </Text>
            </GlassCard>
          )}

          {/* Lo Shu Grid Card */}
          <Text style={styles.sectionHeading}>LO SHU GRID VIBRATIONS</Text>
          <GlassCard style={styles.loshuCard}>
            <View style={styles.grid3x3}>
              {['4', '9', '2', '3', '5', '7', '8', '1', '6'].map((numStr) => {
                const count = result.loshu_grid?.[numStr] || result.loshu_grid?.[parseInt(numStr, 10)] || 0;
                const numVal = parseInt(numStr, 10);
                const drv = result.mulyank || result.dob_numbers?.driver;
                const dest = result.bhagyank || result.dob_numbers?.destiny;
                const isPresent = count > 0 || numVal === drv || numVal === dest;
                const isStrong = count >= 2;
                const isWeak = count === 1 && numVal !== drv && numVal !== dest;

                const cellBg = isStrong ? '#DCFCE7' : isPresent ? ASBColors.primaryPurple : '#FEF9EF';
                const cellBorder = isStrong ? '#22C55E' : isPresent ? ASBColors.primaryPurple : '#E5D5B5';
                const numColor = isStrong ? '#15803D' : isPresent ? '#FFFFFF' : ASBColors.textMuted;
                const borderStyle = isPresent ? 'solid' : 'dashed';

                return (
                  <View key={numStr} style={[
                    styles.gridCell,
                    { backgroundColor: cellBg, borderColor: cellBorder, borderWidth: isPresent ? 1.5 : 2, borderStyle: borderStyle as any }
                  ]}>
                    <Text style={[styles.gridCellNum, { color: numColor }]}>{numStr}</Text>
                    {isPresent && (
                      <Text style={{ fontSize: 9, fontWeight: '700', color: isStrong ? '#15803D' : '#FFFFFF', marginTop: 2 }}>
                        {count > 0 ? `×${count}` : '●'}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
            {/* Legend */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#22C55E' }} />
                <Text style={{ fontSize: 9, color: ASBColors.textMuted, fontWeight: '600' }}>Strong (2+)</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: ASBColors.primaryPurple }} />
                <Text style={{ fontSize: 9, color: ASBColors.textMuted, fontWeight: '600' }}>Present</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#FEF9EF', borderWidth: 1, borderColor: '#E5D5B5' }} />
                <Text style={{ fontSize: 9, color: ASBColors.textMuted, fontWeight: '600' }}>Missing</Text>
              </View>
            </View>
            <Text style={styles.missingText}>
              Missing Digits: {
                (() => {
                  const drv = result.mulyank || result.dob_numbers?.driver;
                  const dest = result.bhagyank || result.dob_numbers?.destiny;
                  const missing = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].filter((numStr) => {
                    const count = result.loshu_grid?.[numStr] || result.loshu_grid?.[parseInt(numStr, 10)] || 0;
                    const val = parseInt(numStr, 10);
                    return count === 0 && val !== drv && val !== dest;
                  });
                  return missing.join(', ') || 'None (Full Harmony)';
                })()
              }
            </Text>
          </GlassCard>

          {/* Strong Name Notice Banner */}
          {result.name_breakdown?.strength === 'Strong' && (
            <GlassCard style={{ marginTop: 16, padding: 16, borderColor: '#10B981', backgroundColor: 'rgba(236, 253, 245, 0.85)' }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#047857', textAlign: 'center', marginBottom: 4 }}>
                ✨ Strong Vibration Name Detected!
              </Text>
              <Text style={{ fontSize: 12, color: '#065F46', textAlign: 'center', lineHeight: 18 }}>
                Your current name spelling already carries a strong energetic vibration & harmony with your birth chart. No spelling change is necessary.
              </Text>
            </GlassCard>
          )}

          {/* Recommended Names Section - ALWAYS VISIBLE */}
          {recommendations.length > 0 ? (
            <GlassCard style={{ marginTop: 16, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Sparkles size={18} color={ASBColors.primaryPurple} />
                <Text style={{ fontSize: 13, fontWeight: '800', color: ASBColors.darkNavy, letterSpacing: 0.5 }}>
                  ✨ RECOMMENDED POWER SPELLINGS
                </Text>
              </View>

              {recommendations.slice(0, 2).map((rec: any, idx: number) => (
                <View key={idx} style={{ backgroundColor: '#F8F5FF', borderRadius: 12, padding: 12, marginBottom: idx === 0 ? 10 : 0, borderWidth: 1, borderColor: '#E9D5FF' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: ASBColors.darkNavy }}>
                      {idx === 0 ? '✨ Option 1: ' : '🌟 Option 2: '}{rec.name || rec.spelling}
                    </Text>
                    <View style={{ backgroundColor: ASBColors.primaryPurple, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFF' }}>
                        Total: #{rec.compound || rec.compound_number || 24}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: ASBColors.textMuted, marginTop: 4 }}>
                    Vibration #{rec.root || rec.root_number || 6} • {rec.strength || 'HIGH VIBRATION'}
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.copyBtn, { backgroundColor: ASBColors.primaryPurple, marginTop: 14, paddingVertical: 12 }]}
                onPress={() => setShowRecsModal(true)}
              >
                <Sparkles size={16} color="#FFF" />
                <Text style={styles.copyBtnText}>View All Recommendations ({recommendations.length})</Text>
              </TouchableOpacity>
            </GlassCard>
          ) : (
            <TouchableOpacity
              style={[styles.copyBtn, { backgroundColor: ASBColors.primaryPurple, marginTop: 16, paddingVertical: 14 }]}
              onPress={() => setShowRecsModal(true)}
            >
              <Sparkles size={16} color="#FFF" />
              <Text style={[styles.copyBtnText, { fontSize: 14 }]}>
                ✨ View Recommended Name Spellings
              </Text>
            </TouchableOpacity>
          )}

          {/* Disclaimer */}
          <TouchableOpacity
            onPress={() => router.push('/info/disclaimer' as any)}
            style={{ marginTop: 20, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <Text style={{ fontSize: 11, color: ASBColors.textMuted, textAlign: 'center', fontStyle: 'italic' }}>
              🌸 Disclaimer: For personal guidance & self-growth.{' '}
              <Text style={{ color: ASBColors.primaryPurple, fontWeight: '700', textDecorationLine: 'underline' }}>
                Read Full Legal Disclaimer
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recommended Names Pop-up Modal (No Compound/Root Badges) */}
      <Modal visible={showRecsModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={[styles.modalTitle, { textAlign: 'left', marginBottom: 0 }]}>✨ Recommended Name Spellings</Text>
              <TouchableOpacity onPress={() => setShowRecsModal(false)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: ASBColors.darkNavy }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {recommendations.map((rec, idx) => {
                const suggestedName = typeof rec === 'string' ? rec : (rec.name || rec.spelling || rec.altered_name || rec.recommended_name || rec.full_name || '');
                if (!suggestedName) return null;
                const isBest = idx === 0;
                const compat = rec.compatibility || 'Average';
                const starMap: Record<string, string> = {
                  'Excellent': '★★★★★',
                  'Excellent (Master Alignment)': '★★★★★',
                  'Good': '★★★★☆',
                  'Average': '★★★☆☆',
                  'Poor': '★☆☆☆☆',
                };
                const stars = starMap[compat] || '★★★☆☆';
                const strengthColor = rec.strength === 'Strong' ? ASBColors.goodGreen : rec.strength === 'Medium' ? '#D97706' : ASBColors.errorRed;

                return (
                  <GlassCard key={idx} variant="gold" style={styles.recCard}>
                    {isBest && (
                      <View style={styles.bestRibbon}>
                        <Text style={styles.bestRibbonText}>⭐ Best Match</Text>
                      </View>
                    )}

                    <View style={styles.recHeader}>
                      <Text style={styles.recName}>{suggestedName}</Text>
                      <Text style={styles.starText}>{stars}</Text>
                    </View>

                    {/* Metadata Row */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 }}>
                      {rec.compound && (
                        <View style={{ backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: ASBColors.primaryPurple }}>Compound #{rec.compound}</Text>
                        </View>
                      )}
                      {rec.root && (
                        <View style={{ backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: ASBColors.primaryPurple }}>Root #{rec.root}</Text>
                        </View>
                      )}
                      {rec.strength && (
                        <View style={{ backgroundColor: rec.strength === 'Strong' ? '#DCFCE7' : rec.strength === 'Medium' ? '#FEF3C7' : '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: strengthColor }}>{rec.strength}</Text>
                        </View>
                      )}
                      {compat && (
                        <View style={{ backgroundColor: compat.includes('Excellent') ? '#DCFCE7' : compat === 'Good' ? '#DBEAFE' : '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: compat.includes('Excellent') ? '#15803D' : compat === 'Good' ? '#1D4ED8' : '#92400E' }}>{compat}</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.copyBtn}
                      onPress={() => handleCopyName(suggestedName)}
                    >
                      <Copy size={14} color="#FFF" />
                      <Text style={styles.copyBtnText}>Copy Name</Text>
                    </TouchableOpacity>
                  </GlassCard>
                );
              })}
            </ScrollView>

            <TouchableOpacity onPress={() => setShowRecsModal(false)} style={[styles.closeBtn, { marginTop: 14 }]}>
              <Text style={styles.closeBtnText}>Close Recommendations</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    maxHeight: 200,
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
  letterBreakdownCard: {
    padding: 14,
    marginBottom: 4,
  },
  letterCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.primaryPurple,
    letterSpacing: 1,
    marginBottom: 10,
  },
  wordsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'flex-start',
  },
  wordBlock: {
    marginBottom: 4,
  },
  letterGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  letterChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 34,
  },
  letterChar: {
    fontSize: 14,
    fontWeight: '800',
    color: ASBColors.darkNavy,
  },
  letterValBadge: {
    backgroundColor: '#F3E8FF',
    borderRadius: 6,
    paddingHorizontal: 4,
    marginTop: 2,
  },
  letterValText: {
    fontSize: 9,
    fontWeight: '800',
    color: ASBColors.primaryPurple,
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
  meaningCard: {
    padding: 14,
    backgroundColor: '#FAF5FF',
    borderColor: ASBColors.borderPurple,
  },
  meaningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  meaningCardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.primaryPurple,
    letterSpacing: 1,
  },
  meaningText: {
    fontSize: 13,
    fontWeight: '600',
    color: ASBColors.darkNavy,
    lineHeight: 18,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ASBColors.primaryPurple,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  applyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
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
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  bestRibbon: {
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  bestRibbonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recName: {
    fontSize: 17,
    fontWeight: '800',
    color: ASBColors.darkNavy,
    letterSpacing: 0.5,
  },
  recMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  recBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  recBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
  },
  starText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    marginLeft: 'auto',
  },
  copyBtn: {
    backgroundColor: ASBColors.primaryPurple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
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
