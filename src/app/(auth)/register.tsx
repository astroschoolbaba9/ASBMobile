// mobile-app/src/app/(auth)/register.tsx
// Registration Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerPassword } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStrength = () => {
    if (password.length === 0) return { label: '', color: 'transparent', width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: '#EF4444', width: '30%' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password))
      return { label: 'Strong', color: ASBColors.goodGreen, width: '100%' };
    return { label: 'Good', color: '#10B981', width: '75%' };
  };

  const strength = getStrength();

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      showToast({ type: 'error', title: '✨ Account Details Needed', message: 'Please fill in your name, email, phone, and password to create your account.' });
      return;
    }
    if (password !== confirmPwd) {
      showToast({ type: 'error', title: '🌸 Password Re-Entry', message: 'Passwords do not match. Please re-enter your password carefully.' });
      return;
    }
    if (!termsAccepted) {
      showToast({ type: 'error', title: '📜 Terms & Privacy Note', message: 'Please accept our Terms of Service & Privacy Policy to join the ASB community.' });
      return;
    }

    setLoading(true);
    try {
      await registerPassword({ name, email, phone, password });
      showToast({ type: 'success', title: '✨ Account Created!', message: 'Welcome to the ASB Numerology Cosmic Community.' });
      router.replace('/(auth)/complete-profile');
    } catch (e: any) {
      const msg = e.userFriendlyMessage || e.response?.data?.detail || e.response?.data?.message || e.message || 'Could not register account. Please check your network and try again.';
      showToast({ type: 'error', title: '🔮 Registration Guidance', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <ArrowLeft size={20} color={ASBColors.darkNavy} />
      </TouchableOpacity>

      <View style={styles.brandHeader}>
        <View style={styles.logoBadge}>
          <Sparkles size={24} color={ASBColors.sacredGold} />
        </View>
        <Text style={styles.brandTitle}>CREATE ACCOUNT</Text>
        <Text style={styles.brandSub}>Join the ASB Numerology Cosmic Community</Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={styles.inputLabel}>FULL NAME *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your Full Name" placeholderTextColor={ASBColors.textMuted} />

        <Text style={styles.inputLabel}>EMAIL ADDRESS *</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="user@example.com" placeholderTextColor={ASBColors.textMuted} />

        <Text style={styles.inputLabel}>PHONE NUMBER *</Text>
        <View style={styles.phoneRow}>
          <View style={styles.prefixBox}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput style={[styles.input, { flex: 1 }]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} placeholder="9911500291" placeholderTextColor={ASBColors.textMuted} />
        </View>

        <Text style={styles.inputLabel}>PASSWORD *</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Min 6 characters" placeholderTextColor={ASBColors.textMuted} />

        {password.length > 0 && (
          <View style={styles.strengthRow}>
            <View style={styles.strengthTrack}>
              <View style={[styles.strengthFill, { width: strength.width as any, backgroundColor: strength.color }]} />
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
          </View>
        )}

        <Text style={styles.inputLabel}>CONFIRM PASSWORD *</Text>
        <TextInput style={styles.input} value={confirmPwd} onChangeText={setConfirmPwd} secureTextEntry placeholder="Re-enter password" placeholderTextColor={ASBColors.textMuted} />

        {/* Google Play Console Compliant Prominent Data Disclosure Box */}
        <View style={styles.playDisclosureBox}>
          <Text style={styles.playDisclosureText}>
            🔒 <Text style={{ fontWeight: '700' }}>Google Play Privacy Disclosure:</Text> ASB collects your Name, Email, Phone Number, and Date of Birth solely to provide personalized numerology calculations and account security as detailed in our{' '}
            <Text style={styles.link} onPress={() => router.push('/info/privacy' as any)}>
              Privacy Policy
            </Text>
            . We never sell your personal data.
          </Text>
        </View>

        {/* Terms Checkbox */}
        <View style={styles.termsRow}>
          <TouchableOpacity onPress={() => setTermsAccepted(!termsAccepted)} style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <CheckCircle size={14} color="#FFFFFF" />}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I am 18+ and agree to the{' '}
            <Text style={styles.link} onPress={() => router.push('/info/terms' as any)}>
              Terms of Service
            </Text>
            ,{' '}
            <Text style={styles.link} onPress={() => router.push('/info/privacy' as any)}>
              Privacy Policy
            </Text>{' '}
            &{' '}
            <Text style={styles.link} onPress={() => router.push('/info/disclaimer' as any)}>
              Legal Disclaimer
            </Text>
          </Text>
        </View>

        <GradientButton
          title="Create Account"
          variant="primary"
          loading={loading}
          onPress={handleRegister}
          style={{ marginTop: 14 }}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Already have an account? Login here</Text>
        </TouchableOpacity>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  brandHeader: { alignItems: 'center', marginVertical: 10 },
  logoBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  brandTitle: { fontSize: 20, fontWeight: '700', color: ASBColors.darkNavy, letterSpacing: 1 },
  brandSub: { fontSize: 12, color: ASBColors.textMuted, marginTop: 2 },
  card: { padding: 16 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: ASBColors.darkNavy, letterSpacing: 1, marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ASBColors.borderPurple, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: ASBColors.darkNavy },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prefixBox: { backgroundColor: '#F3E8FF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: ASBColors.borderPurple },
  prefixText: { fontSize: 14, fontWeight: '700', color: ASBColors.primaryPurple },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  strengthTrack: { flex: 1, height: 4, backgroundColor: '#F3E8FF', borderRadius: 2, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '700' },
  playDisclosureBox: { backgroundColor: 'rgba(139, 92, 246, 0.06)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: ASBColors.borderPurple, marginTop: 14 },
  playDisclosureText: { fontSize: 11, color: ASBColors.darkNavy, lineHeight: 16 },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: ASBColors.borderPurple, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: ASBColors.primaryPurple, borderColor: ASBColors.primaryPurple },
  termsText: { fontSize: 12, color: ASBColors.darkNavy, flex: 1 },
  link: { color: ASBColors.primaryPurple, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 14 },
  loginLinkText: { fontSize: 12, fontWeight: '700', color: ASBColors.primaryPurple },
});
