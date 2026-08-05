import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';

interface Props {
  onResult: (transcript: string) => void;
}

export function VoiceInputButton({ onResult }: Props) {
  const theme = useTheme();
  const { lang, t } = useI18n();
  const [listening, setListening] = useState(false);

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) onResult(transcript);
  });

  useSpeechRecognitionEvent('end', () => setListening(false));

  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      Alert.alert(event.error, event.message);
    }
  });

  const start = useCallback(async () => {
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t.common.error, t.compose.micPermissionDenied);
      return;
    }
    setListening(true);
    ExpoSpeechRecognitionModule.start({
      lang: lang === 'ar' ? 'ar-SA' : 'en-US',
      interimResults: false,
      continuous: false,
    });
  }, [lang]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return (
    <Pressable
      onPress={listening ? stop : start}
      style={[
        styles.button,
        { backgroundColor: listening ? theme.danger : theme.primary },
      ]}
      accessibilityRole="button"
      accessibilityLabel="voice input"
    >
      <Text style={styles.icon}>{listening ? '⏹' : '🎙️'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20 },
});
