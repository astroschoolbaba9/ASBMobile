// mobile-app/src/app/shop/course/[id].tsx
// Course Detail & Lesson Viewer Screen

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BookOpen, Clock, Star, Play, Lock, CheckCircle } from 'lucide-react-native';
import { ASBColors, ASBShadows } from '../../../theme/tokens';
import { GlassCard } from '../../../components/common/GlassCard';
import { GradientButton } from '../../../components/common/GradientButton';

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [enrolled, setEnrolled] = useState(false);

  const course = {
    _id: id,
    title: 'ASB Numerology Foundation Course',
    instructor: 'Bhaskar Joshi',
    duration: '12 hours',
    price: 4999,
    mrp: 9999,
    ratingAvg: 4.9,
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600',
    description: 'Complete foundation in Chaldean & Pythagorean numerology systems. Learn how to read birth charts, calculate mystical triangles, analyze Lo Shu Grids, and provide professional numerology consultations.',
    lessons: [
      { title: 'Introduction to Numerology History', duration: '25 min', free: true },
      { title: 'Chaldean vs Pythagorean Systems', duration: '40 min', free: true },
      { title: 'Moolank & Bhagyank Calculation', duration: '35 min', free: false },
      { title: 'Mystical Triangle Deep Analysis', duration: '50 min', free: false },
      { title: 'Lo Shu Grid Interpretation', duration: '45 min', free: false },
      { title: 'Name Numerology & Spelling Optimization', duration: '55 min', free: false },
      { title: 'Mobile Number Compatibility', duration: '30 min', free: false },
      { title: 'Profession & Career Mapping', duration: '40 min', free: false },
    ],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={ASBColors.darkNavy} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>Course Details</Text>
      </View>

      <Image source={{ uri: course.image }} style={styles.heroImg} />

      <GlassCard style={styles.card}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseInst}>By {course.instructor}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}><Clock size={12} color={ASBColors.textMuted} /><Text style={styles.metaText}>{course.duration}</Text></View>
          <View style={styles.metaChip}><BookOpen size={12} color={ASBColors.textMuted} /><Text style={styles.metaText}>{course.lessons.length} Lessons</Text></View>
          <View style={styles.metaChip}><Star size={12} color="#F59E0B" fill="#F59E0B" /><Text style={styles.metaText}>{course.ratingAvg}</Text></View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceVal}>₹{course.price}</Text>
          <Text style={styles.mrpVal}>₹{course.mrp}</Text>
        </View>

        <Text style={styles.descText}>{course.description}</Text>

        {!enrolled && (
          <GradientButton
            title="Enroll & Start Learning (₹4,999)"
            variant="crystal"
            onPress={() => setEnrolled(true)}
            style={{ marginTop: 12 }}
          />
        )}

        {enrolled && (
          <View style={styles.enrolledBadge}>
            <CheckCircle size={18} color={ASBColors.goodGreen} />
            <Text style={styles.enrolledText}>Enrolled — You have full access</Text>
          </View>
        )}
      </GlassCard>

      {/* Lesson List */}
      <GlassCard style={styles.card}>
        <Text style={styles.sectionTitle}>COURSE CURRICULUM</Text>
        {course.lessons.map((lesson, idx) => (
          <TouchableOpacity key={idx} style={styles.lessonRow} activeOpacity={0.8}>
            <View style={[styles.lessonIcon, (lesson.free || enrolled) ? styles.lessonUnlocked : styles.lessonLocked]}>
              {(lesson.free || enrolled) ? <Play size={14} color="#FFFFFF" /> : <Lock size={14} color={ASBColors.textMuted} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonTitle}>{idx + 1}. {lesson.title}</Text>
              <Text style={styles.lessonDuration}>{lesson.duration}</Text>
            </View>
            {lesson.free && !enrolled && (
              <View style={styles.freeBadge}><Text style={styles.freeText}>FREE</Text></View>
            )}
          </TouchableOpacity>
        ))}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ASBColors.bgWarmCream },
  content: { padding: 16, paddingTop: 54, paddingBottom: 40, gap: 14 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ASBColors.borderPurple },
  navTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  heroImg: { width: '100%', height: 200, borderRadius: 16, resizeMode: 'cover' },
  card: { padding: 16 },
  courseTitle: { fontSize: 18, fontWeight: '700', color: ASBColors.darkNavy },
  courseInst: { fontSize: 12, color: ASBColors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F1E8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaText: { fontSize: 11, fontWeight: '600', color: ASBColors.darkNavy },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  priceVal: { fontSize: 22, fontWeight: '800', color: ASBColors.royalViolet },
  mrpVal: { fontSize: 14, color: ASBColors.textMuted, textDecorationLine: 'line-through' },
  descText: { fontSize: 13, color: ASBColors.darkNavy, lineHeight: 18, marginTop: 10 },
  enrolledBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: ASBColors.goodGreenBg, padding: 10, borderRadius: 10, marginTop: 12 },
  enrolledText: { fontSize: 12, fontWeight: '700', color: ASBColors.goodGreen },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: ASBColors.darkNavy, letterSpacing: 1, marginBottom: 10 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3E8FF' },
  lessonIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  lessonUnlocked: { backgroundColor: ASBColors.royalViolet },
  lessonLocked: { backgroundColor: '#E5E7EB' },
  lessonTitle: { fontSize: 13, fontWeight: '600', color: ASBColors.darkNavy },
  lessonDuration: { fontSize: 11, color: ASBColors.textMuted },
  freeBadge: { backgroundColor: ASBColors.goodGreenBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  freeText: { fontSize: 9, fontWeight: '800', color: ASBColors.goodGreen },
});
