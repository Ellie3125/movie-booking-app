import { useRouter, Link } from 'expo-router';
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

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { movies, cinemas, rooms, showtimes, bookings, logout } = useAppStore();
  const colors = getTonePalette('admin');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      router.replace('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <PageScroll tone="admin">
      <HeroCard
        tone="admin"
        eyebrow="Admin workspace"
        title="BeatCinema control tower"
        description="Quản trị dữ liệu hệ thống, phòng chiếu và tài khoản quản trị từ cùng một workspace.">
        <View style={styles.metricRow}>
          <MetricTile
            tone="admin"
            value={String(movies.length)}
            label="Movies"
            helper="Danh mục phim hiện có"
          />
          <MetricTile
            tone="admin"
            value={String(cinemas.length)}
            label="Cinemas"
            helper="Chi nhánh đang hiển thị"
          />
          <MetricTile
            tone="admin"
            value={String(rooms.length)}
            label="Rooms"
            helper="Phòng chiếu đã cấu hình"
          />
          <MetricTile
            tone="admin"
            value={String(showtimes.length)}
            label="Showtimes"
            helper="Suất chiếu đọc từ backend"
          />
          <MetricTile
            tone="admin"
            value={String(bookings.length)}
            label="Bookings"
            helper="Booking của tài khoản hiện tại"
          />
        </View>
      </HeroCard>

      <SectionTitle tone="admin" title="Quick Access" />
      <SectionCard tone="admin">
        <Link href="/admin/movies" style={[styles.link, { color: colors.accent }]}>
          Movie CRUD
        </Link>
        <Link href="/admin/admins/index" style={[styles.link, { color: colors.accent }]}>
          Tạo tài khoản admin
        </Link>
        <Link href="/admin/cinemas" style={[styles.link, { color: colors.accent }]}>
          Cinema CRUD
        </Link>
        <Link href="/admin/rooms" style={[styles.link, { color: colors.accent }]}>
          Room CRUD + seat builder
        </Link>
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
            <ActivityIndicator color="#09111F" size="small" />
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
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  link: {
    fontSize: 15,
    fontWeight: '800',
  },
  logoutButton: {
    minHeight: 48,
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
    fontSize: 15,
    fontFamily: Fonts.sansBold,
    color: '#09111F',
  },
});
