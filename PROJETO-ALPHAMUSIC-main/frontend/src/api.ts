import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") return AsyncStorage.getItem("token");
  return SecureStore.getItemAsync("token");
}

export async function setToken(token: string) {
  if (Platform.OS === "web") return AsyncStorage.setItem("token", token);
  return SecureStore.setItemAsync("token", token);
}

export async function clearToken() {
  if (Platform.OS === "web") return AsyncStorage.removeItem("token");
  return SecureStore.deleteItemAsync("token");
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: any = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : ((await res.text()) as any);
}

export { getToken };
