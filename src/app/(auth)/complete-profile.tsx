// mobile-app/src/app/(auth)/complete-profile.tsx
// Complete Profile Screen (Mandatory DOB & Gender after first login)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, User, Calendar, CheckCircle } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDobInput, isValidDob } from '../../utils/dobFormatter';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { user, completeProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [gender, setGender] = useState('Male');
  const [loading, setLoading] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other'];

  const handleDobChange = (text: string) => {
    const formatted = formatDobInput(text);
    setDob(formatted);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast({
        type: 'error',
        title: '✨ Name Required',
        message: 'Please enter your full name to personalize your numerology blueprint.',
      });
      return;
    }

    if (!dob.trim() || !isValidDob(dob)) {
      showToast({
        type: 'error',
        title: '🔮 Birth Date Guidance',
        message: 'Please enter a valid Date of Birth in DD-MM-YYYY format (e.g. 29-10-2001).',
      });
      return;
    }

    setLoading(true);
    try {
      await completeProfile({ name: name.trim(), dob: dob.trim(), gender: gender.toLowerCase() });
      showToast({
        type: 'success',
        title: '✨ Cosmic Profile Unlocked!',
        message: 'Welcome to your personalized ASB Numerology Dashboard.',
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      showToast({
        type: 'error',
        title: '🔮 Profile Save Note',
        message: e.message || 'Could not sync profile right now. Your details have been saved locally.',
      });
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.brandHeader}>
        <View style={styles.logoBadge}>
          <Sparkles size={28} color={ASBColors.sacredGold} />
        </View>
        <Text style={styles.brandTitle}>COMPLETE YOUR PROFILE</Text>
        <Text style={styles.brandSub}>We need your birth details to generate your personalized numerology reports</Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={styles.inputLabel}>FULL NAME *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your Full Name"
          placeholderTextColor={ASBColors.textMuted}
        />

        {user?.phone ? (
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.inputLabel}>REGISTERED PHONE NUMBER</Text>
            <View style={[styles.input, { backgroundColor: '#F3E8FF', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 14, color: ASBColors.darkNavy, fontWeight: '600' }}>{user.phone}</Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.inputLabel}>DATE OF BIRTH (DD-MM-YYYY) *</Text>
        <TextInput
          style={styles.input}
          value={dob}
          onChangeText={handleDobChange}
          placeholder="29-10-2001"
          placeholderTextColor={ASBColors.textMuted}
          keyboardType="number-pad"
          maxLength={10}
        />
        <Text style={styles.helperText}>Format: DD-MM-YYYY (e.g. 29-10-2001)</Text>

        <Text style={styles.inputLabel}>GENDER</Text>
        <View style={styles.genderRow}>
          {genderOptions.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGender(g)}
              style={[styles.genderPill, gender === g && styles.genderPillActive]}
            >
              <Text style={[styles.genderPillText, gender === g && styles.genderPillTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <GradientButton
          title="Save & Generate Cosmic Blueprint"
          variant="gold"
          loading={loading}
          icon={<CheckCircle size={18} color="#FFF" />}
          onPress={handleSave}
          style={{ marginTop: 20 }}
        />
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 14 },
  brandHeader: { alignItems: 'center', marginVertical: 16 },
  logoBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(212,175,55,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  brandTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy, letterSpacing: 1, textAlign: 'center' },
  brandSub: { fontSize: 12, color: ASBColors.textMuted, marginTop: 4, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
  card: { padding: 20 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: ASBColors.darkNavy, letterSpacing: 1, marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ASBColors.borderPurple, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: ASBColors.darkNavy },
  helperText: { fontSize: 10, color: ASBColors.textMuted, marginTop: 4 },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderPill: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: ASBColors.borderPurple, alignItems: 'center', backgroundColor: '#FFFFFF' },
  genderPillActive: { borderColor: ASBColors.primaryPurple, backgroundColor: ASBColors.primaryPurple },
  genderPillText: { fontSize: 13, fontWeight: '700', color: ASBColors.darkNavy },
  genderPillTextActive: { color: '#FFFFFF' },
});
