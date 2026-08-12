// mobile-app/src/app/shop/payu-webview.tsx
// Real PayU Payment Gateway WebView Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShieldCheck, X } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { useCart } from '../../context/CartContext';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import * as WebBrowser from 'expo-web-browser';

let WebViewComponent: any = null;
try {
  WebViewComponent = require('react-native-webview').WebView;
} catch (e) {
  WebViewComponent = null;
}

export default function PayUWebViewScreen() {
  const router = useRouter();
  const { paymentUrl, formHtml, purpose, orderId, courseId } = useLocalSearchParams<{
    paymentUrl?: string;
    formHtml?: string;
    purpose?: string;
    orderId?: string;
    courseId?: string;
  }>();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const decodedUrl = paymentUrl ? decodeURIComponent(paymentUrl) : '';
  const decodedFormHtml = formHtml ? decodeURIComponent(formHtml) : '';

  // Determine WebView source: formHtml (form POST) takes priority over URL redirect
  const webViewSource = decodedFormHtml
    ? { html: decodedFormHtml }
    : decodedUrl
      ? { uri: decodedUrl }
      : null;

  const handleNavigationStateChange = async (navState: any) => {
    const url = navState.url || '';

    // Check for PayU Success Callback URLs
    if (url.includes('/payu/success') || url.includes('/payment-success') || url.includes('status=success') || url.includes('result=success') || url.includes('/payment/success')) {
      if (purpose === 'SHOP_ORDER') {
        await clearCart();
        router.replace({ pathname: '/shop/payment-success', params: { purpose: 'shop', orderId } } as any);
      } else if (purpose === 'COURSE') {
        router.replace({ pathname: '/shop/payment-success', params: { purpose: 'course', courseId } } as any);
      } else {
        router.replace('/shop/payment-success' as any);
      }
      return;
    }

    // Check for PayU Failure Callback URLs
    if (url.includes('/payu/failure') || url.includes('/payment-failed') || url.includes('status=failure') || url.includes('result=failure') || url.includes('status=cancel') || url.includes('/payment/failed')) {
      router.replace({ pathname: '/shop/payment-failed', params: { purpose: purpose || 'shop', orderId, courseId } } as any);
      return;
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    router.replace({ pathname: '/shop/payment-failed', params: { purpose: purpose || 'shop', orderId, courseId } } as any);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCancelModal(true)} style={styles.closeBtn}>
            <X size={20} color={ASBColors.darkNavy} />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <ShieldCheck size={18} color={ASBColors.goodGreen} />
            <Text style={styles.headerTitle}>PayU Secure Checkout</Text>
          </View>
        </View>
        <View style={styles.webContainer}>
          {decodedFormHtml ? (
            <iframe
              srcDoc={decodedFormHtml}
              style={{ width: '100%', height: '100%', border: 'none' } as any}
              onLoad={() => setLoading(false)}
            />
          ) : decodedUrl ? (
            <iframe
              src={decodedUrl}
              style={{ width: '100%', height: '100%', border: 'none' } as any}
              onLoad={() => setLoading(false)}
            />
          ) : (
            <Text style={styles.errorText}>Payment gateway could not be loaded. Please go back and try again.</Text>
          )}
        </View>
        <ConfirmModal
          visible={showCancelModal}
          title="Cancel Payment?"
          message="Are you sure you want to cancel the payment process? Your order will not be completed."
          confirmText="Yes, Cancel"
          variant="danger"
          onConfirm={handleConfirmCancel}
          onCancel={() => setShowCancelModal(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowCancelModal(true)} style={styles.closeBtn}>
          <X size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <ShieldCheck size={18} color={ASBColors.goodGreen} />
          <Text style={styles.headerTitle}>PayU 256-Bit SSL Encrypted Gateway</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={ASBColors.primaryPurple} />
          <Text style={styles.loadingText}>Connecting to PayU Secure Payment Gateway...</Text>
        </View>
      )}

      {WebViewComponent && webViewSource ? (
        <WebViewComponent
          source={webViewSource}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          originWhitelist={['*']}
        />
      ) : (
        <View style={styles.fallbackBox}>
          <ShieldCheck size={48} color={ASBColors.primaryPurple} />
          <Text style={styles.fallbackTitle}>PayU Checkout Ready</Text>
          <Text style={styles.fallbackSub}>Tap below to open the secure PayU gateway on your mobile device.</Text>
          <TouchableOpacity
            style={styles.openBrowserBtn}
            onPress={async () => {
              if (decodedUrl) {
                await WebBrowser.openBrowserAsync(decodedUrl);
              }
            }}
          >
            <Text style={styles.openBrowserText}>🔐 Launch PayU Gateway</Text>
          </TouchableOpacity>
        </View>
      )}

      <ConfirmModal
        visible={showCancelModal}
        title="Cancel Payment?"
        message="Are you sure you want to cancel the payment process? Your order will not be completed."
        confirmText="Yes, Cancel"
        variant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmIvory },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: ASBColors.borderIvory,
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  headerTitle: { fontSize: 13, fontWeight: '700', color: ASBColors.darkNavy },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ASBColors.bgWarmIvory,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 12,
  },
  loadingText: { fontSize: 13, fontWeight: '600', color: ASBColors.darkNavy },
  webContainer: { flex: 1, width: '100%' },
  errorText: { fontSize: 14, color: ASBColors.errorRed, textAlign: 'center', marginTop: 40 },
  fallbackBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  fallbackTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy, marginTop: 12 },
  fallbackSub: { fontSize: 13, color: ASBColors.textMuted, marginTop: 6, textAlign: 'center' },
  openBrowserBtn: {
    marginTop: 20,
    backgroundColor: ASBColors.primaryPurple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  openBrowserText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
