// mobile-app/src/app/shop/addresses.tsx
// Saved Addresses Management Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Plus, Edit3, Trash2, Home, Briefcase, CheckCircle } from 'lucide-react-native';
import { ASBColors, ASBShadows } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';

export default function AddressesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const [addresses, setAddresses] = useState([
    { _id: '1', label: 'Home', fullName: 'Bhaskar Joshi', line1: 'ASB Spiritual Center, Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', phone: '9911500291', isDefault: true },
    { _id: '2', label: 'Office', fullName: 'Bhaskar Joshi', line1: 'Coworking Hub, Block B', city: 'Gurugram', state: 'Haryana', pincode: '122001', phone: '9911500291', isDefault: false },
  ]);

  const [newLabel, setNewLabel] = useState('Home');
  const [newName, setNewName] = useState(user?.name || '');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newPhone, setNewPhone] = useState(user?.phone || '');

  const handleAddAddress = () => {
    if (!newName || !newLine1 || !newCity || !newPincode) {
      alert('Please fill all required fields');
      return;
    }
    setAddresses((prev) => [
      ...prev,
      {
        _id: Date.now().toString(),
        label: newLabel,
        fullName: newName,
        line1: newLine1,
        city: newCity,
        state: newState,
        pincode: newPincode,
        phone: newPhone,
        isDefault: prev.length === 0,
      },
    ]);
    setShowForm(false);
    setNewLine1('');
    setNewCity('');
    setNewState('');
    setNewPincode('');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Remove this saved address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setAddresses((prev) => prev.filter((a) => a._id !== id)) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Saved Addresses</Text>
      </View>

      {/* Address List */}
      <View style={{ gap: 12 }}>
        {addresses.map((addr) => (
          <GlassCard key={addr._id} style={styles.card}>
            <View style={styles.addrHeader}>
              <View style={styles.labelBadge}>
                {addr.label === 'Home' ? <Home size={14} color={ASBColors.primaryPurple} /> : <Briefcase size={14} color={ASBColors.royalViolet} />}
                <Text style={styles.labelText}>{addr.label}</Text>
              </View>
              {addr.isDefault && (
                <View style={styles.defaultBadge}>
                  <CheckCircle size={12} color={ASBColors.goodGreen} />
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.addrName}>{addr.fullName}</Text>
            <Text style={styles.addrLine}>{addr.line1}</Text>
            <Text style={styles.addrLine}>{addr.city}, {addr.state} - {addr.pincode}</Text>
            <Text style={styles.addrLine}>Phone: {addr.phone}</Text>
            <View style={styles.addrActions}>
              <TouchableOpacity style={styles.actionBtn}><Edit3 size={14} color={ASBColors.primaryPurple} /><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(addr._id)}><Trash2 size={14} color={ASBColors.errorRed} /><Text style={[styles.actionText, { color: ASBColors.errorRed }]}>Delete</Text></TouchableOpacity>
            </View>
          </GlassCard>
        ))}
      </View>

      {/* Add New Address Button or Form */}
      {!showForm ? (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Plus size={18} color={ASBColors.primaryPurple} />
          <Text style={styles.addBtnText}>Add New Address</Text>
        </TouchableOpacity>
      ) : (
        <GlassCard style={styles.card}>
          <Text style={styles.formTitle}>NEW ADDRESS</Text>

          <Text style={styles.inputLabel}>LABEL</Text>
          <View style={styles.labelRow}>
            {['Home', 'Office', 'Other'].map((l) => (
              <TouchableOpacity key={l} onPress={() => setNewLabel(l)} style={[styles.labelPill, newLabel === l && styles.labelPillActive]}>
                <Text style={[styles.labelPillText, newLabel === l && styles.labelPillTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>FULL NAME *</Text>
          <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Name" placeholderTextColor={ASBColors.textMuted} />

          <Text style={styles.inputLabel}>STREET ADDRESS *</Text>
          <TextInput style={styles.input} value={newLine1} onChangeText={setNewLine1} placeholder="House / Flat No, Street" placeholderTextColor={ASBColors.textMuted} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}><Text style={styles.inputLabel}>CITY *</Text><TextInput style={styles.input} value={newCity} onChangeText={setNewCity} placeholder="City" placeholderTextColor={ASBColors.textMuted} /></View>
            <View style={{ flex: 1 }}><Text style={styles.inputLabel}>PINCODE *</Text><TextInput style={styles.input} value={newPincode} onChangeText={setNewPincode} keyboardType="number-pad" placeholder="Pincode" placeholderTextColor={ASBColors.textMuted} /></View>
          </View>

          <Text style={styles.inputLabel}>STATE</Text>
          <TextInput style={styles.input} value={newState} onChangeText={setNewState} placeholder="State" placeholderTextColor={ASBColors.textMuted} />

          <Text style={styles.inputLabel}>PHONE</Text>
          <TextInput style={styles.input} value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" placeholder="Phone" placeholderTextColor={ASBColors.textMuted} />

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <GradientButton title="Save Address" variant="crystal" onPress={handleAddAddress} style={{ flex: 1 }} />
          </View>
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmCream },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 14 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  card: { padding: 14 },
  addrHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  labelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  labelText: { fontSize: 11, fontWeight: '700', color: ASBColors.primaryPurple },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: ASBColors.goodGreenBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  defaultText: { fontSize: 10, fontWeight: '700', color: ASBColors.goodGreen },
  addrName: { fontSize: 14, fontWeight: '700', color: ASBColors.darkNavy },
  addrLine: { fontSize: 12, color: ASBColors.textMuted, lineHeight: 18 },
  addrActions: { flexDirection: 'row', gap: 16, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontWeight: '700', color: ASBColors.primaryPurple },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderWidth: 1.5, borderColor: ASBColors.primaryPurple, borderRadius: 12, borderStyle: 'dashed' },
  addBtnText: { fontSize: 14, fontWeight: '700', color: ASBColors.primaryPurple },
  formTitle: { fontSize: 11, fontWeight: '800', color: ASBColors.darkNavy, letterSpacing: 1, marginBottom: 8 },
  labelRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  labelPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ASBColors.borderPurple },
  labelPillActive: { backgroundColor: ASBColors.primaryPurple, borderColor: ASBColors.primaryPurple },
  labelPillText: { fontSize: 12, fontWeight: '600', color: ASBColors.darkNavy },
  labelPillTextActive: { color: '#FFFFFF' },
  inputLabel: { fontSize: 10, fontWeight: '800', color: ASBColors.darkNavy, letterSpacing: 1, marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: ASBColors.borderPurple, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: ASBColors.darkNavy },
  row: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: ASBColors.textMuted, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '700', color: ASBColors.textMuted },
});
