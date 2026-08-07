// mobile-app/src/app/reports/time-cycles.tsx
// Time Cycles & Predictions Screen (Clickable 12-Month Wave, Quarterly Breakdown & Daily Biorhythm)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Sparkles, Sun, TrendingUp, Award, Zap, X, CheckCircle, Clock, ShieldAlert } from 'lucide-react-native';
import { ASBColors, ASBFonts, ASBShadows } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { DobRequiredGate } from '../../components/common/DobRequiredGate';
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

export default function TimeCyclesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<any>(null);

  const effectiveDob = user?.dob || '';
  const effectiveName = user?.name || 'Seeker';
  const profile = calculateNumerologyProfile(effectiveDob, effectiveName);

  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);

  useEffect(() => {
    if (!effectiveDob) return;
    let isMounted = true;
    const fetchPredictions = async () => {
      setLoading(true);
      const dobFormatted = formatDobForApi(effectiveDob);
      const year = new Date().getFullYear();
      try {
        const [dRes, mRes] = await Promise.allSettled([
          reportApi.get('/api/numerology/features/daily-triangle.report.json', { params: { dob: dobFormatted } }),
          reportApi.get('/api/numerology/monthly.report.json', { params: { dob: dobFormatted, year } }),
        ]);

        if (isMounted) {
          if (dRes.status === 'fulfilled' && dRes.value.data) setDailyData(dRes.value.data);
          if (mRes.status === 'fulfilled' && mRes.value.data) setMonthlyData(mRes.value.data);
        }
      } catch (e) {
        console.warn('Time cycles API fallback:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPredictions();
    return () => {
      isMounted = false;
    };
  }, [effectiveDob]);

  // Compute Today's exact Personal Day
  const today = new Date();
  const curDay = today.getDate();
  const curMonth = today.getMonth() + 1;
  const curYear = today.getFullYear();

  const dobParts = effectiveDob.replace(/-/g, '/').split('/');
  const dobDay = parseInt(dobParts[0] || '29', 10);
  const dobMonth = parseInt(dobParts[1] || '10', 10);

  const pySum = dobDay + dobMonth + curYear.toString().split('').reduce((s, d) => s + parseInt(d, 10), 0);
  const personalYear = reduceSingleDigit(pySum);
  const personalMonth = reduceSingleDigit(personalYear + curMonth);
  const personalDay = reduceSingleDigit(personalMonth + curDay);

  const getMonthDetailData = (monthName: string, score: number, idx: number) => {
    const monthNum = idx + 1;
    const apiMonth = monthlyData?.months?.[String(monthNum)];
    const traits = apiMonth?.traits || {};
    const mVibe = apiMonth?.value || reduceSingleDigit(personalYear + monthNum);

    const posStr = traits.positive?.length ? `Strengths: ${traits.positive.join(', ')}` : '';
    const negStr = traits.negative?.length ? `Watch out: ${traits.negative.join(', ')}` : '';

    return {
      name: monthName,
      score,
      vibration: mVibe,
      focus: traits.story || traits.meaning || apiMonth?.meaning || `Strategic planning & financial growth during Month #${mVibe}.`,
      financialOutlook: posStr || (score >= 8.5 ? 'High Financial Opportunities & Growth' : 'Steady Cash Flow & Conservative Investments'),
      healthAdvice: negStr || 'Prioritize balanced sleep and 15 mins daily morning hydration.',
      luckyDays: `Days ${mVibe}, ${mVibe + 9 <= 31 ? mVibe + 9 : mVibe + 2}, and ${mVibe + 18 <= 31 ? mVibe + 18 : mVibe + 5}`,
    };
  };

  return (
    <DobRequiredGate reportTitle="Time Cycles & Predictions">
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Time Cycles & Predictions</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        {(['daily', 'monthly', 'yearly'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]} numberOfLines={1}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DAILY FOCUS CARD */}
      {activeTab === 'daily' && (
        <View style={{ gap: 12 }}>
          <GlassCard variant="purple" style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTag}>TODAY'S COSMIC ALIGNMENT</Text>
                <Text style={styles.heroTitle}>Lucky Number: {personalDay} & {profile.moolank} | Color: Royal Purple</Text>
                <Text style={styles.heroSub}>Personal Day #{personalDay} Energy ({today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})</Text>
              </View>
              <Sun size={36} color={ASBColors.primaryPurple} />
            </View>
          </GlassCard>

          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Daily Guidance & Decision Window</Text>
            <Text style={styles.cardBody}>
              Today favors strategic decisions, planning, and spiritual study for Soul Number {profile.moolank}. Your primary peak decision window is between 11:00 AM and 3:00 PM.
            </Text>

            <View style={styles.dailyDetailBox}>
              <View style={styles.detailItem}>
                <Clock size={14} color={ASBColors.primaryPurple} />
                <Text style={styles.detailText}>Peak Decision Window: <Text style={{ fontFamily: ASBFonts.bodyBold }}>11:00 AM - 3:00 PM</Text></Text>
              </View>
              <View style={styles.detailItem}>
                <Sparkles size={14} color="#F59E0B" />
                <Text style={styles.detailText}>Daily Biorhythm Score: <Text style={{ fontFamily: ASBFonts.bodyBold }}>{Math.min(98, 75 + (personalDay * 3) % 20)}% Alignment</Text></Text>
              </View>
            </View>
          </GlassCard>
        </View>
      )}

      {/* MONTHLY FOCUS - VISUAL 12-MONTH WAVE BAR CHART */}
      {activeTab === 'monthly' && (
        <GlassCard style={styles.card}>
          <View style={styles.chartHeader}>
            <TrendingUp size={18} color={ASBColors.primaryPurple} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>12-Month Personal Energy Wave</Text>
              <Text style={styles.subHint}>Tap any month to view detailed predictions & lucky dates</Text>
            </View>
          </View>

          {profile.monthlyVibes.map((item, idx) => {
            const barWidth = `${(item.score / 10) * 100}%`;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => setSelectedMonth(getMonthDetailData(item.month, item.score, idx))}
                style={styles.monthBarRow}
              >
                <View style={styles.monthLabelCol}>
                  <Text style={styles.monthName}>{item.month}</Text>
                  <Text style={styles.monthScoreVal}>{item.score}/10</Text>
                </View>

                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: barWidth as any },
                      item.peak && { backgroundColor: ASBColors.crimsonMagenta },
                    ]}
                  />
                </View>

                {item.peak ? (
                  <View style={styles.peakBadge}>
                    <Zap size={10} color="#FFFFFF" />
                    <Text style={styles.peakText}>PEAK</Text>
                  </View>
                ) : (
                  <Text style={styles.tapDetailText}>Tap ›</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </GlassCard>
      )}

      {/* YEARLY FOCUS - 9-YEAR PERSONAL CYCLE PHASE */}
      {activeTab === 'yearly' && (
        <View style={{ gap: 12 }}>
          <GlassCard variant="dark" style={styles.card}>
            <View style={styles.yearlyHeader}>
              <Award size={20} color={ASBColors.crimsonMagenta} />
              <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>
                Personal Year #{personalYear} Cycle Phase (Year {curYear})
              </Text>
            </View>

            <Text style={[styles.cardBody, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              Your birth date {effectiveDob} places you in Personal Year #{personalYear}. This is a crucial cycle for long-term career expansion, public manifestation, and personal foundation building.
            </Text>
          </GlassCard>

          {/* 4-Quarter Annual Breakdown */}
          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Year {curYear} Quarterly Pacing & Roadmap</Text>

            <View style={{ gap: 10, marginTop: 10 }}>
              {[
                { q: 'Q1 (Jan - Mar)', title: 'Foundation & Strategy', desc: 'Set long-term goals, audit financial accounts, and initiate key alliances.' },
                { q: 'Q2 (Apr - Jun)', title: 'Peak Execution & Vigor', desc: 'Highest action window for business expansion and athletic conditioning.' },
                { q: 'Q3 (Jul - Sep)', title: 'Pacing & Health Audit', desc: 'Review progress, optimize dietary habits, and avoid impulsive investments.' },
                { q: 'Q4 (Oct - Dec)', title: 'Harvest & Manifestation', desc: 'Consolidate gains, close annual deals, and prepare for upcoming year cycle.' },
              ].map((qItem, idx) => (
                <View key={idx} style={styles.quarterCard}>
                  <View style={styles.quarterRow}>
                    <Text style={styles.qTag}>{qItem.q}</Text>
                    <Text style={styles.qTitle}>{qItem.title}</Text>
                  </View>
                  <Text style={styles.qDesc}>{qItem.desc}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </View>
      )}

      {/* SELECTED MONTH DETAIL MODAL */}
      <Modal visible={!!selectedMonth} transparent animationType="fade" onRequestClose={() => setSelectedMonth(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTag}>MONTHLY PREDICTION</Text>
                <Text style={styles.modalTitle}>{selectedMonth?.month || selectedMonth?.name} Details</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedMonth(null)} style={styles.closeBtn}>
                <X size={20} color={ASBColors.darkNavy} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalScoreBox}>
              <Sparkles size={20} color={ASBColors.primaryPurple} />
              <Text style={styles.modalScoreText}>Monthly Energy Index: {selectedMonth?.score}/10</Text>
            </View>

            <View style={styles.modalBodyGroup}>
              <View style={styles.mRow}>
                <Text style={styles.mLabel}>Primary Focus:</Text>
                <Text style={styles.mVal}>{selectedMonth?.focus}</Text>
              </View>

              <View style={styles.mRow}>
                <Text style={styles.mLabel}>Financial Outlook:</Text>
                <Text style={styles.mVal}>{selectedMonth?.financialOutlook}</Text>
              </View>

              <View style={styles.mRow}>
                <Text style={styles.mLabel}>Health Protocol:</Text>
                <Text style={styles.mVal}>{selectedMonth?.healthAdvice}</Text>
              </View>

              <View style={styles.mRow}>
                <Text style={styles.mLabel}>Lucky Dates:</Text>
                <Text style={styles.mVal}>{selectedMonth?.luckyDays}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedMonth(null)}>
              <Text style={styles.modalCloseBtnText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 15,
    fontFamily: ASBFonts.subheading,
    color: ASBColors.darkNavy,
    marginVertical: 4,
  },
  heroSub: {
    fontSize: 11,
    color: ASBColors.textMuted,
  },
  card: {
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  subHint: {
    fontSize: 11,
    color: ASBColors.textMuted,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  cardBody: {
    fontSize: 13,
    color: ASBColors.darkNavy,
    lineHeight: 18,
  },
  dailyDetailBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: ASBColors.darkNavy,
  },
  monthBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
    paddingVertical: 4,
  },
  monthLabelCol: {
    width: 90,
  },
  monthName: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  monthScoreVal: {
    fontSize: 10,
    color: ASBColors.textMuted,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3E8FF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: ASBColors.primaryPurple,
    borderRadius: 4,
  },
  peakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: ASBColors.crimsonMagenta,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  peakText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tapDetailText: {
    fontSize: 11,
    color: ASBColors.primaryPurple,
    fontFamily: ASBFonts.bodyBold,
  },
  yearlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  quarterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
  },
  quarterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  qTag: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qTitle: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  qDesc: {
    fontSize: 11,
    color: ASBColors.textMuted,
    lineHeight: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTag: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    letterSpacing: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ASBColors.bgCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3E8FF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  modalScoreText: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
  },
  modalBodyGroup: {
    gap: 10,
    marginBottom: 16,
  },
  mRow: {
    gap: 2,
  },
  mLabel: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.textMuted,
  },
  mVal: {
    fontSize: 13,
    color: ASBColors.darkNavy,
    lineHeight: 17,
  },
  modalCloseBtn: {
    backgroundColor: ASBColors.primaryPurple,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: '#FFFFFF',
  },
});
