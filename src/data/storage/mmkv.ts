import { createMMKV } from "react-native-mmkv";

export const appStorage = createMMKV({
  id: "app-storage",
});

export const supabaseSessionStorage = {
  getItem: (key: string) => appStorage.getString(key) ?? null,
  setItem: (key: string, value: string) => {
    appStorage.set(key, value);
  },
  removeItem: (key: string) => {
    appStorage.remove(key);
  },
};
