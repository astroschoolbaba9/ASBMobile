// mobile-app/src/app/shop/checkout.tsx
// Checkout Screen & Order Placement Handler (Backend Admin Sync)

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CreditCard, Truck, CheckCircle, MapPin, Home, Briefcase, Compass } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import { crystalApi } from '../../api/client';

export default function CheckoutScreen() {
  const router = useRouter();
  const { promoCode: promoCodeParam } = useLocalSearchParams<{ promoCode?: string }>();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, grandTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PAYU' | 'COD'>('PAYU');
  const [addressTag, setAddressTag] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [locationVerified, setLocationVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Auth Gate check
  React.useEffect(() => {
    if (!isAuthenticated) {
      showToast({
        type: 'info',
        title: '🔐 Login Required for Order',
        message: 'Please sign in to your account to complete checkout and track your delivery.',
      });
      router.replace('/(auth)/login' as any);
    }
  }, [isAuthenticated]);

  // Live Indian Postal PIN Lookup (Auto-fills City & State)
  const lookupPincode = async (pin: string) => {
    const clean = pin.trim().replace(/\D/g, '');
    setPincode(clean);

    if (clean.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
        const data = await res.json();
        if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.[0]) {
          const po = data[0].PostOffice[0];
          const detectedCity = po.District || po.Division || po.Block || '';
          const detectedState = po.State || '';
          if (detectedCity) setCity(detectedCity);
          if (detectedState) setState(detectedState);

          showToast({
            type: 'success',
            title: '📮 Pincode Verified',
            message: `${detectedCity}, ${detectedState} (${clean}) verified.`,
          });
        }
      } catch (e) {
        console.warn('Pincode lookup fallback:', e);
      }
    }
  };

  // GPS Location Auto-fill (Native Expo Location + Web Geolocation fallback)
  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocating(false);
          showToast({
            type: 'error',
            title: '📍 Location Permission Denied',
            message: 'Please grant location permission to auto-fill address.',
          });
          return;
        }

        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const reverse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverse && reverse.length > 0) {
          const item = reverse[0];
          const extractedPin = item.postalCode ? item.postalCode.replace(/\s+/g, '') : '';
          const extractedCity = item.city || item.subregion || item.district || '';
          const extractedState = item.region || '';
          const extractedStreet = [item.name, item.streetNumber, item.street, item.district].filter(Boolean).join(', ');

          if (extractedPin) setPincode(extractedPin);
          if (extractedCity) setCity(extractedCity);
          if (extractedState) setState(extractedState);
          if (extractedStreet) setLine1(extractedStreet);

          if (extractedPin && extractedPin.length === 6) {
            await lookupPincode(extractedPin);
          } else {
            showToast({
              type: 'success',
              title: '📍 GPS Location Detected',
              message: `Auto-filled: ${extractedCity || 'City'}, ${extractedState || 'State'}.`,
            });
          }
        }
      } else if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              if (data?.address) {
                const addr = data.address;
                const extractedPin = addr.postcode ? addr.postcode.replace(/\s+/g, '') : '';
                const extractedCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
                const extractedState = addr.state || '';
                const extractedStreet = [addr.house_number, addr.building, addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(', ');

                if (extractedPin) setPincode(extractedPin);
                if (extractedCity) setCity(extractedCity);
                if (extractedState) setState(extractedState);
                if (extractedStreet) setLine1(extractedStreet);

                if (extractedPin && extractedPin.length === 6) {
                  await lookupPincode(extractedPin);
                } else {
                  showToast({
                    type: 'success',
                    title: '📍 GPS Location Detected',
                    message: `Auto-filled: ${extractedCity || 'City'}, ${extractedState || 'State'}.`,
                  });
                }
              }
            } catch (e) {
              showToast({
                type: 'info',
                title: '📍 Location Retrieved',
                message: 'GPS coordinates retrieved. Please verify pincode & city.',
              });
            } finally {
              setLocating(false);
            }
          },
          (err) => {
            setLocating(false);
            showToast({
              type: 'error',
              title: '📍 Location Permission',
              message: 'Unable to detect GPS position. Please enter your address manually.',
            });
          },
          { enableHighAccuracy: true, timeout: 12000 }
        );
        return;
      } else {
        showToast({
          type: 'error',
          title: '📍 GPS Unavailable',
          message: 'GPS location is not supported on this device. Please fill in details manually.',
        });
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: '📍 Location Error',
        message: 'Could not fetch current GPS location. Please type your address.',
      });
    } finally {
      setLocating(false);
    }
  };

  const handlePlaceOrder = async () => {
    // 1. Full Name Validation
    if (!fullName || fullName.trim().length < 3) {
      showToast({
        type: 'error',
        title: '👤 Full Name Required',
        message: 'Please enter your complete full name (at least 3 characters).',
      });
      return;
    }

    // 2. Phone Number Validation (Indian 10-digit)
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      showToast({
        type: 'error',
        title: '📱 Invalid Mobile Number',
        message: 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.',
      });
      return;
    }

    // 3. Email Validation (Strict Format Check)
    const cleanEmail = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      showToast({
        type: 'error',
        title: '📧 Invalid Email Address',
        message: 'Please enter a valid email address (e.g. name@example.com). Check for invalid symbols.',
      });
      return;
    }

    // 4. Street Address Line 1 Validation
    if (!line1 || line1.trim().length < 5) {
      showToast({
        type: 'error',
        title: '🏠 Delivery Address Needed',
        message: 'Please enter a complete street address (House/Flat No, Building, Street).',
      });
      return;
    }

    // 5. City Validation
    if (!city || city.trim().length < 2) {
      showToast({
        type: 'error',
        title: '🏙️ City Required',
        message: 'Please specify your city or district.',
      });
      return;
    }

    // 6. State Validation
    if (!state || state.trim().length < 2) {
      showToast({
        type: 'error',
        title: '🏛️ State Required',
        message: 'Please enter your state (e.g. Delhi, Maharashtra, Uttarakhand).',
      });
      return;
    }

    // 7. Pincode Validation (6-digit Indian PIN)
    const cleanPin = pincode.trim();
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(cleanPin)) {
      showToast({
        type: 'error',
        title: '📮 Invalid Pincode',
        message: 'Please enter a valid 6-digit postal pincode.',
      });
      return;
    }

    if (cartItems.length === 0) {
      showToast({
        type: 'error',
        title: '🌸 Cart Note',
        message: 'Your cart is empty. Please add spiritual remedies before checking out.',
      });
      return;
    }

    setLoading(true);

    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.productId || item.id,
        qty: item.qty || 1,
        categoryName: '',
        isGift: item.isGift || false,
        giftWrap: item.giftWrap || false,
        giftWrapPrice: 0,
        giftOccasion: '',
        giftMessage: item.giftMessage || '',
        recipientName: item.recipientName || '',
        recipientPhone: '',
      }));

      const checkoutPayload: any = {
        items: orderItems,
        promoCode: promoCodeParam || '',
        shippingAddress: {
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          line1: line1.trim(),
          line2: '',
          city: city.trim(),
          state: state.trim(),
          pincode: cleanPin,
          landmark: '',
        },
        notes: '',
      };

      if (paymentMethod === 'PAYU') {
        checkoutPayload.payment = {
          method: 'ONLINE_PENDING',
          provider: 'PAYU',
          transactionId: '',
        };
      }

      // 1. Create Order in MERN Backend
      const orderRes = await crystalApi.post('/api/orders/checkout', checkoutPayload);
      const createdOrderId = orderRes.data?.order?._id || orderRes.data?._id || orderRes.data?.id;

      if (paymentMethod === 'PAYU') {
        const payuRes = await crystalApi.post('/api/payments/payu/initiate', {
          purpose: 'SHOP_ORDER',
          orderId: createdOrderId,
          amount: grandTotal,
          customer: { firstname: fullName.trim(), email: cleanEmail, phone: cleanPhone },
        });

        if (payuRes.data?.success) {
          if (payuRes.data?.actionUrl && payuRes.data?.fields) {
            const fields = payuRes.data.fields;
            const actionUrl = payuRes.data.actionUrl;
            const formHtml = `
              <html><body onload="document.forms[0].submit()">
                <form method="POST" action="${actionUrl}">
                  ${Object.entries(fields).map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}" />`).join('')}
                </form>
                <p style="text-align:center;font-family:sans-serif;color:#666;margin-top:40vh;">Connecting to PayU Secure Gateway...</p>
              </body></html>
            `;
            router.push({
              pathname: '/shop/payu-webview',
              params: {
                formHtml: encodeURIComponent(formHtml),
                purpose: 'SHOP_ORDER',
                orderId: createdOrderId,
              },
            } as any);
            return;
          } else if (payuRes.data?.paymentUrl || payuRes.data?.redirectUrl) {
            const rawUrl = payuRes.data.paymentUrl || payuRes.data.redirectUrl;
            router.push({
              pathname: '/shop/payu-webview',
              params: {
                paymentUrl: encodeURIComponent(rawUrl),
                purpose: 'SHOP_ORDER',
                orderId: createdOrderId,
              },
            } as any);
            return;
          }
        }

        showToast({
          type: 'info',
          title: '✨ Order Registered',
          message: 'Your order has been registered. Proceeding to payment confirmation...',
        });
        await clearCart();
        setOrderSuccess(true);
        return;
      }

      // COD Payment Method
      await addNotification({
        title: '✨ Order Confirmed!',
        message: `Your Cash on Delivery order #${createdOrderId || ''} of ₹${grandTotal} has been confirmed. Vedic energization will begin shortly!`,
        type: 'order',
        link: createdOrderId ? `/shop/order/${createdOrderId}` : '/shop/orders',
      });

      await clearCart();
      setOrderSuccess(true);
      showToast({
        type: 'success',
        title: '✨ Order Confirmed!',
        message: `Order #${createdOrderId || 'ASB'} confirmed! Confirmation sent to ${cleanEmail}. Vedic energization begins shortly!`,
      });
    } catch (e: any) {
      console.error('Checkout error:', e);
      const backendMsg = e.response?.data?.message || e.response?.data?.error;
      showToast({
        type: 'error',
        title: '🙏 Order Note',
        message: backendMsg || 'We could not connect to the server right now. Your items are saved in your cart—please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Shipping & Payment</Text>
      </View>

      {orderSuccess ? (
        <GlassCard style={styles.successCard}>
          <CheckCircle size={48} color={ASBColors.goodGreen} />
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSub}>
            Your order confirmation has been registered. Tracking details will be updated in My Orders.
          </Text>
          <GradientButton
            title="Return to Store"
            variant="crystal"
            onPress={() => router.push('/(tabs)/marketplace' as any)}
            style={{ marginTop: 16 }}
          />
        </GlassCard>
      ) : (
        <View style={{ gap: 14 }}>
          {/* Zomato-Style Shipping Address Form */}
          <GlassCard style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color={ASBColors.primaryPurple} />
                <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
              </View>

              <TouchableOpacity
                onPress={handleUseCurrentLocation}
                style={[styles.zomatoGpsBtn, locating && styles.zomatoGpsBtnActive]}
                disabled={locating}
              >
                <Compass size={14} color={ASBColors.primaryPurple} />
                <Text style={styles.zomatoGpsText}>
                  {locating ? 'Detecting GPS...' : '📍 Auto-Detect Location'}
                </Text>
              </TouchableOpacity>
            </View>

            {locationVerified && (
              <Animated.View entering={Platform.OS !== 'web' ? FadeInDown.duration(400) : undefined} style={styles.locationSuccessBadge}>
                <CheckCircle size={14} color={ASBColors.goodGreen} />
                <Text style={styles.locationSuccessText}>
                  GPS Verified: {city ? `${city}, ${state}` : 'Current Location Set'}
                </Text>
              </Animated.View>
            )}

            {/* Address Type Tag Selector (Zomato / Swiggy Style) */}
            <Text style={styles.inputLabel}>SAVE ADDRESS AS</Text>
            <View style={styles.tagSelectorRow}>
              <TouchableOpacity
                onPress={() => setAddressTag('HOME')}
                style={[styles.addressTypeChip, addressTag === 'HOME' && styles.addressTypeChipActive]}
              >
                <Home size={14} color={addressTag === 'HOME' ? '#FFFFFF' : ASBColors.primaryPurple} />
                <Text style={[styles.addressTypeText, addressTag === 'HOME' && styles.addressTypeTextActive]}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAddressTag('WORK')}
                style={[styles.addressTypeChip, addressTag === 'WORK' && styles.addressTypeChipActive]}
              >
                <Briefcase size={14} color={addressTag === 'WORK' ? '#FFFFFF' : ASBColors.primaryPurple} />
                <Text style={[styles.addressTypeText, addressTag === 'WORK' && styles.addressTypeTextActive]}>Work</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAddressTag('OTHER')}
                style={[styles.addressTypeChip, addressTag === 'OTHER' && styles.addressTypeChipActive]}
              >
                <MapPin size={14} color={addressTag === 'OTHER' ? '#FFFFFF' : ASBColors.primaryPurple} />
                <Text style={[styles.addressTypeText, addressTag === 'OTHER' && styles.addressTypeTextActive]}>Other</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>FULL NAME *</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full Name (e.g. Rahul Sharma)" />

            <Text style={styles.inputLabel}>PHONE NUMBER * (10-Digit Mobile)</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} placeholder="e.g. 9911500291" />

            <Text style={styles.inputLabel}>EMAIL ADDRESS * (For Order Invoice & Tracking)</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="e.g. rahul@example.com" />

            <Text style={styles.inputLabel}>STREET ADDRESS (LINE 1) *</Text>
            <TextInput style={styles.input} value={line1} onChangeText={setLine1} placeholder="House / Flat No, Building, Street" />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CITY *</Text>
                <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City / District" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>STATE *</Text>
                <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="State" />
              </View>
            </View>

            <Text style={styles.inputLabel}>PINCODE * (6-Digit Postal Code)</Text>
            <TextInput
              style={styles.input}
              value={pincode}
              onChangeText={(text) => lookupPincode(text)}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="e.g. 110001"
            />
          </GlassCard>

          {/* Payment Method Selector */}
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>

            <TouchableOpacity
              onPress={() => setPaymentMethod('PAYU')}
              style={[styles.payMethodBtn, paymentMethod === 'PAYU' && styles.payMethodActive]}
            >
              <CreditCard size={20} color={ASBColors.royalViolet} />
              <View style={{ flex: 1 }}>
                <Text style={styles.payTitle}>Pay Online via PayU Gateway</Text>
                <Text style={styles.paySub}>Credit/Debit Cards, UPI, Netbanking, Wallets</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPaymentMethod('COD')}
              style={[styles.payMethodBtn, paymentMethod === 'COD' && styles.payMethodActive]}
            >
              <Truck size={20} color={ASBColors.darkNavy} />
              <View style={{ flex: 1 }}>
                <Text style={styles.payTitle}>Cash on Delivery (COD)</Text>
                <Text style={styles.paySub}>Pay cash when product is delivered</Text>
              </View>
            </TouchableOpacity>

            <GradientButton
              title={paymentMethod === 'PAYU' ? 'Proceed to PayU Gateway' : 'Confirm COD Order'}
              variant="crystal"
              loading={loading}
              onPress={handlePlaceOrder}
              style={{ marginTop: 14 }}
            />
          </GlassCard>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ASBColors.bgWarmCream,
  },
  content: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 40,
    gap: 14,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: ASBColors.darkNavy,
    letterSpacing: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  zomatoGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  zomatoGpsBtnActive: {
    backgroundColor: '#E5D5FF',
  },
  zomatoGpsText: {
    fontSize: 11,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
  },
  locationSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ASBColors.goodGreenBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  locationSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: ASBColors.goodGreen,
  },
  tagSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  addressTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  addressTypeChipActive: {
    backgroundColor: ASBColors.primaryPurple,
    borderColor: ASBColors.primaryPurple,
  },
  addressTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: ASBColors.primaryPurple,
  },
  addressTypeTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ASBColors.darkNavy,
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: ASBColors.darkNavy,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  payMethodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  payMethodActive: {
    borderColor: ASBColors.royalViolet,
    backgroundColor: '#F3E8FF',
  },
  payTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  paySub: {
    fontSize: 11,
    color: ASBColors.textMuted,
  },
  successCard: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ASBColors.darkNavy,
  },
  successSub: {
    fontSize: 13,
    color: ASBColors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
