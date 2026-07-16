import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FIGHTERS,
  kitFromCustom,
  type AccessoryId,
  type CustomFrog,
  type FighterKit,
  type PhotoKey,
} from '../game/types';
import { ensureDraft, saveCustomFrog } from '../game/customFrogStore';
import { shareFrogCard } from '../game/clipCapture';
import { FROG_PHOTO_MODULES } from '../three/frogCutout';
import { PreviewCanvas } from '../three/GameCanvas';
import { Sfx } from '../game/audio';
import { colors, fonts } from '../theme';

type Props = {
  onBack: () => void;
  onDone: (kit: FighterKit) => void;
};

const ACCESSORIES: AccessoryId[] = ['none', 'bow', 'shades', 'chain'];
const TINTS: CustomFrog['tint'][] = ['none', 'pink', 'warm', 'cool', 'gold'];
const BASES = FIGHTERS.map((f) => f.photoKey);

export function CreateFrogScreen({ onBack, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [draft, setDraft] = useState<CustomFrog | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void ensureDraft().then(setDraft);
  }, []);

  const kit = useMemo(() => (draft ? kitFromCustom(draft) : null), [draft]);

  const patch = (partial: Partial<CustomFrog>) => {
    setDraft((d) => (d ? { ...d, ...partial } : d));
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    Sfx.uiTap();
    const list = await saveCustomFrog(draft);
    const saved = list.find((f) => f.id === draft.id) ?? draft;
    setSaving(false);
    onDone(kitFromCustom(saved));
  };

  const share = async () => {
    if (!draft) return;
    Sfx.uiTap();
    await shareFrogCard({
      name: draft.name,
      tagline: draft.tagline,
      cheekScale: draft.cheekScale,
    });
  };

  if (!draft || !kit) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.loading}>sculpting cheeks…</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1A1028', '#3A1840', '#FF6B9D']}
      style={[
        styles.root,
        {
          paddingTop: Math.max(28, insets.top + 6),
          paddingBottom: Math.max(16, insets.bottom + 10),
        },
      ]}
    >
      <View style={styles.topRow}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.back}>← back</Text>
        </Pressable>
        <Text style={styles.title}>build your frog</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={[styles.preview, { height: Math.min(280, width * 0.72) }]}>
        <PreviewCanvas kit={kit} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>name</Text>
        <TextInput
          value={draft.name}
          onChangeText={(name) => patch({ name })}
          style={styles.input}
          maxLength={18}
          placeholderTextColor="rgba(255,248,240,0.4)"
        />

        <Text style={styles.label}>tagline</Text>
        <TextInput
          value={draft.tagline}
          onChangeText={(tagline) => patch({ tagline })}
          style={styles.input}
          maxLength={36}
          placeholderTextColor="rgba(255,248,240,0.4)"
        />

        <Text style={styles.label}>base photo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowScroll}>
          {BASES.map((key) => (
            <Pressable
              key={key}
              onPress={() => {
                Sfx.uiTap();
                patch({ photoKey: key as PhotoKey });
              }}
              style={[
                styles.photoChip,
                draft.photoKey === key && styles.photoChipOn,
              ]}
            >
              <Image
                source={FROG_PHOTO_MODULES[key as PhotoKey]}
                style={styles.photoImg}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.label}>
          cheek dump-truck · {draft.cheekScale.toFixed(2)}x
        </Text>
        <View style={styles.sliderRow}>
          {[0.85, 1.1, 1.35, 1.55, 1.8].map((v) => (
            <Pressable
              key={v}
              onPress={() => {
                Sfx.uiTap();
                patch({ cheekScale: v });
              }}
              style={[styles.pill, Math.abs(draft.cheekScale - v) < 0.01 && styles.pillOn]}
            >
              <Text style={styles.pillText}>{v.toFixed(2)}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>jiggle · {draft.jiggle.toFixed(2)}x</Text>
        <View style={styles.sliderRow}>
          {[0.8, 1, 1.2, 1.45, 1.7].map((v) => (
            <Pressable
              key={v}
              onPress={() => {
                Sfx.uiTap();
                patch({ jiggle: v });
              }}
              style={[styles.pill, Math.abs(draft.jiggle - v) < 0.01 && styles.pillOn]}
            >
              <Text style={styles.pillText}>{v.toFixed(2)}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>tint</Text>
        <View style={styles.sliderRow}>
          {TINTS.map((t) => (
            <Pressable
              key={t}
              onPress={() => {
                Sfx.uiTap();
                patch({ tint: t });
              }}
              style={[styles.pill, draft.tint === t && styles.pillOn]}
            >
              <Text style={styles.pillText}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>drip</Text>
        <View style={styles.sliderRow}>
          {ACCESSORIES.map((a) => (
            <Pressable
              key={a}
              onPress={() => {
                Sfx.uiTap();
                patch({ accessory: a });
              }}
              style={[styles.pill, draft.accessory === a && styles.pillOn]}
            >
              <Text style={styles.pillText}>{a}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.ctaRow}>
          <Pressable onPress={share} style={styles.shareBtn}>
            <Text style={styles.shareText}>share frog card</Text>
          </Pressable>
          <Pressable
            onPress={save}
            disabled={saving}
            style={({ pressed }) => [styles.saveBtn, pressed && styles.savePressed]}
          >
            <Text style={styles.saveText}>{saving ? '…' : 'lock cheeks'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1028' },
  loading: { color: '#FFC2D1', fontFamily: fonts.body },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  back: { color: '#FFF8F0', opacity: 0.75, fontFamily: fonts.body, fontSize: 15, width: 48 },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: '#FF8FAB',
  },
  preview: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#12081C',
  },
  form: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 6 },
  label: {
    marginTop: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: 'rgba(255,248,240,0.55)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255,248,240,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFF8F0',
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  rowScroll: { marginVertical: 4 },
  photoChip: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoChipOn: { borderColor: '#FF6B9D' },
  photoImg: { width: '100%', height: '100%' },
  sliderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,248,240,0.12)',
  },
  pillOn: { backgroundColor: '#FF6B9D' },
  pillText: { color: '#FFF8F0', fontFamily: fonts.bodyBold, fontSize: 13 },
  ctaRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  shareBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFC2D1',
  },
  shareText: { color: '#FFC2D1', fontFamily: fonts.bodyBold, fontSize: 15 },
  saveBtn: {
    flex: 1.2,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FF6B9D',
  },
  savePressed: { opacity: 0.85 },
  saveText: { color: '#FFF8F0', fontFamily: fonts.bodyBold, fontSize: 16 },
});
