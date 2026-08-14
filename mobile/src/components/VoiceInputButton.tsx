import React, { useCallback, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

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
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
      ])
    ).start();
    ExpoSpeechRecognitionModule.start({
      lang: lang === 'ar' ? 'ar-SA' : 'en-US',
      interimResults: false,
      continuous: false,
    });
  }, [lang, pulseAnim, t]);

  const stop = useCallback(() => {
    pulseAnim.setValue(0);
    ExpoSpeechRecognitionModule.stop();
  }, [pulseAnim]);

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View>
      {listening ? (
        <Animated.View
          style={[
            styles.pulse,
            {
              opacity: pulseOpacity,
              borderColor: '#EF4444',
            },
          ]}
        />
      ) : null}
      <Pressable
        onPress={listening ? stop : start}
        style={[
          styles.button,
          {
            backgroundColor: listening ? '#EF4444' : theme.primary,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="voice input"
      >
        <Text style={styles.icon}>🎙️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  pulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    top: -6,
    left: -6,
  },
});
