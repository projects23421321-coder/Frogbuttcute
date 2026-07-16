import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import {
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { TitleScreen } from './src/components/TitleScreen';
import { GameScreen } from './src/screens/GameScreen';
import { colors } from './src/theme';

type Screen = 'title' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [fontsLoaded] = useFonts({
    Fredoka_700Bold,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });

  const play = useCallback(() => setScreen('game'), []);
  const exit = useCallback(() => setScreen('title'), []);

  if (!fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.blush} size="large" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="dark" />
        {screen === 'title' ? (
          <TitleScreen onPlay={play} />
        ) : (
          <GameScreen onExit={exit} />
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.skyCute,
  },
  boot: {
    flex: 1,
    backgroundColor: colors.skyCute,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
