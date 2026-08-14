import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useReminders } from '../state/RemindersContext';
import { useAddresses } from '../state/AddressesContext';
import { useChat } from '../state/ChatContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { GeocodedPlace, geocodePlace } from '../location/geocoding';
import { requestLocationPermissions } from '../location/geofencing';
import { LocationTrigger } from '../types';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'LocationPicker'>;

// A native map only renders on iOS/Android. On web we fall back to a
// text-based confirmation card so the picker still works for testing.
let MapView: React.ComponentType<Record<string, unknown>> | null = null;
let Marker: React.ComponentType<Record<string, unknown>> | null = null;
let PROVIDER_GOOGLE: string | undefined;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rnMaps = require('react-native-maps');
    MapView = rnMaps.default;
    Marker = rnMaps.Marker;
    PROVIDER_GOOGLE = rnMaps.PROVIDER_GOOGLE;
  } catch {
    MapView = null;
    Marker = null;
  }
}

// Set by app.config.ts only when GOOGLE_MAPS_API_KEY was present at build
// time — the native Google Maps SDK key is baked in then, so requesting the
// Google provider without it would just render a blank map.
const GOOGLE_MAPS_CONFIGURED = Boolean(
  (Constants.expoConfig?.extra as Record<string, unknown> | undefined)?.googleMapsConfigured
);

const RADIUS_OPTIONS = [100, 250, 500, 1000];

