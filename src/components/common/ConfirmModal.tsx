// mobile-app/src/components/common/ConfirmModal.tsx
// Enterprise Glassmorphism Modal for Confirmation Dialogs (Replaces native Alert.alert)

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react-native';
import { ASBColors, ASBFonts, ASBShadows } from '../../theme/tokens';
import { GlassCard } from './GlassCard';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!visible) return null;

  const isDanger = variant === 'danger';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <GlassCard variant="purple" style={styles.modalCard}>
          <View style={styles.iconCircle}>
            {isDanger ? (
              <ShieldAlert size={28} color="#EF4444" />
            ) : (
              <HelpCircle size={28} color={ASBColors.primaryPurple} />
            )}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, isDanger && styles.dangerConfirmBtn]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    alignItems: 'center',
    borderRadius: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(107, 91, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: ASBFonts.heading,
    color: ASBColors.darkNavy,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyMedium,
    color: ASBColors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ASBColors.borderIvory,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: ASBColors.darkNavy,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: ASBColors.primaryPurple,
    alignItems: 'center',
  },
  dangerConfirmBtn: {
    backgroundColor: '#DC2626',
  },
  confirmBtnText: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: '#FFFFFF',
  },
});
