// mobile-app/src/app/(tabs)/index.tsx
// Astro247-Inspired Home Page (Website Matched Color Theme & Sacred Numerology Tools)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Image, Platform, useWindowDimensions, RefreshControl } from 'react-native';
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
  Flame,
  PhoneCall,
  MessageCircle,
  Sun,
  Star,
  Award,
  Check,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { FlipNumerologyCard } from '../../components/anim/FlipNumerologyCard';
import { DailyCardModal } from '../../components/anim/DailyCardModal';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { reportApi, formatDobForApi } from '../../api/client';
import { AiAssistantSheet } from '../../components/chatbot/AiAssistantSheet';
import { VibrationalClock } from '../../components/common/VibrationalClock';
import { calculateNumerologyProfile } from '../../utils/numerologyMath';
import { formatDobInput, isValidDob, getLuckyColor } from '../../utils/dobFormatter';
import { NotificationBell } from '../../components/notification/NotificationBell';
import { useStreak } from '../../hooks/useStreak';
import { useToast } from '../../context/ToastContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getGuestProfile, saveGuestProfile } from '../../utils/guestStorage';

export default function DashboardScreen() {
  const { user, isAuthenticated, updateDob } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Habit Streak Hook
  const { streakDays, addXp } = useStreak();

  // Guest vs Logged-In User Profile
  const [guestName, setGuestName] = useState('');
  const [guestDob, setGuestDob] = useState('');
  const [guestCalculated, setGuestCalculated] = useState(false);
  const [cardModalVisible, setCardModalVisible] = useState(false);

  React.useEffect(() => {
    getGuestProfile().then((g) => {
      if (g.name && !guestName) setGuestName(g.name);
      if (g.dob && !guestDob) setGuestDob(g.dob);
    });
  }, []);

  const effectiveName = isAuthenticated ? (user?.name && user.name.length > 2 && user.name.toLowerCase() !== 'uikjhd' ? user.name : '') : (guestName || '');
  const effectiveDob = isAuthenticated ? (user?.dob || '') : guestDob;

  const [dobModalVisible, setDobModalVisible] = useState(false);
  const [tempDob, setTempDob] = useState(effectiveDob);

  // 100% Real Dynamic Numerology Calculations
  const profile = calculateNumerologyProfile(effectiveDob, effectiveName);

  const handleSaveDob = async () => {
    if (tempDob.trim()) {
      if (isAuthenticated) {
        await updateDob(tempDob.trim());
      } else {
        setGuestDob(tempDob.trim());
        saveGuestProfile(guestName, tempDob.trim());
      }
      setDobModalVisible(false);
      showToast({ type: 'success', title: 'DOB Saved', message: 'Your birth details have been updated.' });
    }
  };

  const scrollViewRef = React.useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleGuestCalculate = () => {
    if (!guestName.trim()) {
      showToast({ type: 'error', title: '✨ Name Required', message: 'Please enter your name to personalize your cosmic blueprint.' });
      return;
    }
    if (!guestDob.trim() || !isValidDob(guestDob)) {
      showToast({ type: 'error', title: '🔮 Birth Date Guidance', message: 'Please enter a valid Date of Birth in DD-MM-YYYY format (e.g. 15-08-1995).' });
      return;
    }
    saveGuestProfile(guestName.trim(), guestDob.trim());
    setGuestCalculated(true);
    addXp(10);
    showToast({ type: 'success', title: '✨ Cosmic Blueprint Unlocked!', message: 'Navigating to your Sacred Chaldean Geometry & Mystical Triangle report...' });
    
    setTimeout(() => {
      router.push('/reports/mystical-triangle');
    }, 600);
  };

  // Daily Astro247 Mantras & Guidance
  const dailyMantras = [
    'Om Namah Shivaya - Inner Balance & Strength',
    'Om Shreem Mahalakshmiyei Namaha - Prosperity & Wealth',
    'Om Gam Ganapataye Namaha - Removal of Obstacles',
  ];
  const mantraOfDay = dailyMantras[profile.moolank % dailyMantras.length];

  return (
    <View style={{ flex: 1, backgroundColor: ASBColors.bgWarmIvory }}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(16, insets.top + 8), paddingBottom: Math.max(40, insets.bottom + 20) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={ASBColors.primaryPurple} />
        }
      >
        {/* Header Bar with ASB Logo (Top-Left 40x40), Streak & Profile */}
        <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.duration(600) : undefined} style={styles.headerBar}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/images/asb_logo.jpg')}
              style={styles.headerLogoImg}
              resizeMode="cover"
            />
            <View>
              <Text style={styles.brandTitle}>ASB NUMEROLOGY</Text>
              <Text style={styles.brandSub}>Sacred Cosmic Engine</Text>
            </View>
          </View>

          {/* Streak, Notification & Auth Badges */}
          <View style={styles.headerRightRow}>
            <NotificationBell />

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
            <View style={styles.singleLineBanner}>
              <Sparkles size={14} color={ASBColors.primaryPurple} />
              <Text style={styles.singleLineBannerText}>Discover Your Numerology — Calculate Soul & Life Path Numbers</Text>
            </View>

            <GlassCard style={styles.guestFormCard}>
              <Text style={styles.inputLabel}>YOUR FULL NAME</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. John Doe"
                value={guestName}
                onChangeText={setGuestName}
                placeholderTextColor={ASBColors.textMuted}
              />

              <Text style={styles.inputLabel}>DATE OF BIRTH (DD-MM-YYYY)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 15-08-1995"
                value={guestDob}
                onChangeText={(text) => setGuestDob(formatDobInput(text))}
                placeholderTextColor={ASBColors.textMuted}
                keyboardType="number-pad"
                maxLength={10}
              />

              <GradientButton
                title="Calculate My Cosmic Numbers"
                icon={<Sparkles size={18} color="#FFFFFF" />}
                onPress={handleGuestCalculate}
                style={{ marginTop: 12 }}
              />
            </GlassCard>
          </>
        ) : (
          /* LOGGED-IN DASHBOARD HERO (Sleek Consolidated Blueprint & Daily Guidance) */
          <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.delay(100).duration(600) : undefined}>
            <GlassCard variant="purple" style={styles.sleekHeroCard}>
              <View style={styles.sleekHeroTop}>
                <View style={{ flex: 1 }}>
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
                    <CheckCircle size={13} color={effectiveDob ? ASBColors.goodGreen : ASBColors.crimsonMagenta} />
                    <Text style={styles.dobText}>{effectiveDob ? `DOB: ${effectiveDob}` : 'Set Your Birth Date'}</Text>
                    <Edit3 size={11} color={ASBColors.textMuted} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>

                {/* Soul & Destiny Number Pill Badges */}
                <View style={styles.soulBadgeContainer}>
                  <View style={styles.soulBadgeCircle}>
                    <Text style={styles.soulBadgeValue}>{profile.moolank}</Text>
                    <Text style={styles.soulBadgeLabel}>Soul</Text>
                  </View>

                  <View style={[styles.soulBadgeCircle, { backgroundColor: '#FDF4FF' }]}>
                    <Text style={[styles.soulBadgeValue, { color: ASBColors.crimsonMagenta }]}>{profile.bhagyank}</Text>
                    <Text style={styles.soulBadgeLabel}>Path</Text>
                  </View>
                </View>
              </View>

              {/* Compact Daily Guidance Row */}
              <View style={styles.compactGuidanceBar}>
                <View style={styles.compactGuidanceItem}>
                  <Text style={styles.compactGuidanceLabel}>LUCKY</Text>
                  <Text style={styles.compactGuidanceVal}>{profile.moolank} & {profile.bhagyank}</Text>
                </View>
                <View style={styles.compactDivider} />
                <View style={styles.compactGuidanceItem}>
                  <Text style={styles.compactGuidanceLabel}>COLOR</Text>
                  <Text style={styles.compactGuidanceVal}>{getLuckyColor(profile.moolank)}</Text>
                </View>
                <View style={styles.compactDivider} />
                <View style={styles.compactGuidanceItem}>
                  <Text style={styles.compactGuidanceLabel}>YEAR</Text>
                  <Text style={styles.compactGuidanceVal}>Year #{profile.personalYear}</Text>
                </View>
              </View>

              {/* Compact Daily Mantra Line */}
              <View style={styles.compactMantraBox}>
                <Sun size={12} color={ASBColors.primaryPurple} />
                <Text style={styles.compactMantraText} numberOfLines={1}>{mantraOfDay}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* NUMEROLOGY SUITE & TOOLS GRID */}
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

        {/* ASTRO247 FEATURE 1: Live Astrologer & Numerologist Consult Banner */}
        <GlassCard variant="purple" style={styles.consultBanner}>
          <View style={styles.consultRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTagText}>LIVE NUMEROLOGIST CONSULT</Text>
              </View>
              <Text style={styles.consultTitle}>Talk or Chat with ASB Masters</Text>
              <Text style={styles.consultSub}>Instant 1-on-1 Guidance on Career, Marriage & Wealth</Text>
            </View>
            <TouchableOpacity
              style={styles.consultBtn}
              onPress={() => router.push('/tools/consult-booking')}
            >
              <PhoneCall size={16} color="#FFFFFF" />
              <Text style={styles.consultBtnText}>Connect Now</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* CRYSTAL REMEDIES STORE CTA */}
        <GlassCard variant="dark" style={styles.ctaCard}>
          <Text style={styles.ctaSub}>DIVINE REMEDIES STORE</Text>
          <Text style={styles.ctaTitle}>Enhance Your Vibrational Energy</Text>
          <Text style={styles.ctaDesc}>Pair your numerical reading with authentic energised crystals & rudraksha.</Text>
          <GradientButton
            title="Explore Crystal Store"
            variant="crystal"
            icon={<ShoppingBag size={18} color="#FFF" />}
            onPress={() => router.push('/(tabs)/marketplace' as any)}
            style={{ marginTop: 12 }}
          />
        </GlassCard>

        {/* REAL-TIME VIBRATIONAL DECISION CLOCK SHIFTED TO BOTTOM */}
        <VibrationalClock />

        {/* Disclaimer */}
        <TouchableOpacity
          onPress={() => router.push('/info/disclaimer' as any)}
          style={{ marginTop: 24, marginBottom: 8, alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 11, color: ASBColors.textMuted, textAlign: 'center', fontStyle: 'italic' }}>
            🌸 Disclaimer: For personal guidance & self-growth.{' '}
            <Text style={{ color: ASBColors.primaryPurple, fontWeight: '700', textDecorationLine: 'underline' }}>
              Read Full Legal Disclaimer
            </Text>
          </Text>
        </TouchableOpacity>
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
              onChangeText={(t) => setTempDob(formatDobInput(t))}
              placeholder="DD-MM-YYYY (e.g. 11-04-2004)"
              placeholderTextColor={ASBColors.textMuted}
              keyboardType="number-pad"
              maxLength={10}
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
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    width: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  headerLogoImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    gap: 6,
    flexShrink: 0,
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
    paddingVertical: 5,
    backgroundColor: 'rgba(107, 91, 255, 0.12)',
    borderRadius: 14,
  },
  profileName: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
  },
  loginBtn: {
    backgroundColor: ASBColors.primaryPurple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
  },
  consultBanner: {
    marginBottom: 14,
    padding: 14,
  },
  consultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveTagText: {
    fontSize: 9,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    letterSpacing: 1,
  },
  consultTitle: {
    fontSize: 14,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
  },
  consultSub: {
    fontSize: 10,
    color: ASBColors.textMuted,
    marginTop: 2,
  },
  consultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ASBColors.primaryPurple,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  consultBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  singleLineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  singleLineBannerText: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    flex: 1,
  },
  sleekHeroCard: {
    marginBottom: 14,
    padding: 14,
  },
  sleekHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  soulBadgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  soulBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  soulBadgeValue: {
    fontSize: 16,
    fontFamily: ASBFonts.heading,
    color: ASBColors.primaryPurple,
    lineHeight: 18,
  },
  soulBadgeLabel: {
    fontSize: 8,
    color: ASBColors.textMuted,
    marginTop: -2,
  },
  compactGuidanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    marginBottom: 10,
  },
  compactGuidanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  compactGuidanceLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: ASBColors.textMuted,
    letterSpacing: 0.5,
  },
  compactGuidanceVal: {
    fontSize: 11,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
    marginTop: 1,
  },
  compactDivider: {
    width: 1,
    height: 20,
    backgroundColor: ASBColors.borderPurple,
  },
  compactMantraBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  compactMantraText: {
    fontSize: 10,
    fontWeight: '600',
    color: ASBColors.primaryPurple,
    flex: 1,
  },
  heroCard: {
    marginBottom: 14,
    padding: 16,
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
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    marginVertical: 4,
  },
  guestSubtitle: {
    fontSize: 12,
    color: ASBColors.textMuted,
    lineHeight: 16,
  },
  guestFormCard: {
    marginBottom: 14,
    padding: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.darkNavy,
    letterSpacing: 1,
    marginTop: 6,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: ASBColors.darkNavy,
  },
  dobBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dobText: {
    fontSize: 11,
    color: ASBColors.darkNavy,
  },
  numberBadgeLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  numberBadgeValue: {
    fontSize: 22,
    fontFamily: ASBFonts.heading,
    color: ASBColors.primaryPurple,
  },
  numberBadgeLabel: {
    fontSize: 9,
    color: ASBColors.textMuted,
  },
  dailyInsightsCard: {
    marginBottom: 14,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dailyTitle: {
    fontSize: 12,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    letterSpacing: 1,
  },
  insightGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  insightItem: {
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: ASBColors.textMuted,
    letterSpacing: 0.5,
  },
  insightVal: {
    fontSize: 13,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
    marginTop: 2,
  },
  mantraBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3E8FF',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  mantraText: {
    fontSize: 11,
    fontWeight: '600',
    color: ASBColors.primaryPurple,
    flex: 1,
  },
  sectionHeading: {
    fontSize: 13,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    letterSpacing: 1.5,
    marginTop: 14,
    marginBottom: 10,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  moduleCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    marginBottom: 2,
  },
  moduleIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  moduleDesc: {
    fontSize: 11,
    color: ASBColors.textMuted,
    marginTop: 2,
  },
  ctaCard: {
    padding: 16,
    marginBottom: 20,
  },
  ctaSub: {
    fontSize: 10,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    letterSpacing: 1,
  },
  ctaTitle: {
    fontSize: 16,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    marginVertical: 4,
  },
  ctaDesc: {
    fontSize: 12,
    color: ASBColors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  modalSub: {
    fontSize: 12,
    color: ASBColors.textMuted,
    marginVertical: 8,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: ASBColors.darkNavy,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  modalCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 12,
    color: ASBColors.textMuted,
  },
  modalSaveBtn: {
    backgroundColor: ASBColors.primaryPurple,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
