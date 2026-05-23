/**
 * ProfileMenuSection — Nhóm các mục menu thành section có tiêu đề.
 *
 * ## Autonomous Decisions
 * - Shadow uses shadowOpacity 0.06 and shadowRadius 10, mid-range of the design system's 0.03-0.1 / 8-12 spec.
 * - elevation: 2 for Android consistency.
 *
 * ## Deviations
 * - None from the provided spec.
 *
 * ## Trade-offs
 * - overflow 'hidden' on the card clips any child that might extend beyond bounds (e.g. a Switch's
 *   hit-slop). This matches spec but callers should be aware.
 *
 * ## Context/Notes
 * - Designed to wrap ProfileMenuItem children. The last child's bottom border can be hidden via
 *   the parent screen if needed (e.g. by applying noBorder style to the last item).
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Fonts } from '@/constants/theme';

type ProfileMenuSectionProps = {
  title: string;
  children: React.ReactNode;
};

function ProfileMenuSection({ title, children }: ProfileMenuSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    color: '#8A6A50',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    // Shadow
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
});

export default ProfileMenuSection;
