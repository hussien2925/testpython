import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useSubscription } from '../subscriptions/SubscriptionContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FEATURE_KEYS = ['featureUnlimited', 'featureVoice', 'featureSilent', 'featureWidgets'] as const;

export function PaywallScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const { packages, purchase, restore, isNativeAvailable, tier } = useSubscription();
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (tier === 'plus') navigation.goBack();
  }, [tier, navigation]);

  const currentPackage = packages.find((p) => p.identifier === selected) ?? packages[0];

  const onSubscribe = async () => {
    if (!currentPackage) {
      Alert.alert(t.common.error, 'RevenueCat is not configured yet. See mobile/SUBSCRIPTIONS.md.');
      return;
    }
    setBusy(true);
    try {
      await purchase(currentPackage);
      navigation.goBack();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (!/cancel/i.test(message)) Alert.alert(t.common.error, message);
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    setBusy(true);
    try {
      await restore();
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={{ color: theme.textSecondary, fontSize: 20 }}>✕</Text>
        </Pressable>

        <Text style={styles.emoji}>✨</Text>
        <Text style={[styles.title, { color: theme.text }]}>{t.paywall.title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t.paywall.subtitle}</Text>

        <View style={styles.features}>
          {FEATURE_KEYS.map((key) => (
            <View key={key} style={styles.featureRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={[styles.featureText, { color: theme.text }]}>{t.paywall[key]}</Text>
            </View>
          ))}
        </View>

        {isNativeAvailable && packages.length > 0 ? (
          <View style={styles.plans}>
            {packages.map((pkg) => (
              <Pressable
                key={pkg.identifier}
                onPress={() => setSelected(pkg.identifier)}
                style={[
                  styles.planCard,
                  {
                    borderColor: (selected ?? packages[0]?.identifier) === pkg.identifier ? theme.primary : theme.border,
                    backgroundColor: theme.surface,
                  },
                ]}
              >
                <Text style={[styles.planTitle, { color: theme.text }]}>{pkg.product.title}</Text>
                <Text style={[styles.planPrice, { color: theme.primary }]}>{pkg.product.priceString}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={[styles.notConfigured, { color: theme.textSecondary }]}>
            Subscriptions aren’t configured for this build yet — connect RevenueCat + App Store Connect
            products, then this screen will show live pricing automatically.
          </Text>
        )}

        <PrimaryButton label={t.paywall.subscribe} onPress={onSubscribe} loading={busy} style={styles.subscribeButton} />
        <Pressable onPress={onRestore} disabled={busy}>
          <Text style={[styles.restoreText, { color: theme.primary }]}>{t.paywall.restore}</Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={[styles.laterText, { color: theme.textSecondary }]}>{t.paywall.maybeLater}</Text>
        </Pressable>

        <Text style={[styles.terms, { color: theme.textSecondary }]}>{t.paywall.terms}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, alignItems: 'center', paddingBottom: 40 },
  closeButton: { alignSelf: 'flex-end', padding: 8 },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  features: { alignSelf: 'stretch', marginBottom: 24, gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: { color: '#22C3A6', fontSize: 16, fontWeight: '700' },
  featureText: { fontSize: 15, flex: 1 },
  plans: { alignSelf: 'stretch', gap: 10, marginBottom: 20 },
  planCard: { borderWidth: 2, borderRadius: 14, padding: 16 },
  planTitle: { fontSize: 15, fontWeight: '600' },
  planPrice: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  notConfigured: { fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 19 },
  subscribeButton: { alignSelf: 'stretch', marginBottom: 14 },
  restoreText: { fontSize: 14, fontWeight: '600', marginBottom: 20 },
  laterText: { fontSize: 14, marginBottom: 24 },
  terms: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
