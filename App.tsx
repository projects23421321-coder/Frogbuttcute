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
import { SelectScreen } from './src/components/SelectScreen';
import { GameScreen } from './src/screens/GameScreen';
import { Sfx } from './src/game/audio';
import type { ArenaId, FrogId } from './src/game/types';
import { colors } from './src/theme';

type Screen = 'title' | 'select' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [playerFrog, setPlayerFrog] = useState<FrogId>('peaches');
  const [rivalFrog, setRivalFrog] = useState<FrogId>('gravelina');
  const [arenaId, setArenaId] = useState<ArenaId>('candyDohyo');
  const [fontsLoaded] = useFonts({
    Fredoka_700Bold,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });

  const toSelect = useCallback(() => {
    Sfx.unlock();
    Sfx.uiTap();
    setScreen('select');
  }, []);

  const confirmFighters = useCallback(
    (player: FrogId, rival: FrogId, arena: ArenaId) => {
      setPlayerFrog(player);
      setRivalFrog(rival);
      setArenaId(arena);
      setScreen('game');
    },
    [],
  );

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
          <TitleScreen onPlay={toSelect} />
        ) : screen === 'select' ? (
          <SelectScreen onBack={exit} onConfirm={confirmFighters} />
        ) : (
          <GameScreen
            onExit={exit}
            playerFrog={playerFrog}
            rivalFrog={rivalFrog}
            arenaId={arenaId}
          />
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
