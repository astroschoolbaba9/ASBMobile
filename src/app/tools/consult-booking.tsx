// mobile-app/src/app/tools/consult-booking.tsx
// 1-on-1 Consultation Booking Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserCheck, Calendar, Phone, Mail, CheckCircle, MessageCircle } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reportApi, crystalApi } from '../../api/client';

export default function ConsultBookingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [topic, setTopic] = useState('Business & Career Growth');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleBooking = async () => {
    if (!name || !phone) {
      showToast({ type: 'error', title: 'Missing Contact Details', message: 'Please enter your Name and Phone Number.' });
      return;
    }
    setLoading(true);

    try {
      await crystalApi.post('/api/contact', {
        name: name.trim(),
        email: email.trim() || 'consultation@asbapp.com',
        phone: phone.trim(),
        subject: `📅 1-on-1 Consultation: ${topic || 'General Numerology'}`,
        message: `Client DOB: ${dob || 'Not provided'}.\nConsultation Focus: ${topic || 'Numerology & Remedies Guidance'}.\nSubmitted via Mobile App.`,
      });
    } catch (e) {
      console.warn('Consultation submission API warning:', e);
    } finally {
      setLoading(false);
      setBooked(true);
      showToast({
        type: 'success',
        title: 'Booking Request Received',
        message: 'Your consultation lead has been sent to our senior numerologists.',
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Book 1-on-1 Consultation</Text>
      </View>

      <GlassCard variant="gold" style={styles.card}>
        <View style={styles.row}>
          <UserCheck size={28} color={ASBColors.sacredGold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.goldTag}>EXPERT GUIDANCE</Text>
            <Text style={styles.goldTitle}>Private Session with Senior Numerologist</Text>
          </View>
        </View>
      </GlassCard>

      {booked ? (
        <GlassCard style={styles.card}>
          <View style={styles.successBox}>
            <CheckCircle size={32} color={ASBColors.goodGreen} />
            <Text style={styles.successTitle}>Consultation Booking Requested!</Text>
            <Text style={styles.successDesc}>
              Our consultation coordinator will contact you via WhatsApp / Phone at {phone} within 2 hours to confirm your time slot.
            </Text>
            <GradientButton
              title="Chat Now on WhatsApp"
              variant="primary"
              icon={<MessageCircle size={18} color="#FFF" />}
              onPress={() => {
                const msg = encodeURIComponent(`Namaste, I have booked a 1-on-1 consultation session for ${name} (Phone: ${phone}, Topic: ${topic}). Please confirm my time slot.`);
                Linking.openURL(`https://wa.me/919911500291?text=${msg}`);
              }}
              style={{ marginTop: 14 }}
            />
          </View>
        </GlassCard>
      ) : (
        <GlassCard style={styles.card}>
          <Text style={styles.inputLabel}>YOUR FULL NAME</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" />

          <Text style={styles.inputLabel}>PHONE NUMBER (WHATSAPP)</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone" />

          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Email" />

          <Text style={styles.inputLabel}>DATE OF BIRTH (DD-MM-YYYY)</Text>
          <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="DOB" />

          <Text style={styles.inputLabel}>PRIMARY CONSULTATION TOPIC</Text>
          <TextInput style={styles.input} value={topic} onChangeText={setTopic} placeholder="Topic" />

          <GradientButton
            title="Schedule Consultation Session"
            variant="primary"
            loading={loading}
            icon={<UserCheck size={18} color="#FFF" />}
            onPress={handleBooking}
            style={{ marginTop: 14 }}
          />
        </GlassCard>
      )}

      {/* Official ASB Social Channels */}
      <GlassCard variant="purple" style={styles.card}>
        <Text style={styles.inputLabel}>CONNECT WITH ASB NUMEROLOGY</Text>
        <Text style={{ fontSize: 12, color: ASBColors.textMuted, marginBottom: 12 }}>
          Follow our official social media channels for daily cosmic reports, numerology tips & live Q&A sessions:
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: '#E1306C' }]}
            onPress={() => Linking.openURL('https://www.instagram.com/astroschoolbaba/')}
          >
            <Text style={styles.socialBtnText}>📸 Instagram</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: '#1877F2' }]}
            onPress={() => Linking.openURL('https://www.facebook.com/astroschoolbaba/')}
          >
            <Text style={styles.socialBtnText}>📘 Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: '#25D366' }]}
            onPress={() => Linking.openURL('https://wa.me/919911500291')}
          >
            <Text style={styles.socialBtnText}>💬 WhatsApp</Text>
          </TouchableOpacity>
        </View>
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
    borderColor: ASBColors.borderPurple,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  card: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goldTag: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.sacredGold,
    letterSpacing: 1,
  },
  goldTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ASBColors.darkNavy,
    marginTop: 2,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: ASBColors.darkNavy,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ASBColors.darkNavy,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 13,
    color: ASBColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  socialBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 100,
  },
  socialBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
