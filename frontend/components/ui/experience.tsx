import { type PropsWithChildren } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';

type Tone = 'admin' | 'user';

const palette = {
  admin: {
    canvas: '#09111F',
    panel: '#101B30',
    panelAlt: '#0E1628',
    text: '#EFF6FF',
    muted: '#9FB0D0',
    accent: '#58D0FF',
    accentSoft: 'rgba(88, 208, 255, 0.14)',
    border: 'rgba(159, 176, 208, 0.16)',
  },
  user: {
    canvas: '#FFF7E8',
    panel: '#FFFDF7',
    panelAlt: '#FFF1D6',
    text: '#4B2E22',
    muted: '#8C6856',
    accent: '#E87A22',
    accentSoft: 'rgba(232, 122, 34, 0.12)',
    border: 'rgba(140, 104, 86, 0.16)',
  },
} as const;

export function getTonePalette(tone: Tone) {
  return palette[tone];
}

export function PageScroll({
  children,
  tone,
}: PropsWithChildren<{ tone: Tone }>) {
  const colors = palette[tone];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
      <View
        style={[
          styles.glow,
          styles.glowPrimary,
          { backgroundColor: colors.accentSoft },
        ]}
      />
      <View
        style={[
          styles.glow,
          styles.glowSecondary,
          { backgroundColor: colors.accentSoft },
        ]}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function HeroCard({
  tone,
  eyebrow,
  title,
  description,
  children,
}: PropsWithChildren<{
  tone: Tone;
  eyebrow: string;
  title: string;
  description: string;
}>) {
  const colors = palette[tone];

  return (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: colors.panel,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text>
      <Text style={[styles.heroTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.heroDescription, { color: colors.muted }]}>
        {description}
      </Text>
      {children}
    </View>
  );
}

export function SectionTitle({
  tone,
  title,
  description,
}: {
  tone: Tone;
  title: string;
  description?: string;
}) {
  const colors = palette[tone];

  return (
    <View style={styles.sectionTitle}>
      <Text style={[styles.sectionHeadline, { color: colors.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.sectionDescription, { color: colors.muted }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function SectionCard({
  tone,
  style,
  children,
}: PropsWithChildren<{ tone: Tone; style?: ViewStyle }>) {
  const colors = palette[tone];

  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: colors.panelAlt,
          borderColor: colors.border,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function MetricTile({
  tone,
  value,
  label,
  helper,
}: {
  tone: Tone;
  value: string;
  label: string;
  helper: string;
}) {
  const colors = palette[tone];

  return (
    <View
      style={[
        styles.metricTile,
        {
          backgroundColor: colors.accentSoft,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.metricHelper, { color: colors.muted }]}>{helper}</Text>
    </View>
  );
}

export function Chip({
  tone,
  label,
  active = false,
  onPress,
}: {
  tone: Tone;
  label: string;
  active?: boolean;
  onPress?: PressableProps['onPress'];
}) {
  const colors = palette[tone];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accent : colors.accentSoft,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}>
      <Text
        style={[
          styles.chipText,
          {
            color: active ? (tone === 'admin' ? '#09111F' : '#FFFDF8') : colors.text,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ActionButton({
  tone,
  label,
  variant = 'primary',
  ...pressableProps
}: {
  tone: Tone;
  label: string;
  variant?: 'primary' | 'secondary';
} & PressableProps) {
  const colors = palette[tone];
  const primary = variant === 'primary';
  const { style: pressableStyle, ...restPressableProps } = pressableProps;

  return (
    <Pressable
      {...restPressableProps}
      style={(state) => [
        styles.actionButton,
        {
          backgroundColor: primary ? colors.accent : colors.panelAlt,
          borderColor: primary ? colors.accent : colors.border,
        },
        typeof pressableStyle === 'function' ? pressableStyle(state) : pressableStyle,
      ]}>
      <Text
        style={[
          styles.actionButtonText,
          {
            color: primary ? (tone === 'admin' ? '#09111F' : '#FFFDF7') : colors.text,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function EmptyNotice({
  tone,
  title,
  description,
}: {
  tone: Tone;
  title: string;
  description: string;
}) {
  const colors = palette[tone];

  return (
    <View
      style={[
        styles.emptyNotice,
        {
          backgroundColor: colors.accentSoft,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: colors.muted }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 32,
    gap: 18,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowPrimary: {
    width: 220,
    height: 220,
    top: -48,
    right: -44,
  },
  glowSecondary: {
    width: 180,
    height: 180,
    bottom: 30,
    left: -54,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: Fonts.rounded,
    fontWeight: '800',
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    gap: 4,
  },
  sectionHeadline: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Fonts.rounded,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  metricTile: {
    minWidth: 130,
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricHelper: {
    fontSize: 12,
    lineHeight: 18,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyNotice: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
