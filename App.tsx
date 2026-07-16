import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
import { CreateFrogScreen } from './src/components/CreateFrogScreen';
import { GameScreen } from './src/screens/GameScreen';
import { Sfx } from './src/game/audio';
import { getActiveCustomKit } from './src/game/customFrogStore';
import {
  FIGHTERS,
  SHARE_DEFAULT_ARENA,
  type ArenaId,
  type FighterKit,
  type FrogId,
} from './src/game/types';
import { colors } from './src/theme';

type Screen = 'title' | 'select' | 'create' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [playerKit, setPlayerKit] = useState<FighterKit>(FIGHTERS[0]);
  const [rivalKit, setRivalKit] = useState<FighterKit>(FIGHTERS[1]);
  const [arenaId, setArenaId] = useState<ArenaId>(SHARE_DEFAULT_ARENA);
  const [customKit, setCustomKit] = useState<FighterKit | null>(null);
  const [fontsLoaded] = useFonts({
    Fredoka_700Bold,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });
  const [bootTimedOut, setBootTimedOut] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setBootTimedOut(true), 2500);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    void getActiveCustomKit().then((k) => {
      if (k) setCustomKit(k);
    });
  }, []);

  const ready = fontsLoaded || bootTimedOut;

  const toSelect = useCallback(() => {
    Sfx.unlock();
    Sfx.uiTap();
    setScreen('select');
  }, []);

  const toCreate = useCallback(() => {
    Sfx.unlock();
    Sfx.uiTap();
    setScreen('create');
  }, []);

  const confirmFighters = useCallback(
    (player: FrogId | 'custom', rival: FrogId, arena: ArenaId, kit?: FighterKit) => {
      if (player === 'custom' && (kit || customKit)) {
        setPlayerKit(kit ?? customKit!);
      } else {
        setPlayerKit(FIGHTERS.find((f) => f.frogId === player) ?? FIGHTERS[0]);
      }
      setRivalKit(FIGHTERS.find((f) => f.frogId === rival) ?? FIGHTERS[1]);
      setArenaId(arena);
      setScreen('game');
    },
    [customKit],
  );

  const onCreated = useCallback((kit: FighterKit) => {
    setCustomKit(kit);
    setScreen('select');
  }, []);

  const exit = useCallback(() => setScreen('title'), []);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.blush} size="large" />
        <Text style={styles.bootText}>warming up the cheeks…</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="dark" />
        {screen === 'title' ? (
          <TitleScreen onPlay={toSelect} onCreate={toCreate} heroKit={customKit ?? undefined} />
        ) : screen === 'create' ? (
          <CreateFrogScreen onBack={exit} onDone={onCreated} />
        ) : screen === 'select' ? (
          <SelectScreen
            onBack={exit}
            onConfirm={confirmFighters}
            customKit={customKit}
            onCreate={toCreate}
          />
        ) : (
          <GameScreen
            onExit={exit}
            playerKit={playerKit}
            rivalKit={rivalKit}
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
    gap: 12,
  },
  bootText: {
    color: colors.ink,
    opacity: 0.55,
    fontSize: 15,
  },
});
