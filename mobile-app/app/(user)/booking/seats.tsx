/**
 * Autonomous Decisions:
 * - Used Nunito fonts (already installed) instead of Plus Jakarta Sans to avoid adding new dependency
 * - Kept the SeatLayoutGrid component for rendering the actual seat grid since it handles all
 *   the complex layout/interaction logic
 * - Validation warnings only appear when user presses "Tiếp tục" (per spec requirement)
 *
 * Deviations:
 * - DESIGN.md specifies Plus Jakarta Sans font, using Nunito as visually similar alternative
 *
 * Trade-offs:
 * - Removed zoom toggle (not in DESIGN.md) in favor of simpler scroll-based navigation
 * - Removed session card above seat map (info now in bottom panel per DESIGN.md)
 *
 * Context/Notes:
 * - All booking logic, validation, pricing, navigation preserved exactly from previous version
 * - Screen structure: gradient header → pink arc → scrollable seat grid → sticky bottom panel
 */

import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BookingSummaryBar,
  ScreenIndicator,
  SeatHeader,
  SeatMap,
  SeatMiniMap,
} from '@/components/booking/seats';
import { StateNotice } from '@/components/booking/common';
import { SeatLayoutGrid } from '@/components/ui/seat-layout-grid';
import { PinchableZoomView } from '@/components/ui/pinchable-zoom-view';
import { Fonts, AzureColors } from '@/constants/theme';
import { type RoomSeat, useAppStore } from '@/lib/app-store';
import {
  calculateSelectedSeatSummary,
  toggleSeatSelection,
} from '@/lib/booking-view-models';
import { buildSeatVariantLookup } from '@/lib/seat-appearance';
import {
  OUTER_EDGE_EMPTY_SEAT_WARNING,
  getEdgeSeatSelectionConflict,
} from '@/lib/seat-selection-rule';
import {
  formatLocationName,
  formatShowtimeDayLabel,
  formatShowtimeFormat,
  formatShowtimeTime,
} from '@/lib/user-display';