export function LocationPickerScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { addReminder } = useReminders();
  const { addAddress } = useAddresses();
  const { appendMessage } = useChat();
  const isAddressMode = route.params?.returnTo === 'addresses';

  const [query, setQuery] = useState('');
  const [title, setTitle] = useState(route.params?.prefillTitle ?? '');
  const [results, setResults] = useState<GeocodedPlace[]>([]);
  const [selected, setSelected] = useState<GeocodedPlace | null>(null);
  const [trigger, setTrigger] = useState<LocationTrigger>('arrive');
  const [radius, setRadius] = useState(150);
  const [searching, setSearching] = useState(false);
  const [permissionOk, setPermissionOk] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    requestLocationPermissions().then((p) => setPermissionOk(p.foreground));
  }, []);

  const runSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setSelected(null);
    try {
      const places = await geocodePlace(query);
      setResults(places);
      if (places[0]) setSelected(places[0]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const save = async () => {
    if (!selected || !title.trim()) return;

    if (isAddressMode) {
      await addAddress({
        name: title.trim(),
        latitude: selected.latitude,
        longitude: selected.longitude,
        radius,
      });
    } else {
      const reminder = await addReminder({
        title: title.trim(),
        dueDate: null,
        location: {
          latitude: selected.latitude,
          longitude: selected.longitude,
          radius,
          name: selected.label,
          trigger,
        },
      });
      if (route.params?.returnTo === 'chat') {
        await appendMessage(
          'assistant',
          `${t.chat.locationCreatedFor}: ${title.trim()}`,
          [{ kind: 'location-reminder-created', reminderId: reminder.id }]
        );
      }
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.primary, fontSize: 16 }}>{t.common.cancel}</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isAddressMode ? 'إضافة عنوان' : t.location.pickerTitle}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {!permissionOk ? (
        <View style={[styles.notice, { backgroundColor: theme.warning + '22', borderColor: theme.warning }]}>
          <Text style={{ color: theme.text, fontSize: 13 }}>{t.location.permissionNeeded}</Text>
        </View>
      ) : null}

      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.location.searchPlaceholder}
          placeholderTextColor={theme.textSecondary}
          onSubmitEditing={runSearch}
          returnKeyType="search"
          style={[styles.searchInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
        />
        <PrimaryButton label={t.location.searchButton} onPress={runSearch} loading={searching} style={{ paddingHorizontal: 16 }} />
        <Pressable
          onPress={() => {
            const url = `https://www.google.com/maps/search/${encodeURIComponent(query || 'places')}`;
            Linking.openURL(url).catch(() => {});
          }}
          style={[styles.mapButton, { backgroundColor: theme.primary }]}
          accessibilityLabel="Open Google Maps"
        >
          <Text style={{ fontSize: 18 }}>📍</Text>
        </Pressable>
      </View>

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item.latitude}-${item.longitude}-${i}`}
          style={{ maxHeight: 160 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelected(item)}
              style={[
                styles.resultRow,
                {
                  borderColor: selected === item ? theme.primary : theme.border,
                  backgroundColor: selected === item ? theme.surfaceAlt : theme.surface,
                },
              ]}
            >
              <Text style={{ color: theme.text, fontSize: 14 }} numberOfLines={2}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      ) : searching ? (
        <View style={{ padding: 16 }}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : null}

      {selected && MapView && Marker ? (
        <Pressable
          onPress={() => {
            const url = Platform.OS === 'ios'
              ? `maps://maps.apple.com/?q=${encodeURIComponent(selected.label)}&ll=${selected.latitude},${selected.longitude}`
              : `geo:${selected.latitude},${selected.longitude}?q=${encodeURIComponent(selected.label)}`;
            Linking.openURL(url).catch(() => {
              Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(selected.label)}`);
            });
          }}
          style={styles.mapContainer}
        >
          <MapView
            style={StyleSheet.absoluteFill}
            provider={GOOGLE_MAPS_CONFIGURED ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: selected.latitude,
              longitude: selected.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            region={{
              latitude: selected.latitude,
              longitude: selected.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            <Marker coordinate={{ latitude: selected.latitude, longitude: selected.longitude }} title={selected.label} />
          </MapView>
        </Pressable>
      ) : selected ? (
        <Pressable
          onPress={() => {
            const url = Platform.OS === 'ios'
              ? `maps://maps.apple.com/?q=${encodeURIComponent(selected.label)}&ll=${selected.latitude},${selected.longitude}`
              : `geo:${selected.latitude},${selected.longitude}?q=${encodeURIComponent(selected.label)}`;
            Linking.openURL(url).catch(() => {
              Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(selected.label)}`);
            });
          }}
          style={[styles.mapFallback, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={styles.mapFallbackIcon}>📍</Text>
          <Text style={{ color: theme.text, fontSize: 14, textAlign: 'center' }}>{selected.label}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
            {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
          </Text>
        </Pressable>
      ) : null}

      {selected ? (
        <View style={styles.formSection}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.reminder.titleField}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[styles.titleInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
          />

          {!isAddressMode ? (
            <>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.location.triggerLabel}</Text>
              <View style={styles.chipsRow}>
                {(['arrive', 'leave', 'passing'] as LocationTrigger[]).map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => setTrigger(opt)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: trigger === opt ? theme.primary : theme.surfaceAlt,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={{ color: trigger === opt ? theme.textInverse : theme.text, fontSize: 13 }}>
                      {opt === 'arrive' ? t.location.triggerArrive : opt === 'leave' ? t.location.triggerLeave : t.location.triggerPassing}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t.location.radiusLabel}</Text>
          <View style={styles.chipsRow}>
            {RADIUS_OPTIONS.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRadius(r)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: radius === r ? theme.primary : theme.surfaceAlt,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={{ color: radius === r ? theme.textInverse : theme.text, fontSize: 13 }}>{r}m</Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton
            label={t.location.save}
            onPress={save}
            disabled={!title.trim()}
            style={{ marginTop: 20 }}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  notice: { marginHorizontal: 16, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10, alignItems: 'center' },
  searchInput: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
  mapButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultRow: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  mapContainer: { height: 220, marginHorizontal: 16, marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  mapFallback: { marginHorizontal: 16, marginTop: 8, padding: 20, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  mapFallbackIcon: { fontSize: 32, marginBottom: 8 },
  formSection: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 8, marginBottom: 6 },
  titleInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 },
});
