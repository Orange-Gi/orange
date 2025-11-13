import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@time-collab/';

type Serializable = string | number | boolean | Record<string, unknown> | Array<unknown> | null;

const withPrefix = (key: string) => `${STORAGE_PREFIX}${key}`;

const throttleTimers = new Map<string, ReturnType<typeof setTimeout>>();

async function setItemImmediate(key: string, value: string) {
  await AsyncStorage.setItem(withPrefix(key), value);
}

export async function getItem(key: string) {
  return AsyncStorage.getItem(withPrefix(key));
}

export async function setItem(key: string, value: string) {
  await setItemImmediate(key, value);
}

export async function removeItem(key: string) {
  await AsyncStorage.removeItem(withPrefix(key));
}

export async function getJSON<T = Serializable>(key: string): Promise<T | null> {
  const raw = await getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn('[storage] Failed to parse JSON for key:', key, error);
    return null;
  }
}

export async function setJSON<T extends Serializable>(key: string, value: T) {
  await setItem(key, JSON.stringify(value));
}

export function setJSONThrottled<T extends Serializable>(key: string, value: T, throttleMs = 1000) {
  const existingTimer = throttleTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(async () => {
    try {
      await setJSON(key, value);
    } finally {
      throttleTimers.delete(key);
    }
  }, throttleMs);

  throttleTimers.set(key, timer);
}

export function cancelThrottle(key: string) {
  const existingTimer = throttleTimers.get(key);
  if (existingTimer) {
    clearTimeout(existingTimer);
    throttleTimers.delete(key);
  }
}

export async function clearAll() {
  const keys = await AsyncStorage.getAllKeys();
  const scopedKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
  if (scopedKeys.length) {
    await AsyncStorage.multiRemove(scopedKeys);
  }
}

