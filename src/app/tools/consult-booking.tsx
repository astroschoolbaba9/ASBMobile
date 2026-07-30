// mobile-app/src/app/tools/consult-booking.tsx
// 1-on-1 Consultation Booking Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserCheck, Calendar, Phone, Mail, CheckCircle } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';

export default function ConsultBookingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.dob || '29-10-2001');
  const [topic, setTopic] = useState('Business & Career Growth');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleBooking = () => {
    if (!name || !phone) {
      alert('Please enter your Name and Phone Number');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBooked(true);
    }, 1000);
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
});
