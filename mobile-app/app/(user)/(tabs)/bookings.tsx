import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import {
  getBookingHistoryStatusPresentation,
  isBookingHistoryDetailDisabled,
} from '@/lib/booking-history-presentation';
import { formatLocationName } from '@/lib/user-display';

const screenColors = {
  background: '#F8F9FF',
  surface: '#FFFFFF',
  surfaceSoft: '#F5F7FF',
  primary: '#0041C8',
  primaryContainer: '#DCE9FF',
  text: '#0B1C30',
  muted: '#6E7282',
  outline: '#C3C5D9',
  outlineSoft: '#D4D8E9',
  disabled: '#9AA0AD',
};

const formatDateTime = (value: string) =>
  `${new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })} ${new Date(value)
    .toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    })
    .replace('/', '-')}`;

type StatusFilterKey = 'all' | 'paid' | 'held' | 'cancelled';

const STATUS_FILTERS: { key: StatusFilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'held', label: 'Đang chờ' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export default function BookingsTabScreen() {
  const { bookings, movies, showtimes, cinemas, currentUser } = useAppStore();
  const router = useRouter();
  const currentUserId = currentUser?.id ?? '';
  const myBookings = bookings.filter((booking) => booking.userId === currentUserId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all');

  const filteredBookings = myBookings.filter((booking) => {
    const movie = movies.find((m) => m.id === booking.movieId);
    const matchesSearch = (movie?.title ?? '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Quay lại"
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={30}
            color={screenColors.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Lịch sử đặt vé</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={32}
            color={screenColors.muted}
          />
          <TextInput
            accessibilityLabel="Tìm tên phim"
            style={styles.searchInput}
            placeholder="Tìm tên phim..."
            placeholderTextColor={screenColors.muted}
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          {STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter.key;
            return (
              <Pressable
                key={filter.key}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => setStatusFilter(filter.key)}
                style={({ pressed }) => [
                  styles.chip,
                  isActive ? styles.chipActive : styles.chipInactive,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.ticketList}>
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Không tìm thấy kết quả'
                  : 'Bạn chưa có booking nào'}
              </Text>
              <Text style={styles.emptyText}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Thử thay đổi từ khóa hoặc bộ lọc trạng thái.'
                  : 'Sau khi thanh toán thành công, vé sẽ xuất hiện tại đây.'}
              </Text>
            </View>
          ) : (
            filteredBookings.map((booking) => {
              const movie = movies.find((item) => item.id === booking.movieId);
              const showtime = showtimes.find((item) => item.id === booking.showtimeId);
              const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);
              const statusPresentation = getBookingHistoryStatusPresentation(booking.status);
              const detailDimmed = isBookingHistoryDetailDisabled(booking.status);
              const detailColor = detailDimmed ? screenColors.disabled : screenColors.primary;

              return (
                <View
                  key={booking.id}
                  style={[styles.ticketCard, detailDimmed && styles.ticketCardDimmed]}>
                  <View style={styles.ticketBody}>
                    <View style={styles.ticketHeader}>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.movieTitle,
                          detailDimmed && styles.movieTitleDimmed,
                        ]}>
                        {movie?.title ?? 'Phim không xác định'}
                      </Text>
                      <View
                        style={[
                          styles.statusTag,
                          { backgroundColor: statusPresentation.backgroundColor },
                        ]}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.statusText,
                            { color: statusPresentation.textColor },
                          ]}>
                          {statusPresentation.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaStack}>
                      <View style={styles.metaRow}>
                        <MaterialCommunityIcons
                          name="map-marker-outline"
                          size={22}
                          color={screenColors.muted}
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.metaText,
                            detailDimmed && styles.metaTextDimmed,
                          ]}>
                          {cinema
                            ? `${cinema.brand} ${formatLocationName(cinema.name)}`
                            : 'Rạp đang cập nhật'}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <MaterialCommunityIcons
                          name="seat-outline"
                          size={22}
                          color={screenColors.muted}
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.metaText,
                            detailDimmed && styles.metaTextDimmed,
                          ]}>
                          Ghế{' '}
                          {booking.seats
                            .map((seat) => `${seat.seatLabel} (${seat.seatCode})`)
                            .join(', ')}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={22}
                          color={screenColors.muted}
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.metaText,
                            styles.timeText,
                            detailDimmed && styles.metaTextDimmed,
                          ]}>
                          {formatDateTime(showtime?.startTime ?? booking.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.ticketFooter}>
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={0.78}
                      numberOfLines={1}
                      style={[
                        styles.priceText,
                        detailDimmed && styles.priceTextDimmed,
                      ]}>
                      {booking.totalPrice.toLocaleString('vi-VN')} VND
                    </Text>
                    <Link
                      href={{
                        pathname: '/(user)/bookings/[bookingId]',
                        params: { bookingId: booking.id },
                      }}
                      asChild>
                      <Pressable
                        accessibilityLabel={`Xem chi tiết vé ${movie?.title ?? ''}`}
                        style={({ pressed }) => [
                          styles.detailLink,
                          pressed && styles.pressed,
                        ]}>
                        <Text style={[styles.detailText, { color: detailColor }]}>
                          Chi tiết vé
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={24}
                          color={detailColor}
                        />
                      </Pressable>
                    </Link>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: screenColors.background,
  },
  header: {
    minHeight: 76,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: screenColors.outline,
    backgroundColor: screenColors.background,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: screenColors.primary,
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Fonts.sansBold,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 32,
  },
  searchBox: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: screenColors.outline,
    borderRadius: 12,
    backgroundColor: screenColors.surface,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#213145',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    color: screenColors.text,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.sans,
    paddingVertical: 0,
  },
  chipRow: {
    paddingTop: 20,
    paddingBottom: 26,
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    minHeight: 52,
    paddingHorizontal: 24,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: screenColors.primary,
  },
  chipInactive: {
    backgroundColor: screenColors.primaryContainer,
  },
  chipText: {
    color: screenColors.text,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.sansBold,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  ticketList: {
    gap: 18,
  },
  ticketCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: screenColors.outline,
    borderRadius: 12,
    backgroundColor: screenColors.surface,
    shadowColor: '#213145',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  ticketCardDimmed: {
    borderColor: screenColors.outlineSoft,
  },
  ticketBody: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
    gap: 18,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  movieTitle: {
    flex: 1,
    color: screenColors.text,
    fontSize: 29,
    lineHeight: 36,
    fontFamily: Fonts.sansBold,
  },
  movieTitleDimmed: {
    color: '#3F4A5A',
  },
  statusTag: {
    maxWidth: 160,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: Fonts.sansBold,
  },
  metaStack: {
    gap: 8,
  },
  metaRow: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaText: {
    flex: 1,
    color: '#34384A',
    fontSize: 21,
    lineHeight: 28,
    fontFamily: Fonts.sans,
  },
  metaTextDimmed: {
    color: screenColors.disabled,
  },
  timeText: {
    color: screenColors.muted,
  },
  ticketFooter: {
    minHeight: 82,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: screenColors.outline,
    backgroundColor: screenColors.surfaceSoft,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  priceText: {
    flexShrink: 1,
    color: screenColors.primary,
    fontSize: 29,
    lineHeight: 36,
    fontFamily: Fonts.sansBold,
  },
  priceTextDimmed: {
    color: screenColors.disabled,
  },
  detailLink: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 21,
    lineHeight: 28,
    fontFamily: Fonts.sansBold,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: screenColors.outline,
    borderRadius: 12,
    backgroundColor: screenColors.surface,
    padding: 24,
    gap: 8,
  },
  emptyTitle: {
    color: screenColors.text,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: Fonts.sansBold,
  },
  emptyText: {
    color: screenColors.muted,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.sans,
  },
  pressed: {
    opacity: 0.72,
  },
});
