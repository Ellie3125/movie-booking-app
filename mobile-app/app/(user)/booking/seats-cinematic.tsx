import { MaterialIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { Fonts } from '@/constants/theme';

type SeatKind = 'standard' | 'vip' | 'sweetbox';
type SeatStatus = 'available' | 'selected' | 'reserved';

type Seat = {
  id: string;
  row: string;
  col: number;
  kind: SeatKind;
  status: SeatStatus;
};

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'];
const initialSelectedSeats = ['G5', 'G6', 'G9'];
const reservedSeats = ['A3', 'A4', 'H3', 'H10'];

const buildSeats = () =>
  rows.flatMap((row) => {
    const isSweetbox = row === 'J';
    const count = isSweetbox ? 4 : 8;

    return Array.from({ length: count }, (_, index) => {
      const col = index + 3;
      const id = `${row}${col}`;
      const kind: SeatKind = isSweetbox
        ? 'sweetbox'
        : ['D', 'E', 'F', 'G', 'H'].includes(row)
          ? 'vip'
          : 'standard';

      return {
        id,
        row,
        col,
        kind,
        status: reservedSeats.includes(id)
          ? 'reserved'
          : initialSelectedSeats.includes(id)
            ? 'selected'
            : 'available',
      } satisfies Seat;
    });
  });

const seatPrice: Record<SeatKind, number> = {
  standard: 120000,
  vip: 140500,
  sweetbox: 281000,
};

const money = (amount: number) => `${amount.toLocaleString('vi-VN')}đ`;

export default function CinematicSeatPreviewScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 420;
  const [zoomed, setZoomed] = useState(true);
  const [seats, setSeats] = useState<Seat[]>(() => buildSeats());

  const scale = zoomed ? (compact ? 1.42 : 1.55) : 1;
  const selectedSeats = useMemo(
    () => seats.filter((seat) => seat.status === 'selected'),
    [seats],
  );
  const total = selectedSeats.reduce((sum, seat) => sum + seatPrice[seat.kind], 0);

  const toggleSeat = (seatId: string) => {
    setSeats((current) =>
      current.map((seat) => {
        if (seat.id !== seatId || seat.status === 'reserved') {
          return seat;
        }

        return {
          ...seat,
          status: seat.status === 'selected' ? 'available' : 'selected',
        };
      }),
    );
  };

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.appBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <MaterialIcons name="arrow-back" size={24} color="#0041C8" />
        </Pressable>

        <View style={styles.titleBlock}>
          <Text numberOfLines={1} style={styles.title}>
            CGV Vincom Center Bà Triệu
          </Text>
          <View style={styles.subtitleRow}>
            <View style={styles.cinemaMark}>
              <Text style={styles.cinemaMarkText}>E</Text>
            </View>
            <Text numberOfLines={1} style={styles.subtitle}>
              Cinema E Premium
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={zoomed ? 'Thu nhỏ sơ đồ ghế' : 'Phóng to sơ đồ ghế'}
            onPress={() => setZoomed((value) => !value)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <MaterialIcons name={zoomed ? 'zoom-out' : 'zoom-in'} size={24} color="#0041C8" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Trang chủ"
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <MaterialIcons name="home" size={23} color="#0041C8" />
          </Pressable>
        </View>
      </View>

      <View style={styles.screenArea}>
        <View style={styles.screenCurve} />
        <Text style={styles.screenLabel}>MÀN HÌNH</Text>
      </View>

      <View style={styles.mapStage}>
        <ScrollView
          style={styles.mapScroll}
          contentContainerStyle={styles.mapScrollContent}
          showsVerticalScrollIndicator={false}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalContent}>
            <View
              style={[
                styles.seatMapWrapper,
                {
                  transform: [{ scale }],
                  marginTop: zoomed ? 76 : 28,
                  marginBottom: zoomed ? 190 : 96,
                  minWidth: zoomed ? 510 : 340,
                },
              ]}>
              <View style={styles.seatMap}>
                <View style={styles.premiumFrame} />
                <View style={styles.seatGrid}>
                  {seats.map((seat) => (
                    <Pressable
                      key={seat.id}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: seat.status === 'selected',
                        disabled: seat.status === 'reserved',
                      }}
                      accessibilityLabel={`Ghế ${seat.id}`}
                      disabled={seat.status === 'reserved'}
                      onPress={() => toggleSeat(seat.id)}
                      style={({ pressed }) => [
                        styles.seat,
                        seat.kind === 'sweetbox' && styles.sweetboxSeat,
                        seat.kind === 'standard' && styles.standardSeat,
                        seat.kind === 'vip' && styles.vipSeat,
                        seat.kind === 'sweetbox' && styles.sweetboxTone,
                        seat.status === 'selected' && styles.selectedSeat,
                        seat.status === 'reserved' && styles.reservedSeat,
                        pressed && seat.status !== 'reserved' && styles.seatPressed,
                      ]}>
                      {seat.status === 'reserved' ? (
                        <MaterialIcons name="close" size={14} color="#FFFFFF" />
                      ) : (
                        <Text
                          style={[
                            styles.seatText,
                            seat.kind === 'sweetbox' && styles.sweetboxText,
                            seat.status === 'selected' && styles.selectedSeatText,
                          ]}>
                          {seat.id}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </ScrollView>

        <View style={styles.miniMap}>
          <View style={styles.miniViewport} />
          {seats.map((seat) => (
            <View
              key={`mini-${seat.id}`}
              style={[
                styles.miniSeat,
                seat.kind === 'sweetbox' && styles.miniSweetbox,
                seat.status === 'selected' && styles.miniSelected,
                seat.status === 'reserved' && styles.miniReserved,
                seat.kind === 'vip' && seat.status === 'available' && styles.miniVip,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.legendBar}>
        <LegendItem label="Đã đặt" kind="reserved" wide={false} />
        <LegendItem label="Ghế bạn chọn" kind="selected" wide={false} />
        <LegendItem label="Ghế thường" kind="standard" wide={false} />
        <LegendItem label="Ghế VIP" kind="vip" wide={false} />
        <LegendItem label="Sweetbox" kind="sweetbox" wide />
      </View>

      <View style={styles.footer}>
        <View style={styles.movieRow}>
          <View style={styles.movieInfo}>
            <View style={styles.movieTitleRow}>
              <Text style={styles.ageBadge}>16+</Text>
              <Text style={styles.movieTitle}>Khách</Text>
            </View>
            <View style={styles.sessionRow}>
              <MaterialIcons name="calendar-today" size={14} color="#737688" />
              <Text numberOfLines={1} style={styles.sessionText}>
                23:10~01:09 | Thứ 6, 29/05/2026 | 2D Phụ đề
              </Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" style={styles.changeButton}>
            <Text style={styles.changeText}>Đổi suất</Text>
          </Pressable>
        </View>

        <View style={styles.checkoutRow}>
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Tạm tính</Text>
            <Text style={styles.totalPrice}>{money(total)}</Text>
            <View style={styles.chipsRow}>
              {selectedSeats.map((seat) => (
                <Text key={seat.id} style={styles.seatChip}>
                  {seat.id}
                </Text>
              ))}
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed]}>
            <Text style={styles.continueText}>Tiếp tục</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function LegendItem({
  label,
  kind,
  wide,
}: {
  label: string;
  kind: 'reserved' | 'selected' | SeatKind;
  wide: boolean;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendSwatch,
          wide && styles.legendWide,
          kind === 'reserved' && styles.legendReserved,
          kind === 'selected' && styles.legendSelected,
          kind === 'standard' && styles.legendStandard,
          kind === 'vip' && styles.legendVip,
          kind === 'sweetbox' && styles.legendSweetbox,
        ]}>
        {kind === 'reserved' ? <MaterialIcons name="close" size={12} color="#FFFFFF" /> : null}
      </View>
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  appBar: {
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195, 197, 217, 0.28)',
    backgroundColor: '#F8F9FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: '#E1E3E4',
    transform: [{ scale: 0.96 }],
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    maxWidth: 230,
    fontFamily: Fonts.sansBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#191C1D',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  cinemaMark: {
    width: 16,
    height: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0041C8',
  },
  cinemaMarkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Fonts.sansBold,
  },
  subtitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.6,
    color: '#737688',
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenArea: {
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195, 197, 217, 0.2)',
    backgroundColor: 'rgba(248, 249, 250, 0.94)',
    zIndex: 10,
  },
  screenCurve: {
    width: '80%',
    height: 40,
    borderTopWidth: 4,
    borderTopColor: '#0041C8',
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    shadowColor: '#0041C8',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  screenLabel: {
    marginTop: -2,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 2,
    color: '#737688',
  },
  mapStage: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  mapScroll: {
    flex: 1,
  },
  mapScrollContent: {
    minHeight: 470,
  },
  horizontalContent: {
    minWidth: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  seatMapWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatMap: {
    width: 316,
    position: 'relative',
  },
  premiumFrame: {
    position: 'absolute',
    left: -5,
    right: -5,
    top: 118,
    height: 188,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#22C55E',
    zIndex: 1,
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    zIndex: 2,
  },
  seat: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sweetboxSeat: {
    width: 74,
  },
  standardSeat: {
    backgroundColor: '#E8F0FE',
    borderColor: 'transparent',
  },
  vipSeat: {
    backgroundColor: '#D1E3FF',
    borderColor: 'rgba(0, 65, 200, 0.2)',
  },
  sweetboxTone: {
    backgroundColor: '#F3E5F5',
    borderColor: 'transparent',
  },
  selectedSeat: {
    backgroundColor: '#0041C8',
    borderColor: '#0041C8',
    transform: [{ scale: 1.08 }],
    shadowColor: '#0041C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 3,
  },
  reservedSeat: {
    backgroundColor: '#C3C5D9',
    borderColor: '#C3C5D9',
    opacity: 0.62,
  },
  seatPressed: {
    transform: [{ scale: 1.12 }],
  },
  seatText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    lineHeight: 10,
    color: '#0041C8',
  },
  sweetboxText: {
    color: '#886100',
  },
  selectedSeatText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansBold,
  },
  miniMap: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 100,
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  miniViewport: {
    position: 'absolute',
    top: 4,
    left: 18,
    width: 54,
    height: 58,
    borderWidth: 1.5,
    borderColor: '#22C55E',
    zIndex: 3,
  },
  miniSeat: {
    width: 9,
    height: 9,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  miniSweetbox: {
    width: 20,
  },
  miniVip: {
    backgroundColor: 'rgba(176, 198, 255, 0.5)',
  },
  miniSelected: {
    backgroundColor: '#0041C8',
  },
  miniReserved: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  legendBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(195, 197, 217, 0.24)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    shadowColor: '#0041C8',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    zIndex: 15,
  },
  legendItem: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendWide: {
    width: 40,
  },
  legendReserved: {
    backgroundColor: '#C3C5D9',
  },
  legendSelected: {
    backgroundColor: '#0041C8',
  },
  legendStandard: {
    backgroundColor: '#E8F0FE',
  },
  legendVip: {
    backgroundColor: '#D1E3FF',
    borderWidth: 1,
    borderColor: 'rgba(0, 65, 200, 0.2)',
  },
  legendSweetbox: {
    backgroundColor: '#F3E5F5',
  },
  legendLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
    color: '#434656',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(195, 197, 217, 0.24)',
    backgroundColor: '#FFFFFF',
    zIndex: 20,
  },
  movieRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  movieInfo: {
    flex: 1,
    minWidth: 0,
  },
  movieTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ageBadge: {
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#6A4A00',
    color: '#FFFFFF',
    fontFamily: Fonts.sansBold,
    fontSize: 10,
  },
  movieTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    lineHeight: 24,
    color: '#191C1D',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionText: {
    flex: 1,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#737688',
  },
  changeButton: {
    minHeight: 36,
    justifyContent: 'center',
  },
  changeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.4,
    color: '#0041C8',
  },
  checkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  totalBlock: {
    flex: 1,
    minWidth: 0,
  },
  totalLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#434656',
  },
  totalPrice: {
    marginTop: 1,
    fontFamily: Fonts.rounded,
    fontSize: 24,
    lineHeight: 32,
    color: '#0041C8',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  seatChip: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 65, 200, 0.1)',
    color: '#0041C8',
    fontFamily: Fonts.sansBold,
    fontSize: 10,
  },
  continueButton: {
    minHeight: 54,
    minWidth: 148,
    paddingHorizontal: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0041C8',
    shadowColor: '#0041C8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  continuePressed: {
    transform: [{ scale: 0.97 }],
  },
  continueText: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
  },
});
