import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useSettings } from '../state/SettingsContext';
import { useSubscription } from '../subscriptions/SubscriptionContext';
import { requestNotificationPermission } from '../notifications/notifications';
import { RootStackParamList } from '../navigation/types';
import { AppSettings } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Row({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.row, { borderColor: theme.border }]} disabled={!onPress}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {value ? <Text style={[styles.rowValue, { color: theme.textSecondary }]}>{value}</Text> : null}
    </Pressable>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.segment, { borderColor: theme.border }]}>
      {options.map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => onChange(opt.key)}
          style={[styles.segmentItem, { backgroundColor: value === opt.key ? theme.primary : 'transparent' }]}
        >
          <Text style={{ color: value === opt.key ? theme.textInverse : theme.text, fontSize: 13, fontWeight: '600' }}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function SettingsScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const { settings, setLanguage, setThemePreference } = useSettings();
  const { tier, restore } = useSubscription();

  const languageOptions: { key: AppSettings['language']; label: string }[] = [
    { key: 'ar', label: 'العربية' },
    { key: 'en', label: 'English' },
  ];
  const themeOptions: { key: AppSettings['themePreference']; label: string }[] = [
    { key: 'system', label: t.settings.themeSystem },
    { key: 'light', label: t.settings.themeLight },
    { key: 'dark', label: t.settings.themeDark },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t.settings.title}</Text>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.settings.subscription}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Row label={tier === 'plus' ? t.settings.plus : t.settings.free} />
          {tier === 'free' ? (
            <Row label={t.settings.plus} onPress={() => navigation.navigate('Paywall')} />
          ) : null}
          <Row label={t.settings.restorePurchases} onPress={() => restore()} />
          {tier === 'plus' ? (
            <Row
              label={t.settings.manage}
              onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
            />
          ) : null}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.settings.language}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, padding: 12 }]}>
          <SegmentedControl options={languageOptions} value={settings.language} onChange={setLanguage} />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.settings.theme}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, padding: 12 }]}>
          <SegmentedControl options={themeOptions} value={settings.themePreference} onChange={setThemePreference} />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.settings.about}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Row label={t.settings.notifications} onPress={() => requestNotificationPermission()} />
          <Row label={t.settings.privacyPolicy} onPress={() => Linking.openURL('https://hussainmofareh.com/nabhni')} />
          <Row label={t.settings.terms} onPress={() => Linking.openURL('https://hussainmofareh.com/nabhni')} />
          <Row label={t.settings.version} value={Constants.expoConfig?.version ?? '1.0.0'} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  headerTitle: { fontSize: 30, fontWeight: '800', marginTop: 8, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  card: { borderRadius: 14, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 14 },
  segment: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, padding: 3, gap: 3 },
  segmentItem: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
});
