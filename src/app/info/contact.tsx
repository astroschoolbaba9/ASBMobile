// mobile-app/src/app/info/contact.tsx
// Contact Us Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, Mail, MessageCircle, MapPin, Send } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useToast } from '../../context/ToastContext';
import { crystalApi } from '../../api/client';

export default function ContactScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!name || !message) {
      showToast({ type: 'error', title: 'Missing Message Details', message: 'Please enter your Name and Message content.' });
      return;
    }
    setLoading(true);

    try {
      await crystalApi.post('/api/contact', { name, email, message });
    } catch (e) {
      console.warn('Contact API fallback to mailto:', e);
      const subject = encodeURIComponent(`Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      Linking.openURL(`mailto:support@asbcrystal.in?subject=${subject}&body=${body}`);
    } finally {
      setLoading(false);
      setSent(true);
      showToast({ type: 'success', title: 'Message Sent', message: 'Thank you! Our support team will respond shortly.' });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Contact Us</Text>
      </View>

      {/* Quick Contact Cards */}
      <GlassCard style={styles.card}>
        <Text style={styles.secTitle}>REACH US DIRECTLY</Text>

        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:+919911500291')}>
          <View style={styles.iconCircle}><Phone size={18} color={ASBColors.primaryPurple} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>Phone / WhatsApp</Text>
            <Text style={styles.contactVal}>+91-9911500291</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('mailto:support@asbcrystal.in')}>
          <View style={styles.iconCircle}><Mail size={18} color={ASBColors.crimsonMagenta} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>Email Support</Text>
            <Text style={styles.contactVal}>support@asbcrystal.in</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('https://wa.me/919911500291')}>
          <View style={styles.iconCircle}><MessageCircle size={18} color="#25D366" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>WhatsApp Chat</Text>
            <Text style={styles.contactVal}>Quick Response in 30 minutes</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.contactRow}>
          <View style={styles.iconCircle}><MapPin size={18} color={ASBColors.sacredGold} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactLabel}>Office Address</Text>
            <Text style={styles.contactVal}>ASB Spiritual Center, Sector 62, Noida, UP 201301</Text>
          </View>
        </View>
      </GlassCard>

      {/* Contact Form */}
      <GlassCard style={styles.card}>
        <Text style={styles.secTitle}>SEND US A MESSAGE</Text>

        {sent ? (
          <View style={styles.sentBox}>
            <Send size={32} color={ASBColors.goodGreen} />
            <Text style={styles.sentTitle}>Message Sent!</Text>
            <Text style={styles.sentSub}>Our team will respond within 24 hours to your email.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.inputLabel}>YOUR NAME</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" placeholderTextColor={ASBColors.textMuted} />

            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Email" placeholderTextColor={ASBColors.textMuted} />

            <Text style={styles.inputLabel}>YOUR MESSAGE</Text>
            <TextInput style={[styles.input, { height: 80 }]} value={message} onChangeText={setMessage} multiline placeholder="How can we help you?" placeholderTextColor={ASBColors.textMuted} />

            <GradientButton title="Send Message" variant="primary" icon={<Send size={16} color="#FFF" />} onPress={handleSend} style={{ marginTop: 12 }} />
          </>
        )}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 14 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  card: { padding: 16 },
  secTitle: { fontSize: 11, fontWeight: '800', color: ASBColors.darkNavy, letterSpacing: 1, marginBottom: 10 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3E8FF' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FAF5FF', alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 12, fontWeight: '600', color: ASBColors.textMuted },
  contactVal: { fontSize: 13, fontWeight: '600', color: ASBColors.darkNavy },
  inputLabel: { fontSize: 10, fontWeight: '800', color: ASBColors.darkNavy, letterSpacing: 1, marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ASBColors.borderPurple, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: ASBColors.darkNavy },
  sentBox: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  sentTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  sentSub: { fontSize: 12, color: ASBColors.textMuted, textAlign: 'center' },
});
