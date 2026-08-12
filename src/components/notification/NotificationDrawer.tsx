// mobile-app/src/components/notification/NotificationDrawer.tsx
// Glassmorphic Notification Drawer / Modal with Filter Tabs and Direct Action Links

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Bell, ShoppingBag, Sparkles, BookOpen, ShieldCheck, Check, Trash } from 'lucide-react-native';
import { ASBColors } from '../../theme/tokens';
import { GlassCard } from '../common/GlassCard';
import { useNotifications, AppNotification } from '../../context/NotificationContext';

export const NotificationDrawer: React.FC = () => {
  const router = useRouter();
  const { notifications, drawerOpen, pushToken, setDrawerOpen, markAsRead, markAllAsRead, clearNotifications, requestPushPermission } = useNotifications();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ORDERS' | 'COSMIC' | 'COURSES'>('ALL');

  const filtered = notifications.filter((n) => {
    if (activeTab === 'ORDERS') return n.type === 'order';
    if (activeTab === 'COSMIC') return n.type === 'cosmic';
    if (activeTab === 'COURSES') return n.type === 'course';
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={18} color={ASBColors.royalViolet} />;
      case 'cosmic':
        return <Sparkles size={18} color={ASBColors.sacredGold} />;
      case 'course':
        return <BookOpen size={18} color={ASBColors.primaryPurple} />;
      default:
        return <ShieldCheck size={18} color={ASBColors.goodGreen} />;
    }
  };

  const handleItemPress = (n: AppNotification) => {
    markAsRead(n.id);
    setDrawerOpen(false);
    if (n.link) {
      router.push(n.link as any);
    } else if (n.type === 'order') {
      router.push('/shop/orders' as any);
    } else if (n.type === 'course') {
      router.push('/shop/my-courses' as any);
    } else if (n.type === 'cosmic') {
      router.push('/(tabs)' as any);
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch (e) {
      return '';
    }
  };

  return (
    <Modal visible={drawerOpen} transparent animationType="slide" onRequestClose={() => setDrawerOpen(false)}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Bell size={20} color={ASBColors.primaryPurple} />
              <Text style={styles.headerTitle}>Notifications Center</Text>
            </View>
            <TouchableOpacity onPress={() => setDrawerOpen(false)} style={styles.closeBtn}>
              <X size={20} color={ASBColors.darkNavy} />
            </TouchableOpacity>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={markAllAsRead} style={styles.actionBtn}>
              <Check size={14} color={ASBColors.primaryPurple} />
              <Text style={styles.actionText}>Mark All Read</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={requestPushPermission} style={styles.actionBtn}>
              <Bell size={14} color={ASBColors.sacredGold} />
              <Text style={styles.actionText}>Enable Push</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearNotifications} style={styles.actionBtn}>
              <Trash size={14} color={ASBColors.errorRed} />
              <Text style={[styles.actionText, { color: ASBColors.errorRed }]}>Clear</Text>
            </TouchableOpacity>
          </View>

          {pushToken ? (
            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>📱 Device Push Token:</Text>
              <Text style={styles.tokenVal} numberOfLines={1} selectable>{pushToken}</Text>
            </View>
          ) : null}

          {/* Filter Tabs */}
          <View style={styles.tabsRow}>
            {(['ALL', 'ORDERS', 'COSMIC', 'COURSES'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabChip, activeTab === tab && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notifications List */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }}>
            {filtered.length === 0 ? (
              <GlassCard style={styles.emptyBox}>
                <Bell size={40} color={ASBColors.textMuted} />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySub}>You are all caught up on your cosmic updates and order alerts.</Text>
              </GlassCard>
            ) : (
              filtered.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.8}
                  style={[styles.itemCard, !item.read && styles.unreadCard]}
                >
                  <View style={styles.iconBox}>{getIcon(item.type)}</View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemTime}>{formatTime(item.timestamp)}</Text>
                    </View>
                    <Text style={styles.itemMsg}>{item.message}</Text>
                  </View>
                  {!item.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 11, 46, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    height: '80%',
    backgroundColor: ASBColors.bgWarmCream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8FF',
    backgroundColor: '#FFFFFF',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: ASBColors.darkNavy },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8FF',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { fontSize: 11, fontWeight: '700', color: ASBColors.darkNavy },
  tabsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF' },
  tabChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: '#FAF5FF', borderWidth: 1, borderColor: '#E9D5FF' },
  tabActive: { backgroundColor: ASBColors.royalViolet, borderColor: ASBColors.royalViolet },
  tabText: { fontSize: 10, fontWeight: '800', color: ASBColors.textMuted },
  tabTextActive: { color: '#FFFFFF' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: ASBColors.darkNavy },
  emptySub: { fontSize: 12, color: ASBColors.textMuted, textAlign: 'center' },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: ASBColors.borderPurple,
  },
  unreadCard: {
    backgroundColor: '#FAF5FF',
    borderColor: ASBColors.royalViolet,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: ASBColors.darkNavy, flex: 1 },
  itemTime: { fontSize: 10, color: ASBColors.textMuted, marginLeft: 6 },
  itemMsg: { fontSize: 12, color: ASBColors.textMuted, lineHeight: 16 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ASBColors.royalViolet, marginTop: 6 },
  tokenBox: {
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenLabel: { fontSize: 11, fontWeight: '700', color: ASBColors.primaryPurple },
  tokenVal: { fontSize: 10, color: ASBColors.darkNavy, flex: 1 },
});
