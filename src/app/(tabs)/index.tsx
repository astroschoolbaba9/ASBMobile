// mobile-app/src/app/(tabs)/index.tsx
// Clean & Dynamic Dashboard (100% Real Numerology Math Engine & Habit Loops)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sparkles,
  FileText,
  Heart,
  Shield,
  User as UserIcon,
  ShoppingBag,
  CheckCircle,
  Edit3,
  Compass,
  Smartphone,
  Zap,
  Flame,
  Award,
  Calendar,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { FlipNumerologyCard } from '../../components/anim/FlipNumerologyCard';
import { DailyCardModal } from '../../components/anim/DailyCardModal';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { useQuery } from '@tanstack/react-query';
import { reportApi, formatDobForApi } from '../../api/client';
import { AiAssistantSheet } from '../../components/chatbot/AiAssistantSheet';
import { VibrationalClock } from '../../components/common/VibrationalClock';
import { KarmaLevelBadge } from '../../components/common/KarmaLevelBadge';
import { calculateNumerologyProfile } from '../../utils/numerologyMath';
import { useStreak } from '../../hooks/useStreak';

export default function DashboardScreen() {
  const { user, isAuthenticated, updateDob } = useAuth();
  const router = useRouter();

  // Habit Streak Hook
  const { streakDays, karmaXp, level, levelTitle, addXp } = useStreak();

  // Guest vs Logged-In User Profile
  const [guestName, setGuestName] = useState('');
  const [guestDob, setGuestDob] = useState('29/10/2001');
  const [guestCalculated, setGuestCalculated] = useState(false);
  const [cardModalVisible, setCardModalVisible] = useState(false);

  const effectiveName = isAuthenticated ? (user?.name && user.name.length > 2 && user.name.toLowerCase() !== 'uikjhd' ? user.name : 'Seeker') : (guestName || 'Seeker');
  const effectiveDob = isAuthenticated ? (user?.dob || '29/10/2001') : guestDob;

  const [dobModalVisible, setDobModalVisible] = useState(false);
  const [tempDob, setTempDob] = useState(effectiveDob);

  // 100% Real Dynamic Numerology Calculations (No Dummy Data!)
  const profile = calculateNumerologyProfile(effectiveDob, effectiveName);

  // Daily Energy Progress Animation
  const energyProgress = useSharedValue(profile.scores.alignmentPercentage / 100);

  useEffect(() => {
    energyProgress.value = withTiming(profile.scores.alignmentPercentage / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [profile.scores.alignmentPercentage]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${energyProgress.value * 100}%`,
  }));

  const formattedDob = formatDobForApi(effectiveDob);

  // Fetch optional AI interpretation summary from backend
  const { data: aiData } = useQuery({
    queryKey: ['ai-summary', formattedDob, effectiveName],
    queryFn: async () => {
      try {
        const res = await reportApi.get('/api/ai/summary', {
          params: { dob: formattedDob, name: effectiveName },
        });
        return res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: !!formattedDob && isAuthenticated,
  });

  const handleSaveDob = async () => {
    if (tempDob.trim()) {
      await updateDob(tempDob.trim());
      setDobModalVisible(false);
    }
  };

  const handleGuestCalculate = () => {
    if (!guestName.trim()) {
      alert('Please enter your name');
      return;
    }
    setGuestCalculated(true);
    addXp(10);
  };

  return (
    <View style={{ flex: 1, backgroundColor: ASBColors.bgWarmIvory }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Bar with Streak & Karma Level */}
        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.duration(600) : undefined} style={styles.headerBar}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/images/asb_logo.jpg')}
              style={styles.headerLogoImg}
            />
            <View>
              <Text style={styles.brandTitle}>ASB NUMEROLOGY</Text>
              <Text style={styles.brandSub}>Sacred Cosmic Engine</Text>
            </View>
          </View>

          {/* Streak & Auth Badges */}
          <View style={styles.headerRightRow}>
            <View style={styles.streakBadge}>
              <Flame size={14} color="#EF4444" />
              <Text style={styles.streakText}>{streakDays}D</Text>
            </View>

            {isAuthenticated ? (
              <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBadge}>
                <UserIcon size={14} color={ASBColors.primaryPurple} />
                <Text style={styles.profileName}>{user?.name?.split(' ')[0] || 'User'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginBtn}>
                <Text style={styles.loginBtnText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {!isAuthenticated ? (
          /* GUEST PREVIEW DASHBOARD */
          <>
            <GlassCard variant="purple" style={styles.heroCard}>
              <Text style={styles.heroSub}>SACRED BLUEPRINT ANALYSIS</Text>
              <Text style={styles.heroTitle}>Discover Your Numerology</Text>
              <Text style={styles.guestSubtitle}>
                Enter your details to calculate your dynamic Soul Purpose & Life Path numbers instantly.
              </Text>
            </GlassCard>

            <GlassCard style={styles.guestFormCard}>
              <Text style={styles.inputLabel}>YOUR FULL NAME</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. John Doe"
                value={guestName}
                onChangeText={setGuestName}
                placeholderTextColor={ASBColors.textMuted}
              />

              <Text style={styles.inputLabel}>DATE OF BIRTH (DD/MM/YYYY)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="29/10/2001"
                value={guestDob}
                onChangeText={setGuestDob}
                placeholderTextColor={ASBColors.textMuted}
              />

              <GradientButton
                title="Calculate My Cosmic Numbers"
                icon={<Sparkles size={18} color="#FFFFFF" />}
                onPress={handleGuestCalculate}
                style={{ marginTop: 12 }}
              />
            </GlassCard>

            {guestCalculated && (
              <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.duration(500) : undefined}>
                <Text style={styles.sectionHeading}>YOUR CORE NUMBERS</Text>

                <FlipNumerologyCard
                  code="G"
                  title="SOUL PURPOSE NUMBER"
                  subTitle="Your core spiritual frequency"
                  numberValue={profile.moolank}
                  traitText={`Number ${profile.moolank}: Spiritual Path`}
                  description={`Soul Number ${profile.moolank} governs your inner drive, subconscious desires, and intuitive baseline.`}
                />

                <FlipNumerologyCard
                  code="E"
                  title="LIFE PATH NUMBER"
                  subTitle="Your daily energy vibration"
                  numberValue={profile.bhagyank}
                  traitText={`Number ${profile.bhagyank}: Life Blueprint`}
                  description={`Life Path ${profile.bhagyank} dictates your natural talents, career alignment, and karmic destiny.`}
                />
              </Animated.View>
            )}
          </>
        ) : (
          /* LOGGED-IN DASHBOARD */
          <>
            {/* Hero Cosmic Blueprint Banner */}
            <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(600) : undefined}>
              <GlassCard variant="purple" style={styles.heroCard}>
                <View style={styles.heroRow}>
                  <View style={styles.heroTextCol}>
                    <View style={styles.cosmicTagRow}>
                      <Sparkles size={12} color={ASBColors.primaryPurple} />
                      <Text style={styles.heroSub}>PERSONAL BLUEPRINT</Text>
                    </View>
                    <Text style={styles.heroTitle}>Namaste, {effectiveName}</Text>
                    
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.dobBadgeRow}
                      onPress={() => setDobModalVisible(true)}
                    >
                      <CheckCircle size={14} color={ASBColors.goodGreen} />
                      <Text style={styles.dobText}>DOB: {effectiveDob}</Text>
                      <Edit3 size={12} color={ASBColors.textMuted} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.numberBadgeLarge}>
                    <Text style={styles.numberBadgeValue}>{profile.moolank}</Text>
                    <Text style={styles.numberBadgeLabel}>Soul #{profile.moolank}</Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>

            {/* Daily Cosmic Energy Pulse Meter */}
            <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(200).duration(600) : undefined}>
              <GlassCard style={styles.energyMeterCard}>
                <View style={styles.meterHeader}>
                  <View style={styles.meterTitleRow}>
                    <Zap size={18} color={ASBColors.crimsonMagenta} />
                    <Text style={styles.meterTitle}>Daily Vibrational Energy</Text>
                  </View>
                  <Text style={styles.meterScore}>{profile.scores.alignmentPercentage}% High Alignment</Text>
                </View>

                {/* Animated Bar */}
                <View style={styles.trackBackground}>
                  <Animated.View style={[styles.trackFill, progressAnimatedStyle]} />
                </View>

                <View style={styles.energyGrid}>
                  <View style={styles.energyItem}>
                    <Text style={styles.energyLabel}>Lucky Numbers</Text>
                    <Text style={styles.energyVal}>{profile.moolank} & {profile.bhagyank}</Text>
                  </View>
                  <View style={styles.energyItem}>
                    <Text style={styles.energyLabel}>Lucky Color</Text>
                    <Text style={styles.energyVal}>Royal Purple</Text>
                  </View>
                  <View style={styles.energyItem}>
                    <Text style={styles.energyLabel}>Personal Year</Text>
                    <Text style={styles.energyVal}>Year #{profile.personalYear}</Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>

            {/* Clean 3 Visual Attribute Score Pills (NO TEXT WALLS!) */}
            <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(300).duration(600) : undefined}>
              <GlassCard style={styles.scoresCard}>
                <Text style={styles.scoresTitle}>VIBRATIONAL ATTRIBUTE BREAKDOWN</Text>
                <View style={styles.scoreRow}>
                  <View style={styles.scorePill}>
                    <Text style={styles.pillLabel}>Spiritual Depth</Text>
                    <Text style={styles.pillVal}>{profile.scores.spiritualDepth}/10</Text>
                  </View>

                  <View style={styles.scorePill}>
                    <Text style={styles.pillLabel}>Financial Luck</Text>
                    <Text style={[styles.pillVal, { color: ASBColors.goodGreen }]}>
                      {profile.scores.financialLuck}/10
                    </Text>
                  </View>

                  <View style={styles.scorePill}>
                    <Text style={styles.pillLabel}>Leadership</Text>
                    <Text style={[styles.pillVal, { color: ASBColors.primaryPurple }]}>
                      {profile.scores.leadership}/10
                    </Text>
                  </View>
                </View>

                <View style={styles.microInsightBox}>
                  <Sparkles size={14} color={ASBColors.primaryPurple} />
                  <Text style={styles.microInsightText}>
                    {aiData?.interpretation?.slice(0, 140) ||
                      `Soul #${profile.moolank} & Life Path #${profile.bhagyank} grant high alignment for career growth and inner wisdom today.`}
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            {/* 3D Reanimated Core Numbers Section */}
            <Text style={styles.sectionHeading}>CORE NUMEROLOGY TRIANGLE</Text>

            <FlipNumerologyCard
              code="G"
              title="SOUL PURPOSE NUMBER"
              subTitle="Your core spiritual frequency"
              numberValue={profile.moolank}
              traitText={`Number ${profile.moolank}: Spiritual Leader`}
              description={`Soul Number ${profile.moolank} dictates your inner drive, subconscious desires, and baseline vibration.`}
            />

            <FlipNumerologyCard
              code="E"
              title="LIFE PATH NUMBER"
              subTitle="Your daily energy vibration"
              numberValue={profile.bhagyank}
              traitText={`Number ${profile.bhagyank}: Life Blueprint`}
              description={`Life Path ${profile.bhagyank} governs your natural talents, career success, and primary life lessons.`}
            />

            <FlipNumerologyCard
              code="F"
              title="EXPRESSION NUMBER"
              subTitle="Your outer manifestation"
              numberValue={profile.expression}
              traitText={`Number ${profile.expression}: Outer Manifestor`}
              description={`Expression Number ${profile.expression} reflects how others perceive your talent and goals.`}
            />
          </>
        )}

        {/* Real-Time Decision Clock */}
        <VibrationalClock />

        {/* 6 Quick Action Module Grid */}
        <Text style={styles.sectionHeading}>NUMEROLOGY SUITE & TOOLS</Text>

        <View style={styles.moduleGrid}>
          <TouchableOpacity style={styles.moduleCard} onPress={() => router.push('/(tabs)/name')}>
            <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(107, 91, 255, 0.12)' }]}>
              <Compass size={22} color={ASBColors.primaryPurple} />
            </View>
            <Text style={styles.moduleTitle}>Name Check</Text>
            <Text style={styles.moduleDesc}>Chaldean Spelling</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => router.push('/(tabs)/mobile-num')}>
            <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(217, 70, 239, 0.12)' }]}>
              <Smartphone size={22} color={ASBColors.crimsonMagenta} />
            </View>
            <Text style={styles.moduleTitle}>Mobile Harmony</Text>
            <Text style={styles.moduleDesc}>Wealth Pairs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => router.push('/reports/profession')}>
            <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(107, 91, 255, 0.12)' }]}>
              <FileText size={22} color={ASBColors.primaryPurple} />
            </View>
            <Text style={styles.moduleTitle}>Profession</Text>
            <Text style={styles.moduleDesc}>Career & Business</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => router.push('/reports/relationship')}>
            <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(217, 70, 239, 0.12)' }]}>
              <Heart size={22} color={ASBColors.crimsonMagenta} />
            </View>
            <Text style={styles.moduleTitle}>Relationship</Text>
            <Text style={styles.moduleDesc}>Love Match</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => router.push('/reports/swot')}>
            <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(124, 58, 237, 0.12)' }]}>
              <Shield size={22} color={ASBColors.purple700} />
            </View>
            <Text style={styles.moduleTitle}>SWOT Analysis</Text>
            <Text style={styles.moduleDesc}>Strengths & Risks</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.moduleCard} onPress={() => router.push('/reports/pdf-viewer')}>
            <View style={[styles.moduleIconBox, { backgroundColor: 'rgba(107, 91, 255, 0.15)' }]}>
              <FileText size={22} color={ASBColors.primaryPurple} />
            </View>
            <Text style={styles.moduleTitle}>Master PDF</Text>
            <Text style={styles.moduleDesc}>100-Page Report</Text>
          </TouchableOpacity>
        </View>

        {/* Crystal Store CTA */}
        <GlassCard variant="dark" style={styles.ctaCard}>
          <Text style={styles.ctaSub}>DIVINE REMEDIES STORE</Text>
          <Text style={styles.ctaTitle}>Enhance Your Vibrational Energy</Text>
          <Text style={styles.ctaDesc}>Pair your numerical reading with authentic energised crystals & rudraksha.</Text>
          <GradientButton
            title="Explore Crystal Store"
            variant="crystal"
            icon={<ShoppingBag size={18} color="#FFF" />}
            onPress={() => router.push('/marketplace')}
            style={{ marginTop: 12 }}
          />
        </GlassCard>
      </ScrollView>

      {/* Daily 3D Tarot Card Draw Modal */}
      <DailyCardModal
        visible={cardModalVisible}
        onClose={() => setCardModalVisible(false)}
        onDrawComplete={() => addXp(10)}
      />

      {/* Edit DOB Modal */}
      <Modal visible={dobModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Your Date of Birth</Text>
            <Text style={styles.modalSub}>This DOB will be automatically used across all reports & calculators.</Text>
            
            <TextInput
              style={styles.modalInput}
              value={tempDob}
              onChangeText={setTempDob}
              placeholder="DD/MM/YYYY (e.g. 29/10/2001)"
              placeholderTextColor={ASBColors.textMuted}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setDobModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleSaveDob} style={styles.modalSaveBtn}>
                <Text style={styles.modalSaveText}>Save to Profile</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Floating Universal AI Assistant */}
      <AiAssistantSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 90,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLogoImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    resizeMode: 'cover',
  },
  brandTitle: {
    fontSize: 15,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    letterSpacing: 1.5,
  },
  brandSub: {
    fontSize: 10,
    fontFamily: ASBFonts.body,
    color: ASBColors.textMuted,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
  },
  streakText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: '#EF4444',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(107, 91, 255, 0.12)',
    borderRadius: 20,
  },
  profileName: {
    fontSize: 12,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
  },
  loginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: ASBColors.primaryPurple,
    borderRadius: 20,
  },
  loginBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rankBanner: {
    padding: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankTitle: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  drawCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(107, 91, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  drawCardText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
  },
  heroCard: {
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextCol: {
    flex: 1,
  },
  cosmicTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroSub: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: ASBFonts.subheading,
    color: ASBColors.darkNavy,
    marginVertical: 4,
  },
  guestSubtitle: {
    fontSize: 12,
    fontFamily: ASBFonts.body,
    color: ASBColors.textMuted,
    lineHeight: 18,
    marginTop: 4,
  },
  guestFormCard: {
    marginBottom: 16,
    padding: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: ASBColors.darkNavy,
    marginBottom: 8,
  },
  dobBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ASBColors.goodGreenBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  dobText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.goodGreen,
    marginLeft: 4,
  },
  numberBadgeLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ASBColors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ASBColors.primaryPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  numberBadgeValue: {
    fontSize: 22,
    fontFamily: ASBFonts.heading,
    color: '#FFFFFF',
  },
  numberBadgeLabel: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
  },
  energyMeterCard: {
    marginBottom: 16,
    padding: 16,
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  meterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meterTitle: {
    fontSize: 14,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  meterScore: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
  },
  trackBackground: {
    height: 8,
    backgroundColor: 'rgba(107, 91, 255, 0.12)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  trackFill: {
    height: '100%',
    backgroundColor: ASBColors.primaryPurple,
    borderRadius: 4,
  },
  energyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: ASBColors.borderIvory,
    paddingTop: 10,
  },
  energyItem: {
    alignItems: 'center',
  },
  energyLabel: {
    fontSize: 10,
    color: ASBColors.textMuted,
    marginBottom: 2,
  },
  energyVal: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  scoresCard: {
    marginBottom: 20,
    padding: 16,
  },
  scoresTitle: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  scorePill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  pillLabel: {
    fontSize: 10,
    color: ASBColors.textMuted,
    marginBottom: 2,
  },
  pillVal: {
    fontSize: 14,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
  },
  microInsightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F1FF',
    padding: 10,
    borderRadius: 12,
  },
  microInsightText: {
    flex: 1,
    fontSize: 11,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.darkNavy,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.textMuted,
    letterSpacing: 1.5,
    marginVertical: 12,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  moduleCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
    alignItems: 'flex-start',
    gap: 4,
    shadowColor: '#6B5BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 14,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  moduleDesc: {
    fontSize: 11,
    color: ASBColors.textMuted,
  },
  ctaCard: {
    padding: 20,
    marginTop: 8,
  },
  ctaSub: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.crimsonMagenta,
    letterSpacing: 1.5,
  },
  ctaTitle: {
    fontSize: 18,
    fontFamily: ASBFonts.subheading,
    color: '#FFFFFF',
    marginVertical: 4,
  },
  ctaDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: ASBFonts.subheading,
    color: ASBColors.darkNavy,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: ASBColors.textMuted,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: ASBColors.darkNavy,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelText: {
    fontSize: 13,
    color: ASBColors.textMuted,
    fontWeight: '600',
  },
  modalSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: ASBColors.primaryPurple,
    borderRadius: 12,
  },
  modalSaveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
