import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AzureColors, AzureShadow, Fonts } from '@/constants/theme';
import {
  getSeatStyle,
  getSeatVisualStatus,
  SEAT_LEGEND_COLORS,
} from '@/lib/seat-appearance';
import type { SeatLike, SelectedSeatSummaryItem } from '@/lib/booking-view-models';

/* ── Seat Header ── */

export function SeatHeader({
  title,
  onBack,
  onSupport,
  onHome,
}: {
  title: string;
  onBack?: () => void;
  onSupport?: () => void;
  onHome?: () => void;
}) {
  return (
    <View style={styles.header}>
      {/* Background overlay — khớp theme Azure */}
      <View style={styles.headerGradient} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        onPress={onBack}
        style={({ pressed }) => [
          styles.headerBackButton,
          pressed && styles.pressed,
        ]}>
        <MaterialCommunityIcons name="arrow-left" size={20} color={AzureColors.textPrimary} />
      </Pressable>

      <Text numberOfLines={1} style={styles.headerTitle}>
        {title}
      </Text>

      <View style={styles.headerActionPill}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hỗ trợ"
          onPress={onSupport}
          style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="headset" size={18} color={AzureColors.textPrimary} />
        </Pressable>
        <View style={styles.headerActionDivider} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Về trang chủ"
          onPress={onHome}
          style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="home-outline" size={18} color={AzureColors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

/* ── Screen Indicator (curved arc + MÀN HÌNH) ── */

export function ScreenIndicator() {
  return (
    <View style={styles.screenWrap}>
      <View style={styles.screenArc} />
      <Text style={styles.screenLabel}>MÀN HÌNH</Text>
    </View>
  );
}

/* ── Seat Legend ── */

type SeatLegendKey = 'booked' | 'selected' | 'normal' | 'couple' | 'vip';

const legendItems: { key: SeatLegendKey; label: string; wide?: boolean }[] = [
  { key: 'booked', label: 'Đã đặt' },
  { key: 'selected', label: 'Ghế bạn chọn' },
  { key: 'normal', label: 'Ghế thường' },
  { key: 'couple', label: 'Ghế đôi', wide: true },
  { key: 'vip', label: 'VIP' },
];

/** Dùng SEAT_LEGEND_COLORS từ seat-appearance.ts để khớp với SeatLayoutGrid */
const legendColors: Record<SeatLegendKey, { bg: string; border?: string; showX?: boolean }> = {
  booked:   { bg: SEAT_LEGEND_COLORS.booked.bg, showX: true },
  selected: { bg: SEAT_LEGEND_COLORS.selected.bg },
  normal:   { bg: SEAT_LEGEND_COLORS.normal.bg },
  couple:   { bg: SEAT_LEGEND_COLORS.couple.bg },
  vip:      { bg: SEAT_LEGEND_COLORS.vip.bg, border: SEAT_LEGEND_COLORS.vip.border },
};

function LegendSwatch({ item }: { item: typeof legendItems[number] }) {
  const colors = legendColors[item.key];
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendSwatch,
          item.wide && styles.legendSwatchWide,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border ?? 'transparent',
            borderWidth: colors.border ? 1 : 0,
          },
        ]}>
        {colors.showX && (
          <MaterialCommunityIcons name="close" size={12} color="rgba(255,255,255,0.7)" />
        )}
      </View>
      <Text style={styles.legendLabel}>{item.label}</Text>
    </View>
  );
}

export function SeatLegend() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.legendRow}>
      {legendItems.map((item) => (
        <LegendSwatch key={item.key} item={item} />
      ))}
    </ScrollView>
  );
}

/* ── Seat Detail Link ── */

export function SeatDetailLink({ onPress }: { onPress?: () => void }) {
  return (
    <View style={styles.detailLinkWrap}>
      <Pressable onPress={onPress}>
        <Text style={styles.detailLinkText}>
          Xem chi tiết hình ảnh và thông tin ghế
        </Text>
      </Pressable>
    </View>
  );
}

