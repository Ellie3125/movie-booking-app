import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  HeroCard,
  MetricTile,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import { formatLocationName, formatRoleLabel } from '@/lib/user-display';

export default function ProfileTabScreen() {
  const router = useRouter();
  const { currentUser, bookings, cinemas, logout } = useAppStore();
  const colors = getTonePalette('user');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentUserId = currentUser?.id ?? '';
  const myBookings = bookings.filter((booking) => booking.userId === currentUserId);
  const totalSpent = myBookings
    .filter((booking) => booking.status === 'paid')
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.replace('/');
  };

  return (
    <PageScroll tone="user">
      <HeroCard
        tone="user"
        eyebrow="Tài khoản"
        title={currentUser?.name ?? 'Phiên người dùng'}>
        <View style={styles.metrics}>
          <MetricTile tone="user" value={String(myBookings.length)} label="Lượt đặt" />
          <MetricTile tone="user" value={totalSpent.toLocaleString('vi-VN')} label="Tổng chi" />
        </View>
      </HeroCard>

      <SectionTitle tone="user" title="Thông tin tài khoản" />
      <SectionCard tone="user">
        <Text style={[styles.cardTitle, { color: colors.text }]}>Email</Text>
        <Text style={[styles.cardCopy, { color: colors.muted }]}>
          {currentUser?.email ?? 'Đang cập nhật phiên đăng nhập...'}
        </Text>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Vai trò</Text>
        <Text style={[styles.cardCopy, { color: colors.muted }]}>
          {formatRoleLabel(currentUser?.role ?? 'user')}
        </Text>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Rạp gợi ý</Text>
        <Text style={[styles.cardCopy, { color: colors.muted }]}>
          {cinemas
            .slice(0, 2)
            .map((cinema) => `${cinema.brand} ${formatLocationName(cinema.name)}`)
            .join(' • ')}
        </Text>
      </SectionCard>

      <SectionTitle tone="user" title="Đăng xuất" />
      <SectionCard tone="user">
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: colors.accent },
            pressed && !isLoggingOut ? styles.logoutButtonPressed : null,
            isLoggingOut ? styles.logoutButtonDisabled : null,
          ]}
          disabled={isLoggingOut}
          onPress={handleLogout}>
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFDF8" size="small" />
          ) : null}
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Text>
        </Pressable>
      </SectionCard>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  logoutButtonPressed: {
    opacity: 0.92,
  },
  logoutButtonDisabled: {
    opacity: 0.72,
  },
  logoutText: {
    color: '#FFFDF8',
    fontSize: 15,
    fontFamily: Fonts.sansBold,
  },
});
