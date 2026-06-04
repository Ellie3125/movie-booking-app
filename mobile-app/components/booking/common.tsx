import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { type ComponentProps } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
} from 'react-native';

import { AzureColors, AzureRadius, AzureShadow, Fonts } from '@/constants/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export function IconButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress?: PressableProps['onPress'];
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        disabled ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}>
      <MaterialCommunityIcons name={icon} size={24} color={AzureColors.primary} />
    </Pressable>
  );
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  onSupport,
  onHome,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onSupport?: () => void;
  onHome?: () => void;
}) {
  return (
    <View style={styles.header}>
      <IconButton icon="arrow-left" label="Quay lại" onPress={onBack} />
      <View style={styles.headerCopy}>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.headerActions}>
        <IconButton icon="headset" label="Hỗ trợ" onPress={onSupport} />
        <IconButton icon="home-outline" label="Về trang chọn phim" onPress={onHome} />
      </View>
    </View>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  onVoicePress,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  onVoicePress?: () => void;
}) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.searchBox}>
        <MaterialCommunityIcons name="magnify" size={25} color={AzureColors.secondary} />
        <TextInput
          accessibilityLabel={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={AzureColors.textSecondary}
          returnKeyType="search"
          style={styles.searchInput}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tìm kiếm bằng giọng nói"
        onPress={onVoicePress}
        style={({ pressed }) => [styles.voiceButton, pressed ? styles.pressed : null]}>
        <MaterialCommunityIcons name="microphone-outline" size={25} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

export function SectionHeader({
  title,
  meta,
}: {
  title: string;
  meta?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
    </View>
  );
}

export function StateNotice({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>{title}</Text>
      {description ? <Text style={styles.noticeDescription}>{description}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  icon,
  disabled,
  ...pressableProps
}: {
  label: string;
  icon?: IconName;
} & PressableProps) {
  const { style: pressableStyle, ...restPressableProps } = pressableProps;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      {...restPressableProps}
      style={(state) => [
        styles.primaryButton,
        disabled ? styles.primaryButtonDisabled : null,
        state.pressed && !disabled ? styles.pressed : null,
        typeof pressableStyle === 'function' ? pressableStyle(state) : pressableStyle,
      ]}>
      {icon ? <MaterialCommunityIcons name={icon} size={20} color="#FFFFFF" /> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    color: AzureColors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontFamily: Fonts.rounded,
  },
  headerSubtitle: {
    color: AzureColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Fonts.sansMedium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AzureColors.surface,
    borderWidth: 1,
    borderColor: AzureColors.border,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    minHeight: 56,
    borderRadius: AzureRadius.round,
    backgroundColor: AzureColors.primaryLight,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    color: AzureColors.textPrimary,
    fontSize: 16,
    fontFamily: Fonts.sansMedium,
  },
  voiceButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AzureColors.primary,
    ...AzureShadow.card,
  },
  sectionHeader: {
    gap: 3,
  },
  sectionTitle: {
    color: AzureColors.textPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: Fonts.rounded,
  },
  sectionMeta: {
    color: AzureColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansMedium,
  },
  notice: {
    borderWidth: 1,
    borderColor: AzureColors.border,
    borderRadius: AzureRadius.xl,
    backgroundColor: AzureColors.surface,
    padding: 18,
    gap: 6,
    ...AzureShadow.card,
  },
  noticeTitle: {
    color: AzureColors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Fonts.sansBold,
  },
  noticeDescription: {
    color: AzureColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Fonts.sans,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: AzureRadius.round,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AzureColors.primary,
    ...AzureShadow.card,
  },
  primaryButtonDisabled: {
    backgroundColor: AzureColors.bookedSeat,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.sansBold,
  },
});
