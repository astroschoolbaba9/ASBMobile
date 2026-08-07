// mobile-app/src/app/shop/courses.tsx
// Courses Catalog & Enrollment Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, BookOpen, Clock, Star, ChevronRight } from 'lucide-react-native';
import { ASBColors, ASBShadows } from '../../theme/tokens';
import { GlassCard } from '../../components/common/GlassCard';
import { GradientButton } from '../../components/common/GradientButton';
import { useQuery } from '@tanstack/react-query';
import { crystalApi, getImageUrl } from '../../api/client';

export default function CoursesScreen() {
  const router = useRouter();

  const { data: rawCoursesData } = useQuery({
    queryKey: ['courses-catalog'],
    queryFn: async () => {
      try {
        const res = await crystalApi.get('/api/courses');
        const items = res.data?.items || res.data?.courses || (Array.isArray(res.data) ? res.data : []);
        return items;
      } catch (e) {
        console.warn('Courses catalog API error:', e);
        return [];
      }
    },
  });

  const courses = (rawCoursesData || []).map((item: any) => {
    const lessonsCount = item.lessons?.length || 0;
    const totalSec = (item.lessons || []).reduce((acc: number, l: any) => acc + (l.durationSec || 0), 0);
    const duration = totalSec > 0 ? `${Math.round(totalSec / 60)} mins` : 'Self-Paced';
    return {
      ...item,
      instructor: item.instructor || 'ASB Senior Expert',
      duration,
      lessonsCount,
      ratingAvg: item.ratingAvg || null,
      image: getImageUrl(item.thumbnail || item.image),
    };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>ASB Courses</Text>
      </View>

      <Text style={styles.subtitle}>Learn Numerology & Crystal Healing from Senior ASB Experts</Text>

      {courses.length === 0 ? (
        <GlassCard style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
          <BookOpen size={40} color={ASBColors.textMuted} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: ASBColors.darkNavy }}>No Courses Available</Text>
          <Text style={{ fontSize: 12, color: ASBColors.textMuted }}>Check back soon for new course launches.</Text>
        </GlassCard>
      ) : (
        <View style={{ gap: 14 }}>
          {courses.map((course: any) => {
            const savings = course.mrp ? Math.round(((course.mrp - course.price) / course.mrp) * 100) : 0;
            const durationText = course.duration || (course.durationSec ? `${Math.round(course.durationSec / 3600)} hours` : '10+ hours');
            const lessonsCount = course.lessonsCount || course.lessons?.length || 10;
            const imageUrl = getImageUrl(course.image || course.thumbnailUrl || course.thumbnail);

            return (
              <TouchableOpacity key={course._id} style={[styles.courseCard, ASBShadows.cardRest]} activeOpacity={0.85} onPress={() => router.push(`/shop/course/${course._id}` as any)}>
                <Image source={{ uri: imageUrl }} style={styles.courseImg} />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseInstructor}>By {course.instructor || 'ASB Expert Team'}</Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Clock size={12} color={ASBColors.textMuted} />
                      <Text style={styles.metaText}>{durationText}</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <BookOpen size={12} color={ASBColors.textMuted} />
                      <Text style={styles.metaText}>{lessonsCount} Lessons</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.metaText}>{course.ratingAvg ? course.ratingAvg : 'New'}</Text>
                    </View>
                  </View>

                  <View style={styles.priceRow}>
                    <Text style={styles.priceVal}>₹{course.price || 0}</Text>
                    {course.mrp > course.price && <Text style={styles.mrpVal}>₹{course.mrp}</Text>}
                    {savings > 0 && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{savings}% OFF</Text>
                      </View>
                    )}
                  </View>

                  <GradientButton title="Enroll Now" variant="crystal" onPress={() => router.push(`/shop/course/${course._id}` as any)} style={{ marginTop: 10 }} />
                </View>
              </TouchableOpacity>
            );
          })}
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
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  subtitle: { fontSize: 12, color: ASBColors.textMuted, marginTop: -4 },
  courseCard: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: ASBColors.borderPurple },
  courseImg: { width: '100%', height: 160, resizeMode: 'cover' },
  courseInfo: { padding: 14 },
  courseTitle: { fontSize: 16, fontWeight: '700', color: ASBColors.darkNavy },
  courseInstructor: { fontSize: 12, color: ASBColors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F1E8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaText: { fontSize: 11, fontWeight: '600', color: ASBColors.darkNavy },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  priceVal: { fontSize: 20, fontWeight: '800', color: ASBColors.royalViolet },
  mrpVal: { fontSize: 14, color: ASBColors.textMuted, textDecorationLine: 'line-through' },
  savingsBadge: { backgroundColor: ASBColors.goodGreenBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  savingsText: { fontSize: 10, fontWeight: '800', color: ASBColors.goodGreen },
});
