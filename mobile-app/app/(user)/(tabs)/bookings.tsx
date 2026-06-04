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
import { getSeatDisplayLabel } from '@/lib/seat-display';
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
            color="#001E42"
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
            color="#00356F"
          />
          <TextInput
            accessibilityLabel="Tìm tên phim"
            style={styles.searchInput}
            placeholder="Tìm tên phim..."
            placeholderTextColor="#5C6B76"
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
              const detailColor = detailDimmed ? '#9FB0D0' : '#003D7D';

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
                          size={20}
                          color="#6D7D8A"
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
                          size={20}
                          color="#6D7D8A"
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.metaText,
                            detailDimmed && styles.metaTextDimmed,
                          ]}>
                          Ghế{' '}
                          {booking.seats
                            .map(getSeatDisplayLabel)
                            .join(', ')}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={20}
                          color="#6D7D8A"
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
                          size={20}
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
    backgroundColor: '#F7FAFD',
  },
  header: {
    minHeight: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#001E42',
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Fonts.rounded,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 112,
  },
  searchBox: {
    minHeight: 66,
    borderRadius: 33,
    backgroundColor: '#D9E7F1',
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  searchInput: {
    flex: 1,
    color: '#001E42',
    fontSize: 18,
    fontFamily: Fonts.sansMedium,
    paddingVertical: 0,
  },
  chipRow: {
    paddingTop: 14,
    paddingBottom: 22,
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#003D7D',
  },
  chipInactive: {
    backgroundColor: '#E9F1F7',
  },
  chipText: {
    color: '#001E42',
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  ticketList: {
    gap: 16,
  },
  ticketCard: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#002B5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  ticketCardDimmed: {
    opacity: 0.85,
  },
  ticketBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 14,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  movieTitle: {
    flex: 1,
    color: '#001E42',
    fontSize: 17,
    lineHeight: 22,
    fontFamily: Fonts.sansBold,
  },
  movieTitleDimmed: {
    color: '#6D7D8A',
  },
  statusTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: Fonts.sansBold,
  },
  metaStack: {
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    flex: 1,
    color: '#6D7D8A',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansMedium,
  },
  metaTextDimmed: {
    color: '#9FB0D0',
  },
  timeText: {
    color: '#003D7D',
  },
  ticketFooter: {
    minHeight: 64,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E9F1F7',
    backgroundColor: '#F7FAFD',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  priceText: {
    flexShrink: 1,
    color: '#FFB247',
    fontSize: 17,
    fontFamily: Fonts.sansBold,
  },
  priceTextDimmed: {
    color: '#9FB0D0',
  },
  detailLink: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: '#D9E7F1',
    padding: 24,
    gap: 8,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#001E42',
    fontSize: 17,
    fontFamily: Fonts.sansBold,
  },
  emptyText: {
    color: '#6D7D8A',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
