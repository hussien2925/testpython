import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useReminders } from '../state/RemindersContext';
import { useSubscription } from '../subscriptions/SubscriptionContext';
import { ReminderStats } from '../components/ReminderStats';

export function HomeScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { reminders } = useReminders();
  const { tier } = useSubscription();

  const today = new Date();
  const todayReminders = reminders.filter((r) => {
    if (!r.dueDate) return false;
    const reminderDate = new Date(r.dueDate);
    return reminderDate.toDateString() === today.toDateString() && !r.completed;
  });

  const upcoming = reminders.filter((r) => {
    if (!r.dueDate) return false;
    const reminderDate = new Date(r.dueDate);
    return reminderDate.getTime() > today.getTime() && !r.completed;
  });

  const locationReminders = reminders.filter((r) => r.location && !r.completed);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {tier === 'plus' ? '✨ نبهني بلس' : '👋 نبهني'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {tier === 'plus'
              ? 'اشتراك مميز - بلا حدود'
              : 'نسخة مجانية - محدودة'}
          </Text>
        </View>

        {/* Stats */}
        <ReminderStats reminders={reminders} />

        {/* Today Reminders */}
        {todayReminders.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>📌 اليوم</Text>
            {todayReminders.slice(0, 3).map((r) => (
              <View
                key={r.id}
                style={[styles.reminderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Text style={{ color: theme.text, fontSize: 14 }} numberOfLines={1}>
                  {r.title}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {new Date(r.dueDate!).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))}
            {todayReminders.length > 3 ? (
              <Text style={[styles.moreText, { color: theme.primary }]}>
                +{todayReminders.length - 3} أخرى
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Upcoming */}
        {upcoming.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>📅 القادمة</Text>
            {upcoming.slice(0, 2).map((r) => (
              <View
                key={r.id}
                style={[styles.reminderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Text style={{ color: theme.text, fontSize: 14 }} numberOfLines={1}>
                  {r.title}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {new Date(r.dueDate!).toLocaleDateString('ar-SA')}
                </Text>
              </View>
            ))}
            {upcoming.length > 2 ? (
              <Text style={[styles.moreText, { color: theme.primary }]}>
                +{upcoming.length - 2} أخرى
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Location Reminders */}
        {locationReminders.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>📍 تنبيهات الأماكن</Text>
            {locationReminders.slice(0, 2).map((r) => (
              <View
                key={r.id}
                style={[styles.reminderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <Text style={{ color: theme.text, fontSize: 14 }} numberOfLines={1}>
                  {r.title}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {r.location?.trigger === 'arrive' ? '🚗 عند الوصول' : r.location?.trigger === 'leave' ? '🚪 عند المغادرة' : '👣 عند المرور'}
                </Text>
              </View>
            ))}
            {locationReminders.length > 2 ? (
              <Text style={[styles.moreText, { color: theme.primary }]}>
                +{locationReminders.length - 2} أخرى
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Empty State */}
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={[styles.emptyText, { color: theme.text }]}>لا توجد تذكيرات حالياً</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              ابدأ بالدردشة وأضف تذكيراتك الأولى
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  header: { gap: 4, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 13 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  reminderCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, fontWeight: '700' },
  emptySubtext: { fontSize: 13, textAlign: 'center' },
});
