// mobile-app/src/app/(auth)/login.tsx
// Universal Login Screen (Phone OTP & Email Password)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, Phone, Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal() {
  const router = useRouter();
  const { loginPassword, sendOtp, verifyOtp } = useAuth();

  const [mode, setMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier) {
      alert('Please enter your email or phone number');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'PASSWORD') {
        await loginPassword(identifier, password);
        router.back();
      } else {
        if (!otpSent) {
          await sendOtp(identifier);
          setOtpSent(true);
          alert('OTP sent to your phone/email!');
        } else {
          await verifyOtp(identifier, otp);
          router.back();
        }
      }
    } catch (e: any) {
      alert(e.message || 'Login failed');
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
        <Text style={styles.brandTitle}>ASB NUMEROLOGY</Text>
        <Text style={styles.brandSub}>Single Sign-On (SSO) Portal</Text>
      </View>

      {/* Mode Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => {
            setMode('PASSWORD');
            setOtpSent(false);
          }}
          style={[styles.tabBtn, mode === 'PASSWORD' && styles.tabActive]}
        >
          <Text style={[styles.tabText, mode === 'PASSWORD' && styles.tabTextActive]}>Password Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setMode('OTP');
            setOtpSent(false);
          }}
          style={[styles.tabBtn, mode === 'OTP' && styles.tabActive]}
        >
          <Text style={[styles.tabText, mode === 'OTP' && styles.tabTextActive]}>Phone OTP</Text>
        </TouchableOpacity>
      </View>

      {/* Login Form */}
      <GlassCard style={styles.card}>
        <Text style={styles.inputLabel}>EMAIL OR PHONE NUMBER</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. user@asbreports.in or +919911500291"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          placeholderTextColor={ASBColors.textMuted}
        />

        {mode === 'PASSWORD' && (
          <>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={ASBColors.textMuted}
            />
          </>
        )}

        {mode === 'OTP' && otpSent && (
          <>
            <Text style={styles.inputLabel}>ENTER 6-DIGIT OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              placeholderTextColor={ASBColors.textMuted}
            />
          </>
        )}

        <GradientButton
          title={mode === 'PASSWORD' ? 'Login with Password' : otpSent ? 'Verify OTP & Login' : 'Send OTP Code'}
          variant="primary"
          loading={loading}
          onPress={handleLogin}
          style={{ marginTop: 14 }}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.regLink}>
          <Text style={styles.regLinkText}>Don't have an account? Register here</Text>
        </TouchableOpacity>
      </GlassCard>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: 10,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ASBColors.darkNavy,
    letterSpacing: 1,
  },
  brandSub: {
    fontSize: 12,
    color: ASBColors.textMuted,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: ASBColors.primaryPurple,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.darkNavy,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: ASBColors.darkNavy,
  },
  regLink: {
    alignItems: 'center',
    marginTop: 14,
  },
  regLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
  },
});
