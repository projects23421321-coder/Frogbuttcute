import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultCustomFrog,
  kitFromCustom,
  type CustomFrog,
  type FighterKit,
} from './types';

const KEY = 'frogbutt.customFrogs.v1';
const ACTIVE_KEY = 'frogbutt.activeCustomId.v1';

export async function loadCustomFrogs(): Promise<CustomFrog[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomFrog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCustomFrog(frog: CustomFrog): Promise<CustomFrog[]> {
  const list = await loadCustomFrogs();
  const idx = list.findIndex((f) => f.id === frog.id);
  if (idx >= 0) list[idx] = frog;
  else list.unshift(frog);
  const trimmed = list.slice(0, 12);
  await AsyncStorage.setItem(KEY, JSON.stringify(trimmed));
  await AsyncStorage.setItem(ACTIVE_KEY, frog.id);
  return trimmed;
}

export async function getActiveCustomKit(): Promise<FighterKit | null> {
  try {
    const id = await AsyncStorage.getItem(ACTIVE_KEY);
    const list = await loadCustomFrogs();
    const found = id ? list.find((f) => f.id === id) : list[0];
    return found ? kitFromCustom(found) : null;
  } catch {
    return null;
  }
}

export async function ensureDraft(): Promise<CustomFrog> {
  const list = await loadCustomFrogs();
  if (list[0]) return list[0];
  const draft = defaultCustomFrog();
  await saveCustomFrog(draft);
  return draft;
}
