import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSubscription } from '../subscriptions/SubscriptionContext';
import { countRemindersThisMonth, FREE_PLAN_LIMITS } from '../subscriptions/config';
import { Reminder } from '../types';

interface ReminderStatsProps {
  reminders: Reminder[];
}

export function ReminderStats({ reminders }: ReminderStatsProps) {
  const theme = useTheme();
  const { tier } = useSubscription();

  const stats = useMemo(() => {
    const thisMonth = reminders.filter((r) => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return new Date(r.createdAt).getTime() >= monthStart.getTime();
    });

    const withTime = thisMonth.filter((r) => r.dueDate && !r.location);
    const withLocation = thisMonth.filter((r) => r.location);
    const locationArrive = withLocation.filter((r) => r.location?.trigger === 'arrive');
    const locationLeave = withLocation.filter((r) => r.location?.trigger === 'leave');
    const locationPassing = withLocation.filter((r) => r.location?.trigger === 'passing');

    return {
      total: thisMonth.length,
      timed: withTime.length,
      location: withLocation.length,
      arrive: locationArrive.length,
      leave: locationLeave.length,
      passing: locationPassing.length,
    };
  }, [reminders]);

  const isFreeTier = tier === 'free';
  const usagePercent = isFreeTier
    ? Math.round((stats.total / FREE_PLAN_LIMITS.maxRemindersPerMonth) * 100)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
      {isFreeTier ? (
        <View style={styles.usageSection}>
          <View style={styles.usageRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Monthly usage</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {stats.total}/{FREE_PLAN_LIMITS.maxRemindersPerMonth}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(usagePercent, 100)}%`,
                  backgroundColor: usagePercent > 80 ? '#EF4444' : theme.primary,
                },
              ]}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.breakdownRow}>
        <StatCard icon="⏰" label="Timed" value={stats.timed} theme={theme} />
        <StatCard icon="📍" label="Location" value={stats.location} theme={theme} />
        {stats.location > 0 ? (
          <>
            <StatCard icon="🚗" label="Arrive" value={stats.arrive} theme={theme} size="small" />
            <StatCard icon="🚪" label="Leave" value={stats.leave} theme={theme} size="small" />
            <StatCard icon="👣" label="Passing" value={stats.passing} theme={theme} size="small" />
          </>
        ) : null}
      </View>
    </View>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  theme: ReturnType<typeof useTheme>;
  size?: 'normal' | 'small';
}

function StatCard({ icon, label, value, theme, size = 'normal' }: StatCardProps) {
  const isSmall = size === 'small';
  return (
    <View style={isSmall ? styles.statSmall : styles.stat}>
      <Text style={isSmall ? styles.iconSmall : styles.icon}>{icon}</Text>
      <Text style={[isSmall ? styles.labelSmall : styles.cardLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[isSmall ? styles.valueSmall : styles.cardValue, { color: theme.text }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  usageSection: { gap: 8 },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  value: { fontSize: 13, fontWeight: '700' },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  breakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stat: {
    flex: 1,
    minWidth: '48%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statSmall: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  icon: { fontSize: 20, marginBottom: 4 },
  iconSmall: { fontSize: 16, marginBottom: 3 },
  cardLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  labelSmall: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  cardValue: { fontSize: 18, fontWeight: '800' },
  valueSmall: { fontSize: 15, fontWeight: '800' },
});
