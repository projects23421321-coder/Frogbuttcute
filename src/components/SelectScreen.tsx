import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ARENAS,
  FIGHTERS,
  SHARE_DEFAULT_ARENA,
  type ArenaId,
  type FighterKit,
  type FrogId,
} from '../game/types';
import { FROG_PHOTO_MODULES } from '../three/frogCutout';
import { Sfx } from '../game/audio';
import { colors, fonts } from '../theme';

type Props = {
  onBack: () => void;
  onConfirm: (
    player: FrogId | 'custom',
    rival: FrogId,
    arena: ArenaId,
    kit?: FighterKit,
  ) => void;
  customKit?: FighterKit | null;
  onCreate: () => void;
};

export function SelectScreen({ onBack, onConfirm, customKit, onCreate }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [picked, setPicked] = useState<FrogId | 'custom'>(
    customKit ? 'custom' : 'peaches',
  );
  const [arena, setArena] = useState<ArenaId>(SHARE_DEFAULT_ARENA);
  const cardW = Math.min(100, (width - 48) / 3 - 8);

  const selected: FighterKit =
    picked === 'custom' && customKit
      ? customKit
      : FIGHTERS.find((f) => f.frogId === picked) ?? FIGHTERS[0];
  const arenaKit = ARENAS.find((a) => a.id === arena)!;

  const confirm = () => {
    Sfx.uiTap();
    const rivals = FIGHTERS.filter((f) => f.frogId !== selected.frogId || selected.frogId === 'custom');
    const rival = rivals[Math.floor(Math.random() * rivals.length)];
    onConfirm(
      picked === 'custom' ? 'custom' : selected.frogId,
      rival.frogId,
      arena,
      picked === 'custom' ? customKit ?? undefined : undefined,
    );
  };

  return (
    <LinearGradient
      colors={['#1A1028', '#3A1840', '#FF8FAB']}
      style={[
        styles.root,
        {
          paddingTop: Math.max(36, insets.top + 8),
          paddingBottom: Math.max(20, insets.bottom + 12),
        },
      ]}
    >
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.back}>← back</Text>
      </Pressable>

      <Text style={styles.title}>pick your cheeks</Text>
      <Text style={styles.sub}>disco default · clip-ready arenas</Text>

      <View style={styles.hero}>
        <Image
          source={FROG_PHOTO_MODULES[selected.photoKey]}
          style={styles.heroImg}
          resizeMode="contain"
        />
        <Text style={styles.name}>{selected.name}</Text>
        <Text style={styles.tag}>{selected.tagline}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {customKit ? (
          <FighterCard
            kit={customKit}
            width={cardW}
            selected={picked === 'custom'}
            onPress={() => {
              Sfx.uiTap();
              setPicked('custom');
            }}
            badge="YOU"
          />
        ) : null}
        {FIGHTERS.map((f) => (
          <FighterCard
            key={f.frogId}
            kit={f}
            width={cardW}
            selected={picked === f.frogId}
            onPress={() => {
              Sfx.uiTap();
              setPicked(f.frogId);
            }}
          />
        ))}
      </ScrollView>

      <Pressable onPress={onCreate} style={styles.createLink}>
        <Text style={styles.createLinkText}>
          {customKit ? 'edit your frog' : '+ build a custom dump truck'}
        </Text>
      </Pressable>

      <Text style={styles.arenaLabel}>arena</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.arenaRow}
      >
        {ARENAS.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => {
              Sfx.uiTap();
              setArena(a.id);
            }}
            style={[styles.arenaChip, arena === a.id && styles.arenaChipOn]}
          >
            <Text
              style={[styles.arenaChipText, arena === a.id && styles.arenaChipTextOn]}
            >
              {a.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.arenaTag}>{arenaKit.tagline}</Text>

      <Pressable
        onPress={confirm}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaText}>lock in & twerk</Text>
      </Pressable>
    </LinearGradient>
  );
}

function FighterCard({
  kit,
  width,
  selected,
  onPress,
  badge,
}: {
  kit: FighterKit;
  width: number;
  selected: boolean;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { width }, selected && styles.cardSelected]}
    >
      <Image
        source={FROG_PHOTO_MODULES[kit.photoKey]}
        style={styles.cardImg}
        resizeMode="cover"
      />
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      <Text style={styles.cardName}>{kit.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
  },
  back: {
    fontFamily: fonts.body,
    color: colors.cream,
    opacity: 0.75,
    fontSize: 15,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.blush,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.cream,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 8,
  },
  hero: {
    alignItems: 'center',
    flexShrink: 1,
    justifyContent: 'center',
    minHeight: 130,
  },
  heroImg: {
    width: 150,
    height: 150,
    borderRadius: 24,
    backgroundColor: 'rgba(255,248,240,0.12)',
  },
  name: {
    marginTop: 8,
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.blush,
  },
  tag: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.cream,
    opacity: 0.7,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,248,240,0.12)',
    borderWidth: 2,
    borderColor: 'transparent',
    paddingBottom: 6,
  },
  cardSelected: {
    borderColor: colors.blush,
    transform: [{ translateY: -3 }],
  },
  cardImg: {
    width: '100%',
    height: 72,
    backgroundColor: '#2A1840',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.blush,
    color: colors.cream,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
    borderRadius: 6,
  },
  cardName: {
    marginTop: 4,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.cream,
  },
  createLink: { alignSelf: 'center', marginTop: 8, marginBottom: 4 },
  createLinkText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.cream,
    opacity: 0.85,
    textDecorationLine: 'underline',
  },
  arenaLabel: {
    marginTop: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.cream,
    opacity: 0.5,
    letterSpacing: 1,
    textAlign: 'center',
  },
  arenaRow: {
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  arenaChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,248,240,0.12)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  arenaChipOn: {
    borderColor: colors.blush,
    backgroundColor: 'rgba(255,107,157,0.25)',
  },
  arenaChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.cream,
    opacity: 0.75,
  },
  arenaChipTextOn: {
    opacity: 1,
    color: colors.blushSoft,
  },
  arenaTag: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.cream,
    opacity: 0.55,
    textAlign: 'center',
    marginBottom: 12,
  },
  cta: {
    alignSelf: 'center',
    backgroundColor: colors.blush,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20,
    borderBottomWidth: 5,
    borderBottomColor: '#E0688A',
  },
  ctaPressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 2,
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.cream,
  },
});
