/**
 * ProfileMenuItem — Mục menu cho màn hình cài đặt / hồ sơ.
 *
 * ## Autonomous Decisions
 * - Chose minHeight 52 to ensure >=44px touch target even with sublabel text.
 * - Used `${iconColor}15` opacity pattern for icon background tint (consistent with spec).
 *
 * ## Deviations
 * - None from the provided spec.
 *
 * ## Trade-offs
 * - borderBottomWidth baked in by default; callers can override via style or omit the last border
 *   by wrapping children with React.Children manipulation in ProfileMenuSection.
 *
 * ## Context/Notes
 * - Follows the warm-cream design system palette used across the mobile app profile screens.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Fonts } from '@/constants/theme';

type ProfileMenuItemProps = {
  icon: string;
  iconColor: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  isDanger?: boolean;
};

function ProfileMenuItem({
  icon,
  iconColor,
  label,
  sublabel,
  onPress,
  rightElement,
  showChevron = true,
  isDanger = false,
}: ProfileMenuItemProps) {
  const labelColor = isDanger ? '#EF4444' : '#5A3E2B';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      {/* Icon circle */}
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: `${iconColor}15` },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={iconColor}
        />
      </View>

      {/* Label area */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: labelColor }]}>
          {label}
        </Text>
        {sublabel ? (
          <Text style={styles.sublabel}>{sublabel}</Text>
        ) : null}
      </View>

      {/* Right side */}
      {rightElement ? (
        rightElement
      ) : showChevron ? (
        <Ionicons
          name="chevron-forward-outline"
          size={16}
          color="#A1A1AA"
        />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EF',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  labelContainer: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 15,
    fontFamily: Fonts.sansMedium,
  },
  sublabel: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#A1A1AA',
    marginTop: 1,
  },
});

export default ProfileMenuItem;
