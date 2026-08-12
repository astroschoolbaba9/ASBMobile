// mobile-app/src/context/ToastContext.tsx
// Global Enterprise Toast Notification Engine (0 Browser Alerts / 100% Custom Animated UI)

import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { CheckCircle, AlertTriangle, Info, X, Sparkles } from 'lucide-react-native';
import { ASBColors, ASBFonts, ASBShadows } from '../theme/tokens';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions | string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const [anim] = useState(new Animated.Value(-100));

  const hideToast = useCallback(() => {
    Animated.timing(anim, {
      toValue: -100,
      duration: 250,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setToast(null);
    });
  }, [anim]);

  const showToast = useCallback((options: ToastOptions | string | any) => {
    let opts: ToastOptions;
    if (typeof options === 'string') {
      opts = { message: options, type: 'info' };
    } else if (options && typeof options === 'object') {
      const friendlyMsg = options.userFriendlyMessage || options.message || options.response?.data?.message || '✨ Connection Note: Please check details and try again.';
      opts = {
        title: options.title || (options.type === 'error' ? '✨ Note' : undefined),
        message: friendlyMsg,
        type: options.type || (options.userFriendlyMessage || options.response ? 'error' : 'info'),
        actionLabel: options.actionLabel,
        onAction: options.onAction,
        duration: options.duration,
      };
    } else {
      opts = { message: 'Notice', type: 'info' };
    }

    const id = Date.now();

    setToast({ ...opts, id });

    Animated.spring(anim, {
      toValue: 20,
      tension: 80,
      friction: 10,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    const duration = opts.duration || 3500;
    setTimeout(() => {
      hideToast();
    }, duration);
  }, [anim, hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: anim }] }]}>
          <View
            style={[
              styles.toastCard,
              toast.type === 'success' && styles.successCard,
              toast.type === 'error' && styles.errorCard,
              toast.type === 'info' && styles.infoCard,
            ]}
          >
            <View style={styles.iconCol}>
              {toast.type === 'success' && <CheckCircle size={22} color="#10B981" />}
              {toast.type === 'error' && <AlertTriangle size={22} color="#EF4444" />}
              {toast.type === 'info' && <Sparkles size={22} color={ASBColors.primaryPurple} />}
            </View>

            <View style={styles.textCol}>
              {toast.title && <Text style={styles.toastTitle}>{toast.title}</Text>}
              <Text style={styles.toastMessage}>{toast.message}</Text>
            </View>

            {toast.actionLabel && toast.onAction && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  toast.onAction?.();
                  hideToast();
                }}
              >
                <Text style={styles.actionBtnText}>{toast.actionLabel}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={hideToast}>
              <X size={16} color={ASBColors.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B2E',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...ASBShadows.cardRest,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  successCard: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: '#0F291E',
  },
  errorCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: '#2A1215',
  },
  infoCard: {
    borderColor: 'rgba(107, 91, 255, 0.4)',
    backgroundColor: '#181528',
  },
  iconCol: {
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 13,
    fontFamily: ASBFonts.bodyBold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 12,
    fontFamily: ASBFonts.bodyMedium,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  actionBtn: {
    backgroundColor: ASBColors.primaryPurple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  actionBtnText: {
    fontSize: 11,
    fontFamily: ASBFonts.bodyBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
