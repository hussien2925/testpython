import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface GeocodedPlace {
  latitude: number;
  longitude: number;
  label: string;
}

async function geocodeViaNominatim(query: string): Promise<GeocodedPlace[]> {
  // Fallback for Web (where expo-location.geocodeAsync isn't implemented)
  // using OpenStreetMap's free Nominatim endpoint. The usage policy requires
  // a descriptive User-Agent identifying the client — set here explicitly.
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Nabhni/1.0 (reminders app)' },
  });
  if (!response.ok) return [];
  const rows = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  return rows.map((r) => ({
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
    label: r.display_name,
  }));
}

export async function geocodePlace(query: string): Promise<GeocodedPlace[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (Platform.OS === 'web') {
    return geocodeViaNominatim(trimmed);
  }

  try {
    const perms = await Location.getForegroundPermissionsAsync();
    if (!perms.granted) {
      const asked = await Location.requestForegroundPermissionsAsync();
      if (!asked.granted) return geocodeViaNominatim(trimmed);
    }
    const results = await Location.geocodeAsync(trimmed);
    if (results.length === 0) return geocodeViaNominatim(trimmed);
    const withLabels = await Promise.all(
      results.map(async (r) => {
        const addr = await Location.reverseGeocodeAsync({ latitude: r.latitude, longitude: r.longitude }).catch(() => []);
        const first = addr[0];
        const parts = first
          ? [first.name, first.street, first.city, first.region, first.country].filter(Boolean)
          : [];
        return {
          latitude: r.latitude,
          longitude: r.longitude,
          label: parts.length > 0 ? parts.join(', ') : trimmed,
        };
      })
    );
    return withLabels;
  } catch {
    return geocodeViaNominatim(trimmed);
  }
}
