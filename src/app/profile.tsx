// mobile-app/src/app/profile.tsx
// User Profile & Account Settings Screen (Full Edit & Real Sync)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Phone, Calendar, CreditCard, Edit3, LogOut, Package, Gift, BookOpen, FileText, ShieldCheck, X, Check } from 'lucide-react-native';
import { ASBColors, ASBFonts, ASBShadows } from '../theme/tokens';
import { GlassCard } from '../components/common/GlassCard';
import { GradientButton } from '../components/common/GradientButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api/client';
import { calculateNumerologyProfile } from '../utils/numerologyMath';
import { formatDobInput, isValidDob } from '../utils/dobFormatter';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated, updateProfile } = useAuth();
  const { showToast } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editDob, setEditDob] = useState(user?.dob || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editGender, setEditGender] = useState(user?.gender || 'male');
  const [saving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch profile bulletins
  const { data: bulletins } = useQuery({
    queryKey: ['profile-bulletins', user?.dob],
    queryFn: async () => {
      if (!user?.dob) return [];
      try {
        const res = await reportApi.get('/api/numerology/profile-bulletins.json', { params: { dob: user.dob } });
        return res.data?.bulletins || [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!user?.dob,
  });

  const handleSaveProfile = async () => {
    if (editDob && !isValidDob(editDob)) {
      showToast({
        type: 'error',
        title: '🔮 Birth Date Guidance',
        message: 'Please enter a valid Date of Birth in DD/MM/YYYY format (e.g. 29/10/2001).',
      });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: editName.trim(),
        dob: editDob.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        gender: editGender,
      });
      setEditing(false);
      showToast({ type: 'success', title: 'Profile Saved', message: 'Your account details have been updated.' });
    } catch (e) {
      showToast({ type: 'error', title: 'Save Failed', message: 'Could not update profile details. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    showToast({ type: 'info', title: 'Logged Out', message: 'You have been signed out of your account.' });
    router.replace('/(tabs)');
  };

  if (!isAuthenticated) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={ASBColors.darkNavy} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Profile</Text>
        </View>
        <GlassCard style={styles.emptyCard}>
          <User size={48} color={ASBColors.textMuted} />
          <Text style={styles.emptyTitle}>Not Logged In</Text>
          <Text style={styles.emptySub}>Sign in to view your profile, orders, and cosmic data.</Text>
          <GradientButton title="Login / Register" variant="primary" onPress={() => router.push('/(auth)/login')} style={{ marginTop: 14 }} />
        </GlassCard>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Profile</Text>
      </View>

      {/* Profile Header Card */}
      <GlassCard variant="gold" style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={32} color={ASBColors.sacredGold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userRole}>{user?.role === 'admin' ? 'Admin' : 'Member'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setEditName(user?.name || '');
              setEditDob(user?.dob || '');
              setEditEmail(user?.email || '');
              setEditPhone(user?.phone || '');
              setEditGender(user?.gender || 'male');
              setEditing(true);
            }}
            style={styles.editBtn}
          >
            <Edit3 size={16} color={ASBColors.primaryPurple} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Profile Info Display */}
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>

        <View style={styles.infoRow}>
          <User size={16} color={ASBColors.primaryPurple} />
          <Text style={styles.infoLabel}>Full Name</Text>
          <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={16} color={ASBColors.primaryPurple} />
          <Text style={styles.infoLabel}>DOB</Text>
          <Text style={styles.infoValue}>{user?.dob || 'Not set'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Mail size={16} color={ASBColors.primaryPurple} />
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Phone size={16} color={ASBColors.primaryPurple} />
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
        </View>

        <View style={styles.infoRow}>
          <User size={16} color={ASBColors.primaryPurple} />
          <Text style={styles.infoLabel}>Gender</Text>
          <Text style={styles.infoValue}>{user?.gender || 'Not set'}</Text>
        </View>

        <View style={styles.infoRow}>
          <CreditCard size={16} color={ASBColors.sacredGold} />
          <Text style={styles.infoLabel}>Credits</Text>
          <Text style={[styles.infoValue, { color: ASBColors.sacredGold, fontWeight: '800' }]}>{user?.credits || 0}</Text>
        </View>
      </GlassCard>

      {/* Cosmic Personality Traits */}
      {(() => {
        const dynamicProf = user?.dob ? calculateNumerologyProfile(user.dob, user.name || '') : null;
        return (
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>COSMIC PERSONALITY TRAITS</Text>
            <View style={styles.bulletinGrid}>
              <View style={styles.bulletinItem}>
                <Text style={styles.bLabel}>Lucky Number</Text>
                <Text style={styles.bValue}>{bulletins?.lucky_number || dynamicProf?.moolank || '7'}</Text>
              </View>
              <View style={styles.bulletinItem}>
                <Text style={styles.bLabel}>Destiny Number</Text>
                <Text style={styles.bValue}>{bulletins?.destiny_number || dynamicProf?.bhagyank || '5'}</Text>
              </View>
              <View style={styles.bulletinItem}>
                <Text style={styles.bLabel}>Personal Year</Text>
                <Text style={styles.bValue}>{bulletins?.personal_year || dynamicProf?.personalYear || '1'}</Text>
              </View>
              <View style={styles.bulletinItem}>
                <Text style={styles.bLabel}>Alignment</Text>
                <Text style={styles.bValue}>{bulletins?.alignment || `${dynamicProf?.scores?.alignmentPercentage || 92}%`}</Text>
              </View>
            </View>
          </GlassCard>
        );
      })()}

      {/* Quick Navigation Links */}
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>ACCOUNT & ORDERS</Text>
        {[
          { label: 'My Orders', icon: <Package size={18} color={ASBColors.royalViolet} />, route: '/shop/orders' },
          { label: 'Gift Orders', icon: <Gift size={18} color={ASBColors.crimsonMagenta} />, route: '/shop/gift-orders' },
          { label: 'My Courses', icon: <BookOpen size={18} color={ASBColors.primaryPurple} />, route: '/shop/my-courses' },
          { label: 'Saved Addresses', icon: <FileText size={18} color={ASBColors.sacredGold} />, route: '/shop/addresses' },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.navItem} onPress={() => router.push(item.route as any)}>
            {item.icon}
            <Text style={styles.navItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </GlassCard>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutModal(true)}>
        <LogOut size={18} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={editing} transparent animationType="slide" onRequestClose={() => setEditing(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Edit Profile Details</Text>
              <TouchableOpacity onPress={() => setEditing(false)} style={styles.closeBtn}>
                <X size={20} color={ASBColors.darkNavy} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} placeholder="Full Name" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DATE OF BIRTH (DD/MM/YYYY)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editDob}
                  onChangeText={(text) => setEditDob(formatDobInput(text))}
                  placeholder="DD/MM/YYYY (e.g. 15/08/1995)"
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput style={styles.modalInput} value={editEmail} onChangeText={setEditEmail} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <TextInput style={styles.modalInput} value={editPhone} onChangeText={setEditPhone} placeholder="Phone Number" keyboardType="phone-pad" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>GENDER</Text>
                <View style={styles.genderRow}>
                  {['male', 'female', 'other'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setEditGender(g)}
                      style={[styles.genderChip, editGender === g && styles.genderChipActive]}
                    >
                      <Text style={[styles.genderText, editGender === g && styles.genderTextActive]}>
                        {g.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <GradientButton
              title="Save Profile Changes"
              loading={saving}
              icon={<Check size={18} color="#FFF" />}
              onPress={handleSaveProfile}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Sign Out"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
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
    borderColor: ASBColors.borderIvory,
  },
  navTitle: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginVertical: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: ASBColors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  profileCard: {
    padding: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
  },
  userRole: {
    fontSize: 12,
    color: ASBColors.textMuted,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  editBtnText: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
  },
  card: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.primaryPurple,
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: ASBColors.borderIvory,
  },
  infoLabel: {
    fontSize: 13,
    color: ASBColors.textMuted,
    width: 90,
    marginLeft: 10,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.darkNavy,
    flex: 1,
    textAlign: 'right',
  },
  bulletinGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bulletinItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
  },
  bLabel: {
    fontSize: 10,
    color: ASBColors.textMuted,
  },
  bValue: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
    marginTop: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: ASBColors.borderIvory,
  },
  navItemText: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.darkNavy,
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: {
    fontSize: 14,
    fontFamily: ASBFonts.bodyBold,
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  editModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ASBColors.bgCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: ASBColors.bgWarmIvory,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: ASBColors.darkNavy,
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: ASBColors.bgWarmIvory,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ASBColors.borderIvory,
  },
  genderChipActive: {
    backgroundColor: ASBColors.primaryPurple,
    borderColor: ASBColors.primaryPurple,
  },
  genderText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  genderTextActive: {
    color: '#FFFFFF',
  },
});
