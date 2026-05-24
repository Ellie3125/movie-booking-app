import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  PageScroll,
  SectionCard,
  SectionTitle,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import { normalizePosterUrl } from '@/lib/image-url';
import { formatRoleLabel } from '@/lib/user-display';

// ─── Quick Action Item ──────────────────────────────────────────────────────────

type QuickAction = {
  icon: string;
  label: string;
  route: string;
  color: string;
  bgColor: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: '✏️',
    label: 'Sửa hồ sơ',
    route: '/profile/edit',
    color: '#E87A22',
    bgColor: '#FFF2E0',
  },
  {
    icon: '🔑',
    label: 'Đổi mật khẩu',
    route: '/profile/change-password',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    icon: '🔔',
    label: 'Thông báo',
    route: '/profile/notifications',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    icon: '⚙️',
    label: 'Cài đặt',
    route: '/profile',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
];

// ─── Profile Tab Screen ─────────────────────────────────────────────────────────

export default function ProfileTabScreen() {
  const router = useRouter();
  const { currentUser, bookings, cinemas, logout } = useAppStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentUserId = currentUser?.id ?? '';
  const myBookings = bookings.filter((booking) => booking.userId === currentUserId);
  const paidBookings = myBookings.filter((booking) => booking.status === 'paid');
  const totalSpent = paidBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

  const avatarUrl = currentUser?.avatar
    ? normalizePosterUrl(currentUser.avatar)
    : null;

  const displayName = currentUser?.displayName || currentUser?.name || 'Khách hàng';
  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            await logout();
            setIsLoggingOut(false);
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <PageScroll tone="user">
      {/* ─── Profile Hero ──────────────────────────────────────────── */}
      <View style={styles.heroContainer}>
        <View style={styles.heroBackground}>
          <View style={styles.heroGlow} />
        </View>

        <View style={styles.avatarContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/profile/edit')}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeIcon}>✎</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{currentUser?.email}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {formatRoleLabel(currentUser?.role ?? 'user')}
            </Text>
          </View>
          {memberSince ? (
            <View style={styles.memberBadge}>
              <Text style={styles.memberText}>Từ {memberSince}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ─── Stats ─────────────────────────────────────────────────── */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{myBookings.length}</Text>
          <Text style={styles.statLabel}>Lượt đặt</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{paidBookings.length}</Text>
          <Text style={styles.statLabel}>Đã xem</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {totalSpent >= 1_000_000
              ? `${(totalSpent / 1_000_000).toFixed(1)}M`
              : totalSpent >= 1_000
                ? `${(totalSpent / 1_000).toFixed(0)}K`
                : totalSpent.toLocaleString('vi-VN')}
          </Text>
          <Text style={styles.statLabel}>Tổng chi (₫)</Text>
        </View>
      </View>

      {/* ─── Quick Actions ─────────────────────────────────────────── */}
      <SectionTitle tone="user" title="Truy cập nhanh" />
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.quickActionCard}
            activeOpacity={0.75}
            onPress={() => router.push(action.route as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
              <Text style={styles.quickActionEmoji}>{action.icon}</Text>
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Account Info Summary ──────────────────────────────────── */}
      <SectionTitle tone="user" title="Thông tin tài khoản" />
      <SectionCard tone="user">
        <InfoRow
          icon="📧"
          label="Email"
          value={currentUser?.email ?? '—'}
        />
        <InfoRow
          icon="📱"
          label="Số điện thoại"
          value={currentUser?.phone || 'Chưa cập nhật'}
          isPlaceholder={!currentUser?.phone}
        />
        <InfoRow
          icon="🎂"
          label="Ngày sinh"
          value={
            currentUser?.dateOfBirth
              ? new Date(currentUser.dateOfBirth).toLocaleDateString('vi-VN')
              : 'Chưa cập nhật'
          }
          isPlaceholder={!currentUser?.dateOfBirth}
          isLast
        />
      </SectionCard>

      {/* ─── Rạp gợi ý ────────────────────────────────────────────── */}
      {cinemas.length > 0 && (
        <>
          <SectionTitle tone="user" title="Rạp gợi ý gần bạn" />
          <SectionCard tone="user">
            {cinemas.slice(0, 3).map((cinema, idx) => (
              <View
                key={cinema.id}
                style={[
                  styles.cinemaRow,
                  idx === Math.min(cinemas.length, 3) - 1 && styles.lastRow,
                ]}
              >
                <View style={styles.cinemaIcon}>
                  <Text style={styles.cinemaEmoji}>🎬</Text>
                </View>
                <View style={styles.cinemaInfo}>
                  <Text style={styles.cinemaName}>
                    {cinema.brand} {cinema.name}
                  </Text>
                  <Text style={styles.cinemaAddress}>{cinema.address}</Text>
                </View>
              </View>
            ))}
          </SectionCard>
        </>
      )}

      {/* ─── Logout ────────────────────────────────────────────────── */}
      <View style={styles.logoutSection}>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && !isLoggingOut ? styles.logoutButtonPressed : null,
            isLoggingOut ? styles.logoutButtonDisabled : null,
          ]}
          disabled={isLoggingOut}
          onPress={handleLogout}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#EF4444" size="small" />
          ) : null}
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Đang đăng xuất...' : '🚪  Đăng xuất'}
          </Text>
        </Pressable>
      </View>
    </PageScroll>
  );
}

// ─── Info Row Component ─────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  isPlaceholder,
  isLast,
}: {
  icon: string;
  label: string;
  value: string;
  isPlaceholder?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text
          style={[styles.infoValue, isPlaceholder && styles.infoValuePlaceholder]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Hero
  heroContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    marginBottom: 4,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    left: '50%',
    marginLeft: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(232, 122, 34, 0.08)',
  },
  avatarContainer: {
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#F3E8DC',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2E0',
  },
  avatarInitial: {
    fontSize: 36,
    fontFamily: Fonts.sansBold,
    color: '#E87A22',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E87A22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editBadgeIcon: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  displayName: {
    fontSize: 22,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: '#FFF2E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontFamily: Fonts.sansBold,
    color: '#E87A22',
  },
  memberBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  memberText: {
    fontSize: 12,
    fontFamily: Fonts.sansMedium,
    color: '#3B82F6',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 20,
    paddingVertical: 18,
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3E8DC',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: Fonts.sansBold,
    color: '#E87A22',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.sansMedium,
    color: '#8A6A50',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F3E8DC',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3E8DC',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 20,
  },
  quickActionLabel: {
    fontSize: 12,
    fontFamily: Fonts.sansMedium,
    color: '#5A3E2B',
    textAlign: 'center',
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EF',
  },
  infoIcon: {
    fontSize: 18,
    width: 32,
    textAlign: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Fonts.sansMedium,
    color: '#8A6A50',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: Fonts.sans,
    color: '#5A3E2B',
  },
  infoValuePlaceholder: {
    color: '#C7C7CD',
    fontStyle: 'italic',
  },

  // Cinema suggestions
  cinemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5EF',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cinemaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF2E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cinemaEmoji: {
    fontSize: 18,
  },
  cinemaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cinemaName: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
  },
  cinemaAddress: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    marginTop: 1,
  },

  // Logout
  logoutSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontFamily: Fonts.sansBold,
  },
});
