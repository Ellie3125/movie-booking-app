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
    color: '#FFB247',
    bgColor: '#FFF9EE',
  },
  {
    icon: '🔑',
    label: 'Đổi mật khẩu',
    route: '/profile/change-password',
    color: '#003D7D',
    bgColor: '#D9E7F1',
  },
  {
    icon: '🔔',
    label: 'Thông báo',
    route: '/profile/notifications',
    color: '#10B981',
    bgColor: '#E6F7ED',
  },
  {
    icon: '⚙️',
    label: 'Cài đặt',
    route: '/profile',
    color: '#8B5CF6',
    bgColor: '#F3E8FF',
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

  const avatarUrl = currentUser?.avatarUrl
    ? normalizePosterUrl(currentUser.avatarUrl)
    : null;

  const displayName = currentUser?.fullName || 'Khách hàng';
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
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
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
          value={currentUser?.phoneNumber || 'Chưa cập nhật'}
          isPlaceholder={!currentUser?.phoneNumber}
        />
        <InfoRow
          icon="👤"
          label="Vai trò"
          value={formatRoleLabel(currentUser?.role ?? 'user')}
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
    backgroundColor: 'rgba(0, 61, 125, 0.05)',
  },
  avatarContainer: {
    marginBottom: 14,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#E9F1F7',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9E7F1',
  },
  avatarInitial: {
    fontSize: 36,
    fontFamily: Fonts.sansBold,
    color: '#003D7D',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#003D7D',
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
    fontFamily: Fonts.rounded,
    color: '#001E42',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    fontFamily: Fonts.sansMedium,
    color: '#6D7D8A',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: '#D9E7F1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontFamily: Fonts.sansBold,
    color: '#003D7D',
  },
  memberBadge: {
    backgroundColor: '#E9F1F7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  memberText: {
    fontSize: 12,
    fontFamily: Fonts.sansMedium,
    color: '#003D7D',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 4,
    marginBottom: 20,
    paddingVertical: 18,
    shadowColor: '#002B5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E9F1F7',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: Fonts.sansBold,
    color: '#003D7D',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.sansMedium,
    color: '#6D7D8A',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E9F1F7',
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
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#002B5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E9F1F7',
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
    color: '#001E42',
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
    borderBottomColor: '#E9F1F7',
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
    color: '#6D7D8A',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: Fonts.sans,
    color: '#001E42',
  },
  infoValuePlaceholder: {
    color: '#9FB0D0',
    fontStyle: 'italic',
  },

  // Cinema suggestions
  cinemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9F1F7',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cinemaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D9E7F1',
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
    color: '#001E42',
  },
  cinemaAddress: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#6D7D8A',
    marginTop: 1,
  },

  // Logout
  logoutSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  logoutButton: {
    minHeight: 52,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
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
