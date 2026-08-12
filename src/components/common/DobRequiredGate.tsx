// mobile-app/src/components/common/DobRequiredGate.tsx
// Gates report content behind DOB entry — no more dummy data

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Sparkles, Calendar, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ASBColors, ASBFonts } from '../../theme/tokens';
import { GlassCard } from './GlassCard';
import { GradientButton } from './GradientButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDobInput, isValidDob } from '../../utils/dobFormatter';

interface DobRequiredGateProps {
  children: React.ReactNode;
  /** Title shown on the gate screen, e.g. "Profession Report" */
  reportTitle?: string;
}

export function DobRequiredGate({ children, reportTitle = 'Report' }: DobRequiredGateProps) {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [inputName, setInputName] = useState(user?.name || '');
  const [inputDob, setInputDob] = useState(user?.dob || '');
  const [guestUnlocked, setGuestUnlocked] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasDob = !!((isAuthenticated && user?.dob && user.dob.length >= 8) || guestUnlocked);

  if (hasDob) {
    return <>{children}</>;
  }

  const handleDobChange = (text: string) => {
    const formatted = formatDobInput(text);
    setInputDob(formatted);
  };

  const handleSubmit = async () => {
    if (!inputName.trim()) {
      showToast({
        type: 'error',
        title: '✨ Name Required',
        message: 'Please enter your full name to personalize your numerology report.',
      });
      return;
    }
    if (!inputDob.trim() || !isValidDob(inputDob)) {
      showToast({
        type: 'error',
        title: '🔮 Birth Date Guidance',
        message: 'Please enter a valid Date of Birth in DD-MM-YYYY format (e.g. 15-08-1995).',
      });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ name: inputName.trim(), dob: inputDob.trim() });
      setGuestUnlocked(true);
      showToast({
        type: 'success',
        title: '✨ Report Unlocked!',
        message: `Calculating your personalized ${reportTitle}...`,
      });
    } catch (e) {
      console.warn('Profile update error:', e);
      setGuestUnlocked(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{reportTitle}</Text>
      </View>

      {/* Gate Card */}
      <GlassCard variant="purple" style={styles.gateCard}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Calendar size={32} color={ASBColors.primaryPurple} />
          </View>
        </View>

        <Text style={styles.gateTitle}>Unlock Your Cosmic Blueprint</Text>
        <Text style={styles.gateSubtitle}>
          Enter your real date of birth to generate an accurate, personalized {reportTitle.toLowerCase()} based on your unique numerological vibrations.
        </Text>

        <Text style={styles.inputLabel}>YOUR FULL NAME</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your full name"
          value={inputName}
          onChangeText={setInputName}
          placeholderTextColor={ASBColors.textMuted}
        />

        <Text style={styles.inputLabel}>DATE OF BIRTH (DD/MM/YYYY)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 15-08-1995"
          value={inputDob}
          onChangeText={handleDobChange}
          placeholderTextColor={ASBColors.textMuted}
          keyboardType="number-pad"
          maxLength={10}
        />

        <GradientButton
          title={saving ? 'Saving...' : 'Unlock My Report'}
          icon={<Sparkles size={18} color="#FFFFFF" />}
          onPress={handleSubmit}
          style={{ marginTop: 16 }}
        />

        {!isAuthenticated && (
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? Log in for instant access
            </Text>
          </TouchableOpacity>
        )}
      </GlassCard>

      {/* Trust note */}
      <View style={styles.trustNote}>
        <Sparkles size={14} color={ASBColors.primaryPurple} />
        <Text style={styles.trustText}>
          Your data is used only for numerological calculations and is never shared.
        </Text>
      </View>
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
    maxWidth: 600,
    alignSelf: 'center' as any,
    width: '100%',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
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
  gateCard: {
    padding: 24,
    alignItems: 'center' as any,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(107, 91, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateTitle: {
    fontSize: 20,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    textAlign: 'center' as any,
    marginBottom: 8,
  },
  gateSubtitle: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.textMuted,
    textAlign: 'center' as any,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    letterSpacing: 1,
    marginBottom: 6,
    alignSelf: 'flex-start' as any,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.darkNavy,
    borderWidth: 1.5,
    borderColor: ASBColors.borderIvory,
    marginBottom: 14,
  },
  loginLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  loginLinkText: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.primaryPurple,
    textAlign: 'center' as any,
    textDecorationLine: 'underline',
  },
  trustNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 8,
  },
  trustText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.textMuted,
    flex: 1,
  },
});
