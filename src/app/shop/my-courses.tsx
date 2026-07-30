// mobile-app/src/app/shop/my-courses.tsx
// My Purchased Courses Dashboard with progress tracking

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Play, ExternalLink } from 'lucide-react-native';
import { ASBColors, ASBShadows } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useQuery } from '@tanstack/react-query';
import { crystalApi } from '../../api/client';

export default function MyCoursesScreen() {
  const router = useRouter();

  const { data: myCourses, isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => {
      const res = await crystalApi.get('/api/me/courses');
      const items = res.data?.items || [];
      return items.map((p: any) => ({
        purchaseId: p.purchaseId || p._id,
        purchasedAt: p.purchasedAt,
        amountPaid: p.amountPaid,
        status: p.status,
        _id: p?.course?.id || p?.course?._id,
        title: p?.course?.title || 'Course',
        thumbnail: p?.course?.thumbnail || '',
        price: p?.course?.price || 0,
        slug: p?.course?.slug || '',
        progress: p?.progress || 0,
      }));
    },
  });

  const mockCourses = [
    { purchaseId: 'p1', _id: 'c1', title: 'ASB Numerology Foundation Course', purchasedAt: '2026-07-01', status: 'active', progress: 35, amountPaid: 4999 },
    { purchaseId: 'p2', _id: 'c2', title: 'Crystal Healing & Chakra Alignment', purchasedAt: '2026-06-15', status: 'active', progress: 0, amountPaid: 2999 },
  ];

  const courses = myCourses && myCourses.length > 0 ? myCourses : mockCourses;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Courses</Text>
        <TouchableOpacity onPress={() => router.push('/shop/courses')} style={styles.browseLinkBtn}>
          <Text style={styles.browseLinkText}>Browse Courses</Text>
        </TouchableOpacity>
      </View>

      {courses.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <BookOpen size={48} color={ASBColors.textMuted} />
          <Text style={styles.emptyTitle}>No Courses Purchased</Text>
          <Text style={styles.emptySub}>Start your learning journey with ASB's expert-led courses.</Text>
          <GradientButton title="Browse Courses" variant="crystal" onPress={() => router.push('/shop/courses')} style={{ marginTop: 12 }} />
        </GlassCard>
      ) : (
        <View style={{ gap: 14 }}>
          {courses.map((c: any) => (
            <GlassCard key={c.purchaseId} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.purchasedBadge}>
                  <Text style={styles.purchasedText}>Purchased</Text>
                </View>
                <Text style={styles.dateText}>{c.purchasedAt}</Text>
              </View>

              <Text style={styles.courseTitle}>{c.title}</Text>

              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${c.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{c.progress}% Complete</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.viewBtn} onPress={() => router.push(`/shop/course/${c._id}` as any)}>
                  <ExternalLink size={14} color={ASBColors.primaryPurple} />
                  <Text style={styles.viewBtnText}>View</Text>
                </TouchableOpacity>
                <GradientButton
                  title={c.progress > 0 ? 'Continue' : 'Start Learning'}
                  variant="primary"
                  icon={<Play size={14} color="#FFF" />}
                  onPress={() => router.push(`/shop/course/${c._id}` as any)}
                  style={{ flex: 1 }}
                />
              </View>
            </GlassCard>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmCream },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 14 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy, flex: 1 },
  browseLinkBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: ASBColors.primaryPurple },
  browseLinkText: { fontSize: 11, fontWeight: '700', color: ASBColors.primaryPurple },
  emptyCard: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  emptySub: { fontSize: 12, color: ASBColors.textMuted, textAlign: 'center' },
  card: { padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  purchasedBadge: { backgroundColor: ASBColors.goodGreenBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  purchasedText: { fontSize: 10, fontWeight: '800', color: ASBColors.goodGreen },
  dateText: { fontSize: 11, color: ASBColors.textMuted },
  courseTitle: { fontSize: 15, fontWeight: '700', color: ASBColors.darkNavy },
  progressSection: { marginTop: 10, gap: 4 },
  progressTrack: { height: 6, backgroundColor: '#F3E8FF', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: ASBColors.primaryPurple, borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '600', color: ASBColors.textMuted },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: ASBColors.borderPurple },
  viewBtnText: { fontSize: 13, fontWeight: '700', color: ASBColors.primaryPurple },
});
