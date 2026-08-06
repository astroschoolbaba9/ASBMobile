// mobile-app/src/app/reports/health.tsx
// Health & Vitality Report Screen (100% Dynamic Math for Daily, Monthly & Yearly Cycles)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldAlert, Coffee, Sun, Activity, CheckCircle, Calendar, Clock, Heart, Zap, Sparkles, FileText, ChevronRight } from 'lucide-react-native';
import { ASBColors, ASBFonts, ASBShadows } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { calculateNumerologyProfile } from '../../utils/numerologyMath';
import { reportApi, formatDobForApi } from '../../api/client';

function reduceSingleDigit(num: number): number {
  while (num > 9) {
    num = String(num)
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return num === 0 ? 9 : num;
}

export default function HealthReportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const effectiveDob = user?.dob || '29/10/2001';
  const effectiveName = user?.name || 'Seeker';
  const [activeCycleTab, setActiveCycleTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  const [loading, setLoading] = useState(false);
  const [apiHealthData, setApiHealthData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHealthData = async () => {
      setLoading(true);
      const dobFormatted = formatDobForApi(effectiveDob);
      try {
        const res = await reportApi.get('/api/numerology/health-triangle.report.json', {
          params: { dob: dobFormatted, gender: user?.gender },
        });
        if (isMounted && res.data) {
          setApiHealthData(res.data);
        }
      } catch (e) {
        console.warn('Health API fallback:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHealthData();
    return () => {
      isMounted = false;
    };
  }, [effectiveDob, user?.gender]);

  // 100% Dynamic Math Profile derived from user's DOB & Lo Shu Grid
  const profile = calculateNumerologyProfile(effectiveDob, effectiveName);

  // Compute Current Date Numbers (Personal Day, Month, Year)
  const today = new Date();
  const curDay = today.getDate();
  const curMonth = today.getMonth() + 1;
  const curYear = today.getFullYear();

  // Parse DOB day & month
  const dobParts = effectiveDob.replace(/-/g, '/').split('/');
  const dobDay = parseInt(dobParts[0] || '29', 10);
  const dobMonth = parseInt(dobParts[1] || '10', 10);

  const pySum = dobDay + dobMonth + curYear.toString().split('').reduce((s, d) => s + parseInt(d, 10), 0);
  const personalYear = reduceSingleDigit(pySum);
  const personalMonth = reduceSingleDigit(personalYear + curMonth);
  const personalDay = reduceSingleDigit(personalMonth + curDay);

  // Dynamic Daily Health Configurations (1-9)
  const DAILY_HEALTH_MAP: Record<number, { title: string; organ: string; advice: string; workout: string; hydration: string }> = {
    1: { title: 'Solar Circulation & Heart Vitality', organ: 'Heart & Blood Pressure', advice: 'Avoid excessive direct midday sun; practice 10 mins morning sun gazing.', workout: 'Brisk Walking or Cardio (6:30 AM - 7:30 AM)', hydration: '3.0 L with Lemon & Electrolytes' },
    2: { title: 'Lunar Fluid & Digestive Harmony', organ: 'Stomach & Lymphatic System', advice: 'Eat light, warm meals. Avoid cold iced beverages after sunset.', workout: 'Gentle Yoga & Light Stretch (7:00 AM - 8:00 AM)', hydration: '2.5 L Warm Water / Herbal Tea' },
    3: { title: 'Jupiterian Cellular & Liver Stamina', organ: 'Liver, Thighs & Arteries', advice: 'High energy day! Consume antioxidant rich berries and turmeric.', workout: 'High-Intensity Cardio or Sports (Morning)', hydration: '3.2 L Coconut Water & Pure Water' },
    4: { title: 'Rahu Mental Balance & Rest', organ: 'Nervous System & Head', advice: 'Prone to mental overthinking. Unplug screens 1 hour before sleep.', workout: 'Pranayama & Deep Breathing (Sunset)', hydration: '2.8 L Warm Chamomile Ingestion' },
    5: { title: 'Mercurial Breath & Vocal Flow', organ: 'Lungs, Throat & Arms', advice: 'Great day for breathing exercises. Protect throat from cold winds.', workout: 'Cycling or Outdoor Jogging (Morning)', hydration: '2.5 L Mint Infused Water' },
    6: { title: 'Venusian Hormonal & Kidney Care', organ: 'Kidneys & Reproductive System', advice: 'Focus on posture and lower back comfort. Avoid heavy processed sugar.', workout: 'Pilates or Core Conditioning (Evening)', hydration: '2.8 L Water with Cucumber & Lime' },
    7: { title: 'Ketu Spiritual & Spinal Alignment', organ: 'Spine, Brainstem & Sleep', advice: 'Deep restorative energy. Prioritize 8 hours of uninterrupted sleep.', workout: 'Meditative Movement & Tai-Chi (Evening)', hydration: '2.5 L Pure Mineral Water' },
    8: { title: 'Saturnian Bone & Joint Fortification', organ: 'Bones, Joints & Knees', advice: 'Focus on calcium & vitamin D. Take frequent stretch breaks if sitting.', workout: 'Low-Impact Resistance Training (Morning)', hydration: '3.0 L Warm Water & Herbal Infusions' },
    9: { title: 'Martian Blood & Muscle Vitality', organ: 'Muscles, Blood & Immune Cells', advice: 'Peak physical endurance day. Stay hydrated during intense activity.', workout: 'Strength Training & Weightlifting (Morning)', hydration: '3.5 L High Hydration Intake' },
  };

  // Dynamic Monthly Health Configurations (1-9)
  const MONTHLY_HEALTH_MAP: Record<number, { title: string; focus: string; detox: string; sleepTarget: string }> = {
    1: { title: 'Monthly Vitality Renewal & New Beginnings', focus: 'Cardiovascular build-up and stamina awakening.', detox: '7-Day Fresh Fruit & Celery Juice Morning Cleanse', sleepTarget: '7.5 Hours (Early Rise 6:00 AM)' },
    2: { title: 'Monthly Emotional & Digestive Balance', focus: 'Soothing gut microbiome and reducing stress hormones.', detox: 'Warm Soups, Kitchari & Probiotic Yoghurt Cleanse', sleepTarget: '8.0 Hours (Unwind by 10:00 PM)' },
    3: { title: 'Monthly Growth & Liver Fortification', focus: 'Enhancing metabolic efficiency and physical vigor.', detox: 'Green Tea, Dandelion Root & Milk Thistle Flush', sleepTarget: '7.5 Hours (Consistent Sleep Window)' },
    4: { title: 'Monthly Nervous System & Stress Reset', focus: 'Calming central nervous system and preventing burnout.', detox: 'Magnesium-rich Greens & Golden Milk Evening Protocol', sleepTarget: '8.5 Hours (Deep Recovery Focus)' },
    5: { title: 'Monthly Active Vitality & Respiratory Expansion', focus: 'Lung capacity building and cellular oxygenation.', detox: 'Fresh Citrus, Ginger & Tulsi Water Infusions', sleepTarget: '7.0 Hours (Active Dynamic Days)' },
    6: { title: 'Monthly Wellness & Renal Balance', focus: 'Kidney flushing, skin radiance and hormonal equilibrium.', detox: 'Cranberry, Watermelon & Coconut Hydration Protocol', sleepTarget: '8.0 Hours (Beauty & Cell Repair Sleep)' },
    7: { title: 'Monthly Deep Cellular & Spiritual Detox', focus: 'Subconscious stress release and spinal health.', detox: 'Intermittent Fasting & Herbal Warm Teas', sleepTarget: '8.5 Hours (Meditative Restoration)' },
    8: { title: 'Monthly Structural & Bone Resilience', focus: 'Strengthening joint cartilage, bones and posture.', detox: 'Sesame, Chia Seeds & Bone/Plant Broth Support', sleepTarget: '8.0 Hours (Deep Structural Rest)' },
    9: { title: 'Monthly Peak Vigor & Immunity Shield', focus: 'White blood cell activation and stamina peak.', detox: 'Beetroot, Pomegranate & Iron-Rich Greens Protocol', sleepTarget: '7.5 Hours (Athletic Recovery Sleep)' },
  };

  const dailyInfo = DAILY_HEALTH_MAP[personalDay] || DAILY_HEALTH_MAP[1];
  const monthlyInfo = MONTHLY_HEALTH_MAP[personalMonth] || MONTHLY_HEALTH_MAP[1];

  const dailyScore = Math.min(98, Math.max(68, 72 + ((personalDay * 7) % 24)));
  const monthlyScore = Math.min(96, Math.max(70, 75 + ((personalMonth * 5) % 20)));
  const yearlyScore = Math.min(97, Math.max(72, 78 + ((personalYear * 4) % 18)));

  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayDateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Health & Vitality Report</Text>
      </View>

      {/* Cycle Selector Tabs */}
      <View style={styles.tabRow}>
        {(['daily', 'monthly', 'yearly'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveCycleTab(tab)}
            style={[styles.tabBtn, activeCycleTab === tab && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeCycleTab === tab && styles.tabTextActive]} numberOfLines={1}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DYNAMIC CYCLE SPECIFIC CARD */}
      {activeCycleTab === 'daily' && (
        <GlassCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.badgeChip}>
              <Clock size={14} color={ASBColors.primaryPurple} />
              <Text style={styles.badgeText}>Personal Day #{personalDay} • {dayDateStr}</Text>
            </View>
            <View style={styles.scorePill}>
              <Zap size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.scoreText}>{dailyScore}% Vitality</Text>
            </View>
          </View>

          <Text style={styles.cycleTitle}>{dailyInfo.title}</Text>

          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <Heart size={16} color={ASBColors.crimsonMagenta} />
              <Text style={styles.detailLabel}>Focus Organ:</Text>
              <Text style={styles.detailVal}>{dailyInfo.organ}</Text>
            </View>

            <View style={styles.detailRow}>
              <Activity size={16} color={ASBColors.primaryPurple} />
              <Text style={styles.detailLabel}>Workout Window:</Text>
              <Text style={styles.detailVal}>{dailyInfo.workout}</Text>
            </View>

            <View style={styles.detailRow}>
              <Coffee size={16} color={ASBColors.goodGreen} />
              <Text style={styles.detailLabel}>Daily Hydration:</Text>
              <Text style={styles.detailVal}>{dailyInfo.hydration}</Text>
            </View>
          </View>

          <Text style={styles.adviceText}>
            💡 <Text style={{ fontFamily: ASBFonts.bodyBold }}>Today's Vitality Guidance:</Text> {dailyInfo.advice}
          </Text>
        </GlassCard>
      )}

      {activeCycleTab === 'monthly' && (
        <GlassCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.badgeChip}>
              <Calendar size={14} color={ASBColors.primaryPurple} />
              <Text style={styles.badgeText}>Personal Month #{personalMonth} • {monthName}</Text>
            </View>
            <View style={styles.scorePill}>
              <Sparkles size={14} color={ASBColors.primaryPurple} />
              <Text style={styles.scoreText}>{monthlyScore}% Immunity</Text>
            </View>
          </View>

          <Text style={styles.cycleTitle}>{monthlyInfo.title}</Text>

          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <ShieldAlert size={16} color={ASBColors.crimsonMagenta} />
              <Text style={styles.detailLabel}>Monthly Theme:</Text>
              <Text style={styles.detailVal}>{monthlyInfo.focus}</Text>
            </View>

            <View style={styles.detailRow}>
              <Sun size={16} color="#F59E0B" />
              <Text style={styles.detailLabel}>Detox Strategy:</Text>
              <Text style={styles.detailVal}>{monthlyInfo.detox}</Text>
            </View>

            <View style={styles.detailRow}>
              <Clock size={16} color={ASBColors.goodGreen} />
              <Text style={styles.detailLabel}>Sleep Target:</Text>
              <Text style={styles.detailVal}>{monthlyInfo.sleepTarget}</Text>
            </View>
          </View>

          <Text style={styles.adviceText}>
            🌿 <Text style={{ fontFamily: ASBFonts.bodyBold }}>Month #{personalMonth} Energy Pacing:</Text> Align your physical workload with Personal Month #{personalMonth} to maintain high immune defense.
          </Text>
        </GlassCard>
      )}

      {activeCycleTab === 'yearly' && (
        <GlassCard style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.badgeChip}>
              <Calendar size={14} color={ASBColors.primaryPurple} />
              <Text style={styles.badgeText}>Personal Year #{personalYear} • Year {curYear}</Text>
            </View>
            <View style={styles.scorePill}>
              <CheckCircle size={14} color={ASBColors.goodGreen} />
              <Text style={styles.scoreText}>{yearlyScore}% Resilience</Text>
            </View>
          </View>

          <Text style={styles.cycleTitle}>Annual Health & Immunity Blueprint (Year {curYear})</Text>

          <View style={{ gap: 10, marginVertical: 8 }}>
            {[
              { q: 'Q1 (Jan - Mar)', title: 'Preventive Health & Vital Check', desc: 'Perform annual blood panel, heart rate monitoring & gut baseline.' },
              { q: 'Q2 (Apr - Jun)', title: 'Peak Vigor & Active Conditioning', desc: 'Optimal window for physical conditioning, outdoor sports & muscle strength.' },
              { q: 'Q3 (Jul - Sep)', title: 'Hydration & Digestive Alignment', desc: 'Focus on liver detox, probiotic nutrition & stress management.' },
              { q: 'Q4 (Oct - Dec)', title: 'Immunity Shield & Winter Preparation', desc: 'Fortify respiratory immune barriers with Vitamin C, Zinc & warm herbal teas.' },
            ].map((qItem, idx) => (
              <View key={idx} style={styles.quarterBox}>
                <View style={styles.quarterHeader}>
                  <Text style={styles.quarterTag}>{qItem.q}</Text>
                  <Text style={styles.quarterTitle}>{qItem.title}</Text>
                </View>
                <Text style={styles.quarterDesc}>{qItem.desc}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.adviceText}>
            🌟 <Text style={{ fontFamily: ASBFonts.bodyBold }}>Personal Year #{personalYear} Master Advice:</Text> Your numerological year vibration supports long-term organ health when combined with structured sleep schedules.
          </Text>
        </GlassCard>
      )}

      {/* Organ Vulnerability Node Analysis (Dynamic from Lo Shu Grid & Live API) */}
      <GlassCard style={styles.card}>
        <View style={styles.cardTitleRow}>
          <ShieldAlert size={20} color={ASBColors.crimsonMagenta} />
          <Text style={styles.cardTitle}>Organ Vulnerability Node Analysis</Text>
        </View>

        {apiHealthData?.core_vibration && (
          <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FCA5A5' }}>
            <Text style={{ fontSize: 11, fontFamily: ASBFonts.bodyBold, color: '#991B1B', letterSpacing: 1, marginBottom: 2 }}>
              PRIMARY VIBRATIONAL HEALTH CORE
            </Text>
            <Text style={{ fontSize: 13, fontFamily: ASBFonts.bodyBold, color: '#7F1D1D' }}>
              {apiHealthData.core_vibration}
            </Text>
          </View>
        )}

        <View style={styles.organRow}>
          {profile.healthVulnerabilities.map((v, idx) => {
            const isOptimal = v.riskLevel === 'Optimal Vitality';
            const bgColor = isOptimal ? ASBColors.goodGreenBg : '#FEE2E2';
            const textColor = isOptimal ? ASBColors.goodGreen : '#991B1B';

            return (
              <View key={idx} style={[styles.organCard, { backgroundColor: bgColor }]}>
                <View style={styles.organHeader}>
                  <Text style={[styles.organName, { color: textColor }]}>{v.system}</Text>
                  <Text style={[styles.riskTag, { color: textColor }]}>{v.riskLevel}</Text>
                </View>
                <Text style={styles.organDesc}>{v.description}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.cardBody}>
          Based on birth date <Text style={{ fontFamily: ASBFonts.bodyBold }}>{effectiveDob}</Text>, your Soul Number <Text style={{ fontFamily: ASBFonts.bodyBold }}>{profile.moolank}</Text> thrives on regular sleep cycles and mindful morning hydration.
        </Text>
      </GlassCard>

      {/* Holistic Lifestyle & Energy Remedies */}
      <GlassCard variant="purple" style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Coffee size={20} color={ASBColors.primaryPurple} />
          <Text style={styles.cardTitle}>Holistic Lifestyle Remedies</Text>
        </View>
        {[
          `Consume warm herbal tea (Chamomile/Ginger) during Personal Month #${profile.personalMonth}`,
          `Wear Royal Purple or White attire on high-energy days for Soul #${profile.moolank}`,
          `Practice 15 minutes of Pranayama breathwork at sunrise to balance Lo Shu grid`,
        ].map((rem, idx) => (
          <View key={idx} style={styles.remRow}>
            <Sun size={14} color={ASBColors.primaryPurple} />
            <Text style={styles.remText}>{rem}</Text>
          </View>
        ))}
      </GlassCard>

      {/* 100-Page Master PDF Banner */}
      <TouchableOpacity
        style={styles.pdfBannerCard}
        activeOpacity={0.88}
        onPress={() => router.push('/reports/pdf-viewer')}
      >
        <View style={styles.pdfBannerIcon}>
          <FileText size={24} color={ASBColors.primaryPurple} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pdfBannerTitle}>View 100-Page Master PDF Report</Text>
          <Text style={styles.pdfBannerSub}>Complete Cosmic Dossier with all 7 Chapter Analysis</Text>
        </View>
        <ChevronRight size={20} color={ASBColors.primaryPurple} />
      </TouchableOpacity>
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: ASBColors.primaryPurple,
  },
  tabText: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: '#B45309',
  },
  cycleTitle: {
    fontSize: 15,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    marginBottom: 12,
  },
  detailBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.textMuted,
    width: 110,
  },
  detailVal: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
    flex: 1,
  },
  adviceText: {
    fontSize: 12,
    color: ASBColors.darkNavy,
    lineHeight: 18,
  },
  quarterBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
  },
  quarterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  quarterTag: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  quarterTitle: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  quarterDesc: {
    fontSize: 11,
    color: ASBColors.textMuted,
    lineHeight: 15,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  organRow: {
    gap: 10,
    marginBottom: 12,
  },
  organCard: {
    padding: 12,
    borderRadius: 12,
  },
  organHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  organName: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
  },
  riskTag: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
  },
  organDesc: {
    fontSize: 11,
    color: ASBColors.darkNavy,
    lineHeight: 16,
  },
  cardBody: {
    fontSize: 13,
    color: ASBColors.darkNavy,
    lineHeight: 18,
    marginTop: 4,
  },
  remRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  remText: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.darkNavy,
    flex: 1,
  },
  pdfBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    marginTop: 6,
  },
  pdfBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfBannerTitle: {
    fontSize: 14,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  pdfBannerSub: {
    fontSize: 11,
    color: ASBColors.textMuted,
    marginTop: 2,
  },
});
