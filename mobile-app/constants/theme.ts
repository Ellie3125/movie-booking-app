/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Nunito_400Regular',
    sansMedium: 'Nunito_600SemiBold',
    sansBold: 'Nunito_700Bold',
    rounded: 'Nunito_800ExtraBold',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Nunito_400Regular',
    sansMedium: 'Nunito_600SemiBold',
    sansBold: 'Nunito_700Bold',
    rounded: 'Nunito_800ExtraBold',
    mono: 'monospace',
  },
  web: {
    sans: 'Nunito_400Regular',
    sansMedium: 'Nunito_600SemiBold',
    sansBold: 'Nunito_700Bold',
    rounded: 'Nunito_800ExtraBold',
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const AzureColors = {
  appBackground: '#EEF6FF',
  surface: '#FFFFFF',
  primary: '#003468',
  primaryContainer: '#064B8E',
  secondary: '#0061A4',
  primaryLight: '#DCEEFF',
  textPrimary: '#001C3B',
  textSecondary: '#6B7A90',
  mutedText: '#9AA8B8',
  border: '#D8E5F2',
  danger: '#E5484D',
  warning: '#FFD25A',
  warningSurface: '#FFF3D6',
  normalSeat: '#E8F1FB',
  coupleSeat: '#FDE6F2',        // hồng phấn ngọt ngào
  coupleSeatText: '#BE185D',    // chữ hồng đậm cho couple
  vipSeatBg: '#FFFBEB',         // vàng ấm nhạt cho VIP
  vipBorder: '#F59E0B',         // vàng cam sang trọng
  vipSeatText: '#B45309',       // chữ nâu hổ phách cho VIP
  bookedSeat: '#B8C5D3',
  selectedSeat: '#D97706',      // amber ấm — nổi bật trên nền xanh nhạt
  disabledSurface: '#E2EAF3',
  overlay: 'rgba(0, 28, 59, 0.46)',
} as const;

export const AzureSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const AzureRadius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  round: 999,
} as const;

export const AzureShadow = {
  card: {
    shadowColor: '#003468',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  floating: {
    shadowColor: '#003468',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

/* ── Vibrant Cinema Design System (DESIGN.md) ── */

export const VibrantColors = {
  primary: '#EC2A93',
  primaryContainer: '#dc1787',
  onPrimary: '#ffffff',
  primaryFixed: '#ffd9e5',
  primaryFixedDim: '#ffb0cd',
  onPrimaryFixed: '#3e0022',

  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceBright: '#f8f9fa',
  surfaceContainerLow: '#f3f4f5',

  onSurface: '#191c1d',
  onSurfaceVariant: '#594049',
  outlineVariant: '#e0bdc8',

  textDark: '#2B2B2B',
  textMuted: '#777777',

  error: '#ba1a1a',
  onError: '#ffffff',

  lavenderSeat: '#EEDBFF',
  purpleText: '#7A3BB3',
  couplePink: '#FDE6F2',
  bookedDark: '#1F2937',
  vipGreen: '#4be260',
  warningOrange: '#F59E0B',

  secondary: '#6d5964',
  secondaryContainer: '#f7dbe9',
  tertiaryContainer: '#008729',
} as const;

export const VibrantShadow = {
  bottomPanel: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
  },
  selectedSeat: {
    shadowColor: '#EC2A93',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
} as const;
