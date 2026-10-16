import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  surface: "#F8FAFC",
  onSurface: "#0F172A",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#1E293B",
  surfaceTertiary: "#F1F5F9",
  onSurfaceTertiary: "#334155",
  surfaceInverse: "#0F172A",
  onSurfaceInverse: "#FFFFFF",
  muted: "#64748B",

  brand: "#0D9488",
  onBrand: "#FFFFFF",
  brandPrimary: "#0F766E",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#14B8A6",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#CCFBF1",
  onBrandTertiary: "#0F766E",

  success: "#059669",
  onSuccess: "#FFFFFF",
  warning: "#D97706",
  onWarning: "#FFFFFF",
  error: "#DC2626",
  onError: "#FFFFFF",
  info: "#0284C7",
  onInfo: "#FFFFFF",

  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  divider: "#F1F5F9",
};

const dark: typeof light = {
  surface: "#0F172A",
  onSurface: "#F8FAFC",
  surfaceSecondary: "#1E293B",
  onSurfaceSecondary: "#F1F5F9",
  surfaceTertiary: "#334155",
  onSurfaceTertiary: "#E2E8F0",
  surfaceInverse: "#F8FAFC",
  onSurfaceInverse: "#0F172A",
  muted: "#94A3B8",

  brand: "#0D9488",
  onBrand: "#FFFFFF",
  brandPrimary: "#14B8A6",
  onBrandPrimary: "#0F172A",
  brandSecondary: "#2DD4BF",
  onBrandSecondary: "#0F172A",
  brandTertiary: "#042F2E",
  onBrandTertiary: "#5EEAD4",

  success: "#10B981",
  onSuccess: "#022C22",
  warning: "#F59E0B",
  onWarning: "#451A03",
  error: "#EF4444",
  onError: "#450A0A",
  info: "#38BDF8",
  onInfo: "#082F49",

  border: "#334155",
  borderStrong: "#475569",
  divider: "#1E293B",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;
export const themes: { light: ThemeColors; dark?: ThemeColors } = { light, dark };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 };
export const radius = { sm: 6, md: 12, lg: 20, pill: 999 };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

export const colors = light;