/* ── Seat Map wrapper (screen indicator + content + minimap) ── */

export function SeatMap({
  children,
  miniMap,
}: {
  children: ReactNode;
  miniMap?: ReactNode;
}) {
  return (
    <View style={styles.seatMapSection}>
      {children}
      {miniMap ? <View style={styles.miniMapOverlay}>{miniMap}</View> : null}
    </View>
  );
}

/* ── Seat MiniMap ── */

export function SeatMiniMap({
  layout,
  selectedSeatIds,
  bookedSeatIds = [],
}: {
  layout: SeatLike[][];
  selectedSeatIds: string[];
  bookedSeatIds?: string[];
}) {
  const selectedSet = new Set(selectedSeatIds.map((id) => id.toUpperCase()));
  const bookedSet = new Set(bookedSeatIds.map((id) => id.toUpperCase()));

  return (
    <View style={styles.miniMap}>
      <Text style={styles.miniMapLabel}>MÀN HÌNH</Text>
      {layout.map((row, rowIndex) => (
        <View key={`mini-row-${rowIndex}`} style={styles.miniRow}>
          {row.map((seat) => {
            const code = seat.seatCode.toUpperCase();
            const normalizedType = String(seat.type || '').trim().toLowerCase();
            const isSpace =
              normalizedType === 'space' ||
              normalizedType === 'empty' ||
              normalizedType === 'aisle';

            if (isSpace) {
              return <View key={`mini-gap-${rowIndex}-${seat.columnIndex}`} style={styles.miniGap} />;
            }

            const isSelected = selectedSet.has(code);
            const isBooked = bookedSet.has(code);
            
            // Dùng getSeatStyle() — khớp với SeatLayoutGrid (single source of truth)
            const variant = normalizedType === 'couple' || normalizedType === 'double' || normalizedType === 'pair' 
              ? 'couple' 
              : normalizedType === 'vip' 
              ? 'vip' 
              : 'regular';
              
            const status = getSeatVisualStatus({
              selected: isSelected,
              seatState: isBooked ? { status: 'booked' } : undefined,
            });
            const miniStyle = getSeatStyle(variant, status);

            return (
              <View
                key={`mini-seat-${rowIndex}-${seat.columnIndex}-${seat.seatCode}`}
                style={[
                  styles.miniSeat,
                  variant === 'couple' && styles.miniSeatCouple,
                  {
                    backgroundColor: miniStyle.bg,
                    borderColor: miniStyle.borderColor,
                    borderWidth: miniStyle.borderWidth > 0 ? 0.5 : 0,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

/* ── Booking Summary Bar (sticky bottom) ── */

export function BookingSummaryBar({
  rating,
  movieTitle,
  showtimeText,
  dateText,
  formatText,
  selectedSeats,
  totalPrice,
  disabled,
  submitting,
  onContinue,
  onChangeShowtime,
}: {
  rating: string;
  movieTitle: string;
  showtimeText: string;
  dateText: string;
  formatText: string;
  selectedSeats: SelectedSeatSummaryItem[];
  totalPrice: number;
  disabled: boolean;
  submitting?: boolean;
  onContinue: () => void;
  onChangeShowtime?: () => void;
}) {
  return (
    <View style={styles.summaryBar}>
      {/* Legend & Detail Link */}
      <View style={styles.summaryLegendSection}>
        <SeatLegend />
        <SeatDetailLink />
      </View>

      {/* Movie Info & Action */}
      <View style={styles.summaryContent}>
        {/* Movie title row */}
        <View style={styles.movieInfoRow}>
          <View style={styles.movieInfoLeft}>
            <View style={styles.movieTitleRow}>
              <Text style={styles.ratingBadge}>{rating}</Text>
              <Text numberOfLines={1} style={styles.movieTitle}>
                {movieTitle}
              </Text>
            </View>
            <Text numberOfLines={1} style={styles.showtimeMeta}>
              {showtimeText} | {dateText} | {formatText}
            </Text>
          </View>
          {onChangeShowtime && (
            <Pressable onPress={onChangeShowtime}>
              <Text style={styles.changeShowtimeLink}>Đổi suất</Text>
            </Pressable>
          )}
        </View>

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tạm tính</Text>
          <Text style={styles.priceAmount}>
            {totalPrice.toLocaleString('vi-VN')}đ
          </Text>
        </View>

        {/* Continue button */}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || submitting }}
          disabled={disabled || submitting}
          onPress={onContinue}
          style={({ pressed }) => [
            styles.continueButton,
            (disabled || submitting) && styles.continueButtonDisabled,
            pressed && !disabled && !submitting && styles.continueButtonPressed,
          ]}>
          <Text style={styles.continueButtonText}>
            {submitting ? 'Đang giữ ghế...' : 'Tiếp tục'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ── Styles ── */

const styles = StyleSheet.create({
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AzureColors.primaryLight,   // #DCEEFF — khớp Azure theme
    opacity: 0.5,
    zIndex: -1,
  },
  headerBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AzureColors.surface,
    borderWidth: 1,
    borderColor: AzureColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...AzureShadow.card,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
    color: AzureColors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.sansBold,
  },
  headerActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AzureColors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: AzureColors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 8,
    ...AzureShadow.card,
  },
  headerActionBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionDivider: {
    width: 1,
    height: 16,
    backgroundColor: AzureColors.border,
  },

  /* Screen Indicator */
  screenWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  screenArc: {
    width: '80%',
    height: 20,
    borderTopWidth: 4,
    borderTopColor: AzureColors.primary,       // #003468 navy — CTA color
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
  },
  screenLabel: {
    marginTop: 8,
    color: AzureColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 3.2,
    fontFamily: Fonts.sansMedium,
  },

  /* Legend */
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendSwatchWide: {
    width: 28,
  },
  legendLabel: {
    color: AzureColors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },

  /* Detail Link */
  detailLinkWrap: {
    alignItems: 'center',
    marginTop: 4,
  },
  detailLinkText: {
    color: AzureColors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
    textDecorationLine: 'underline',
    textDecorationColor: AzureColors.textSecondary,
  },

  /* Seat Map */
  seatMapSection: {
    position: 'relative',
  },
  miniMapOverlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 10,
  },

  /* MiniMap */
  miniMap: {
    width: 80,
    backgroundColor: AzureColors.primary,      // #003468 navy — high contrast
    borderRadius: 4,
    padding: 4,
    gap: 1,
  },
  miniMapLabel: {
    fontSize: 6,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: Fonts.sansMedium,
  },
  miniRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 1,
  },
  miniSeat: {
    width: 3,
    height: 3,
    borderRadius: 1,
  },
  miniSeatCouple: {
    width: 6,
  },
  miniGap: {
    width: 6,
    height: 3,
  },

  /* Summary Bar */
  summaryBar: {
    backgroundColor: AzureColors.surface,
    borderTopWidth: 1,
    borderTopColor: AzureColors.border,
    ...AzureShadow.floating,
  },
  summaryLegendSection: {
    backgroundColor: AzureColors.appBackground,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: AzureColors.border,
  },
  summaryContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },

  /* Movie Info */
  movieInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  movieInfoLeft: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  movieTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    overflow: 'hidden',
    backgroundColor: AzureColors.danger,
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.sansBold,
    letterSpacing: 0.6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  movieTitle: {
    flex: 1,
    color: AzureColors.textPrimary,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: Fonts.sansBold,
  },
  showtimeMeta: {
    color: AzureColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  changeShowtimeLink: {
    color: AzureColors.secondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sansBold,
  },

  /* Price */
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceLabel: {
    color: AzureColors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  priceAmount: {
    color: AzureColors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: Fonts.sansBold,
  },

  /* Continue Button */
  continueButton: {
    width: '100%',
    backgroundColor: AzureColors.primary,     // #003468 navy — khớp app CTA
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...AzureShadow.card,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.sansBold,
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
});