export default function SeatSelectionScreen() {
  const { showtimeId } = useLocalSearchParams<{ showtimeId?: string }>();
  const { movies, cinemas, rooms, showtimes, startCheckout, refreshShowtime } = useAppStore();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectionNotice, setSelectionNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  /** True khi user đang pinch-zoom seat map — disable parent scroll để tránh conflict */
  const [isZoomed, setIsZoomed] = useState(false);
  /** True khi user chạm từ 2 ngón tay trở lên trên sơ đồ để zoom */
  const [isMultiTouching, setIsMultiTouching] = useState(false);
  const isScrollDisabled = isZoomed || isMultiTouching;

  const showtime = showtimes.find((item) => item.id === showtimeId);
  const movie = movies.find((item) => item.id === showtime?.movieId);
  const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);
  const room = rooms.find((item) => item.id === showtime?.roomId);
  const seatVariantLookup = useMemo(() => buildSeatVariantLookup(room), [room]);

  /**
   * Auto-size scale — tự động điều chỉnh kích thước ghế theo độ rộng phòng:
   * - Phòng nhỏ (ít ghế/hàng) → scale > 1 → ghế to hơn, dễ nhấn
   * - Phòng lớn (nhiều ghế/hàng) → scale < 1 → ghế nhỏ hơn, vừa màn hình
   * - Couple seat được tính bằng 2 đơn vị (52px vs 24px base)
   */
  const { width: screenWidth } = useWindowDimensions();
  const autoSizeScale = useMemo(() => {
    const layout = room?.seatLayout;
    if (!layout?.length) return 1;

    const CELL_BASE = 24;   // cellWidth tại scale=1
    const COUPLE_BASE = 52; // coupleCellWidth tại scale=1
    const GAP_BASE = 4;     // gridGap tại scale=1
    const H_PADDING = 48;   // 16px header + 32px content padding

    // Tính độ rộng pixel thực sự của hàng dài nhất
    const maxRowPixelWidth = Math.max(
      ...layout.map((row) => {
        if (row.length === 0) return 0;
        return row.reduce((acc, seat, idx) => {
          const type = String(seat.type || '').toLowerCase();
          const isCouple = type === 'couple' || type === 'double' || type === 'pair';
          const cellW = isCouple ? COUPLE_BASE : CELL_BASE;
          const gap = idx > 0 ? GAP_BASE : 0;
          return acc + cellW + gap;
        }, 0);
      })
    );

    if (maxRowPixelWidth === 0) return 1;

    const available = screenWidth - H_PADDING;
    const raw = available / maxRowPixelWidth;
    // Clầm: tối thiểu 0.72 (phòng rất lớn), tối đa 1.5 (phòng rất nhỏ)
    return Math.min(Math.max(raw, 0.72), 1.5);
  }, [room?.seatLayout, screenWidth]);
  const selectedSeatSummary = useMemo(
    () =>
      calculateSelectedSeatSummary({
        layout: room?.seatLayout ?? [],
        selectedSeatIds,
        basePrice: showtime?.basePrice ?? 0,
      }),
    [room?.seatLayout, selectedSeatIds, showtime?.basePrice],
  );
  const bookedSeatIds = useMemo(
    () =>
      (showtime?.seatStates ?? [])
        .filter((seat) => seat.status !== 'available')
        .map((seat) => seat.seatCode),
    [showtime?.seatStates],
  );

  /**
   * Minimap visibility logic:
   * - Layout phải tồn tại và có ít nhất 1 hàng ghế hợp lệ
   * - Show người dùng đã chọn ít nhất 1 ghế, HOẶC layout đủ lớn cần overview
   * - LARGE_LAYOUT_THRESHOLD: số ghế thực (không tính space) nhiều hơn ngưỡng này thì luôn show
   */
  const LARGE_LAYOUT_THRESHOLD = 12; // số ghế thực tối đa trong 1 hàng để coi là “lớn”
  const shouldShowMinimap = useMemo(() => {
    const layout = room?.seatLayout;
    if (!layout || layout.length === 0) return false;

    // Ính nhất phải có ít nhất 1 hàng có ghế thực
    const hasRealSeats = layout.some((row) =>
      row.some((seat) => !['space', 'empty', 'aisle'].includes(String(seat.type || '').toLowerCase()))
    );
    if (!hasRealSeats) return false;

    // Kiểm tra layout có đủ lớn để cần overview không
    const maxRealSeatsPerRow = Math.max(
      ...layout.map((row) =>
        row.filter((seat) => !['space', 'empty', 'aisle'].includes(String(seat.type || '').toLowerCase())).length
      )
    );
    const isLargeLayout = maxRealSeatsPerRow >= LARGE_LAYOUT_THRESHOLD;

    return selectedSeatIds.length > 0 || isLargeLayout;
  }, [room?.seatLayout, selectedSeatIds.length]);

  useEffect(() => {
    if (showtimeId && refreshShowtime) {
      refreshShowtime(showtimeId);
    }
  }, [refreshShowtime, showtimeId]);

  useEffect(() => {
    setSelectedSeatIds([]);
    setSelectionNotice('');
    setError('');
  }, [showtimeId]);

  const handleSeatPress = (seat: RoomSeat) => {
    const nextSelectedSeatIds = toggleSeatSelection({
      seat,
      layout: room?.seatLayout ?? [],
      seatStates: showtime?.seatStates ?? [],
      selectedSeatIds,
    });

    setSelectionNotice('');
    setError('');
    setSelectedSeatIds(nextSelectedSeatIds);
  };

  const handleContinue = async () => {
    if (!showtime || !room || selectedSeatIds.length === 0) {
      return;
    }

    const edgeSeatConflict = getEdgeSeatSelectionConflict(
      room.seatLayout,
      showtime.seatStates,
      selectedSeatIds,
    );

    if (edgeSeatConflict) {
      setSelectionNotice(OUTER_EDGE_EMPTY_SEAT_WARNING);
      setError('');
      Alert.alert('Lưu ý chọn ghế', OUTER_EDGE_EMPTY_SEAT_WARNING);
      return;
    }

    setSubmitting(true);
    setSelectionNotice('');
    setError('');

    const result = await startCheckout(showtime.id, selectedSeatIds);

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'Không thể tiếp tục đến bước thanh toán.');
      Alert.alert('Lỗi', result.error ?? 'Không thể tiếp tục đến bước thanh toán.');
      return;
    }

    router.push({
      pathname: '/booking/checkout',
      params: {
        showtimeId: showtime.id,
        seatIds: selectedSeatIds.join(','),
        bookingId: result.bookingId ?? '',
        paymentTransactionId: result.paymentTransactionId ?? '',
        expiredAt: result.expiredAt ?? '',
        paymentUrl: result.paymentUrl ?? '',
        resume: result.bookingId ? 'true' : 'false',
      },
    });
  };

  const hasData = Boolean(showtime && room && movie && cinema);
  const activeMovie = movie!;
  const activeShowtime = showtime!;
  const activeRoom = room!;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <SeatHeader
        title={cinema ? `${cinema.brand} ${formatLocationName(cinema.name)}` : 'Chọn ghế'}
        onBack={() => router.back()}
        onSupport={() => router.push('/profile/support')}
        onHome={() => router.push('/(user)/(tabs)/home')}
      />

      {!hasData ? (
        <View style={styles.emptyShell}>
          <StateNotice
            title="Không tìm thấy dữ liệu đặt ghế"
            description="Hãy quay lại danh sách suất chiếu và chọn lại một phiên phù hợp."
          />
        </View>
      ) : (
        <View style={styles.container}>
          {/* Scrollable seat map area */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={!isScrollDisabled}
            bounces={false}>
            {/* Screen Indicator */}
            <ScreenIndicator />

            {/* Seat Map — có pinch-to-zoom riêng biệt */}
            <SeatMap
              miniMap={
                shouldShowMinimap ? (
                  <SeatMiniMap
                    layout={activeRoom.seatLayout}
                    selectedSeatIds={selectedSeatIds}
                    bookedSeatIds={bookedSeatIds}
                  />
                ) : undefined
              }>
              {/* ScrollView ngang — bị disable khi user đang pinch-zoom */}
              <View
                onTouchStart={(e) => {
                  if (e.nativeEvent.touches.length >= 2) {
                    setIsMultiTouching(true);
                  }
                }}
                onTouchMove={(e) => {
                  if (e.nativeEvent.touches.length >= 2) {
                    setIsMultiTouching(true);
                  }
                }}
                onTouchEnd={() => setIsMultiTouching(false)}
                onTouchCancel={() => setIsMultiTouching(false)}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={!isScrollDisabled}
                  contentContainerStyle={styles.horizontalMapContent}>
                  <View style={styles.gridFrame}>
                    <PinchableZoomView
                      onScaleChange={(s) => setIsZoomed(s > 1.05)}
                    >
                      <SeatLayoutGrid
                        layout={activeRoom.seatLayout}
                        seatStates={activeShowtime.seatStates}
                        selectedCoordinates={selectedSeatIds}
                        mode="user"
                        onPressSeat={handleSeatPress}
                        sizeScale={autoSizeScale}
                        useIntrinsicSizing
                        seatVariantLookup={seatVariantLookup}
                      />
                    </PinchableZoomView>
                  </View>
                </ScrollView>
              </View>
            </SeatMap>

            {/* Notices (shown only when validation triggered) */}
            {selectionNotice ? (
              <View style={styles.noticeBox}>
                <Text style={styles.noticeTitle}>Lưu ý chọn ghế</Text>
                <Text style={styles.noticeText}>{selectionNotice}</Text>
              </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Bottom spacer for scroll clearance */}
            <View style={styles.scrollEndSpacer} />
          </ScrollView>

          {/* Sticky Bottom Panel */}
          <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
            <BookingSummaryBar
              rating={activeMovie.rating}
              movieTitle={activeMovie.title}
              showtimeText={`${formatShowtimeTime(activeShowtime.startTime)}~${formatShowtimeTime(
                activeShowtime.endTime,
              )}`}
              dateText={formatShowtimeDayLabel(activeShowtime.startTime)}
              formatText={`${formatShowtimeFormat(activeShowtime.format)} ${activeShowtime.language}`}
              selectedSeats={selectedSeatSummary.seats}
              totalPrice={selectedSeatSummary.totalPrice}
              disabled={selectedSeatIds.length === 0}
              submitting={submitting}
              onContinue={handleContinue}
              onChangeShowtime={() => router.back()}
            />
          </SafeAreaView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AzureColors.appBackground,   // #EEF6FF — khớp toàn bộ app
  },
  emptyShell: {
    padding: 18,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 8,
  },
  horizontalMapContent: {
    minWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  gridFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBox: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: AzureColors.warning,
    borderRadius: 12,
    backgroundColor: AzureColors.warningSurface,
    padding: 14,
    gap: 4,
  },
  noticeTitle: {
    color: AzureColors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: Fonts.sansBold,
  },
  noticeText: {
    color: AzureColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  errorText: {
    marginHorizontal: 16,
    marginTop: 8,
    color: AzureColors.danger,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansBold,
  },
  scrollEndSpacer: {
    height: 16,
  },
  bottomSafeArea: {
    backgroundColor: AzureColors.surface,
  },
});
