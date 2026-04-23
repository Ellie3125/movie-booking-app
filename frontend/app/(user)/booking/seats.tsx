import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  ActionButton,
  Chip,
  EmptyNotice,
  HeroCard,
  PageScroll,
  SectionCard,
  getTonePalette,
} from '@/components/ui/experience';
import { SeatLayoutGrid, getSeatLayoutMetrics } from '@/components/ui/seat-layout-grid';
import { Fonts } from '@/constants/theme';
import { type RoomSeat, useAppStore } from '@/lib/app-store';
import {
  buildSeatVariantLookup,
  formatSeatVisualLabel,
  roomHasVipSeats,
  seatStatusTokens,
  seatVariantTokens,
  type SeatVisualStatus,
  type SeatVisualVariant,
} from '@/lib/seat-appearance';
import { getEdgeSeatSelectionConflict } from '@/lib/seat-selection-rule';
import {
  formatLocationName,
  formatRoomName,
  formatScreenLabel,
  formatShowtimeDayLabel,
  formatShowtimeTime,
} from '@/lib/user-display';

type ViewportSize = {
  width: number;
  height: number;
};

type SeatLegendItem = {
  key: string;
  label: string;
  description: string;
  variant: SeatVisualVariant;
  status: SeatVisualStatus;
};

const MIN_SEAT_ZOOM = 0.85;
const MAX_SEAT_ZOOM = 2.2;
const SEAT_ZOOM_STEP = 0.2;

const clampValue = (value: number, min: number, max: number) => {
  'worklet';

  return Math.min(max, Math.max(min, value));
};

const roundZoom = (value: number) => {
  'worklet';

  return Math.round(value * 100) / 100;
};

const clampSeatZoom = (value: number) => {
  'worklet';

  return roundZoom(clampValue(value, MIN_SEAT_ZOOM, MAX_SEAT_ZOOM));
};

const getTranslationBounds = (contentSize: number, viewportSize: number, scale: number) => {
  'worklet';

  if (contentSize <= 0 || viewportSize <= 0) {
    return { min: 0, max: 0 };
  }

  const scaledSize = contentSize * scale;

  if (scaledSize <= viewportSize) {
    return { min: 0, max: 0 };
  }

  const overflow = (scaledSize - viewportSize) / 2;

  return {
    min: -overflow,
    max: overflow,
  };
};

const clampOffset = (
  value: number,
  contentSize: number,
  viewportSize: number,
  scale: number,
) => {
  'worklet';

  const bounds = getTranslationBounds(contentSize, viewportSize, scale);

  return clampValue(value, bounds.min, bounds.max);
};

function SeatLegendPreview({
  variant,
  status,
  compact,
}: {
  variant: SeatVisualVariant;
  status: SeatVisualStatus;
  compact: boolean;
}) {
  const statusToken = seatStatusTokens[status];
  const variantToken = seatVariantTokens[variant];
  const width = compact ? 36 : 44;
  const height = compact ? 32 : 38;
  const accentHeight = compact ? 4 : 5;
  const silhouetteHeight = compact ? 7 : 8;
  const silhouetteWidth = variantToken.previewWide ? (compact ? 18 : 22) : compact ? 12 : 14;

  return (
    <View
      style={[
        styles.legendSeatFrame,
        {
          width,
          height,
          backgroundColor: statusToken.fill,
          borderColor: statusToken.border,
        },
      ]}>
      <View
        style={[
          styles.legendSeatAccent,
          { height: accentHeight, backgroundColor: variantToken.accent },
        ]}
      />
      {variant === 'vip' ? (
        <Text style={[styles.legendSeatBadge, { color: variantToken.accent }]}>VIP</Text>
      ) : null}
      <Text style={[styles.legendSeatText, { color: statusToken.text }]}>A1</Text>
      <View
        style={[
          styles.legendSeatSilhouette,
          {
            width: silhouetteWidth,
            height: silhouetteHeight,
            backgroundColor: variantToken.accentSoft,
          },
        ]}>
        {variant === 'couple' ? (
          <View style={[styles.legendSeatDivider, { backgroundColor: variantToken.accent }]} />
        ) : null}
      </View>
    </View>
  );
}

export default function SeatSelectionScreen() {
  const { showtimeId } = useLocalSearchParams<{ showtimeId?: string }>();
  const { movies, cinemas, rooms, showtimes, startCheckout } = useAppStore();
  const { width } = useWindowDimensions();
  const colors = getTonePalette('user');
  const compact = width < 430;
  const mediumLayout = width >= 720;
  const wideLayout = width >= 980;
  const defaultZoom = compact ? 0.96 : 1;
  const [selectedCoordinates, setSelectedCoordinates] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [selectionNotice, setSelectionNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [seatZoom, setSeatZoom] = useState(defaultZoom);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: 0, height: 0 });

  const scale = useSharedValue(defaultZoom);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleOffset = useSharedValue(defaultZoom);
  const translateXOffset = useSharedValue(0);
  const translateYOffset = useSharedValue(0);

  const showtime = showtimes.find((item) => item.id === showtimeId);
  const movie = movies.find((item) => item.id === showtime?.movieId);
  const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);
  const room = rooms.find((item) => item.id === showtime?.roomId);
  const layoutMetrics = getSeatLayoutMetrics(compact, 1);
  const contentWidth = room
    ? room.totalColumns * layoutMetrics.cellWidth +
      Math.max(room.totalColumns - 1, 0) * layoutMetrics.gridGap
    : 0;
  const contentHeight = room
    ? room.totalRows * layoutMetrics.cellMinHeight +
      Math.max(room.totalRows - 1, 0) * layoutMetrics.gridGap
    : 0;
  const seatVariantLookup = buildSeatVariantLookup(room);
  const seatLookup = new Map(
    (room?.seatLayout.flat().filter((seat) => seat.cellType === 'seat') ?? []).map((seat) => [
      seat.coordinate.coordinateLabel.toUpperCase(),
      seat,
    ]),
  );
  const selectedSeats = selectedCoordinates
    .map((coordinate) => {
      const seat = seatLookup.get(coordinate);

      return {
        coordinate,
        label: seat?.seatLabel ?? coordinate,
        variant: seatVariantLookup[coordinate] ?? 'standard',
        price: (showtime?.basePrice ?? 0) + (seat?.priceModifier ?? 0),
        rowIndex: seat?.coordinate.rowIndex ?? Number.MAX_SAFE_INTEGER,
        columnIndex: seat?.coordinate.columnIndex ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .sort(
      (first, second) =>
        first.rowIndex - second.rowIndex || first.columnIndex - second.columnIndex,
    );
  const selectedTotal = selectedSeats.reduce((total, seat) => total + seat.price, 0);
  const availableSeatsCount = showtime
    ? showtime.seatStates.filter((seat) => seat.status === 'available').length
    : 0;
  const zoomPercent = Math.round(seatZoom * 100);
  const hasVipSeats = roomHasVipSeats(room);

  const statusLegendItems: SeatLegendItem[] = [
    {
      key: 'available',
      label: 'Ghế trống',
      description: 'Có thể chọn ngay trên sơ đồ.',
      variant: 'standard',
      status: 'available',
    },
    {
      key: 'held',
      label: 'Ghế đang giữ',
      description: 'Đang được giữ tạm trong phiên khác.',
      variant: 'standard',
      status: 'held',
    },
    {
      key: 'selected',
      label: 'Ghế đang chọn',
      description: 'Ghế bạn đã chọn trong phiên hiện tại.',
      variant: 'standard',
      status: 'selected',
    },
    {
      key: 'paid',
      label: 'Ghế đã bán',
      description: 'Đã thanh toán nên không thể chọn.',
      variant: 'standard',
      status: 'paid',
    },
    {
      key: 'reserved',
      label: 'Ghế đặt trước',
      description: 'Được hệ thống khóa hoặc reserve trước.',
      variant: 'standard',
      status: 'reserved',
    },
  ];

  const typeLegendItems: SeatLegendItem[] = [
    {
      key: 'standard',
      label: 'Ghế thường',
      description: 'Ghế tiêu chuẩn cho 1 người.',
      variant: 'standard',
      status: 'available',
    },
    {
      key: 'vip',
      label: 'Ghế VIP',
      description: hasVipSeats
        ? 'Ghế VIP của phòng Premium hoặc Gold Class.'
        : 'Kiểu ghế VIP dùng cho các phòng có khu ghế cao cấp.',
      variant: 'vip',
      status: 'available',
    },
    {
      key: 'couple',
      label: 'Ghế cặp đôi',
      description: 'Ghế cho 2 người ngồi liền nhau.',
      variant: 'couple',
      status: 'available',
    },
  ];

  useEffect(() => {
    setSeatZoom(defaultZoom);
    scale.value = defaultZoom;
    translateX.value = 0;
    translateY.value = 0;
  }, [defaultZoom, showtimeId]);

  useEffect(() => {
    setSelectedCoordinates([]);
    setError('');
    setSelectionNotice('');
  }, [showtimeId]);

  useEffect(() => {
    const nextScale = clampSeatZoom(scale.value);

    translateX.value = clampOffset(
      translateX.value,
      contentWidth,
      viewportSize.width,
      nextScale,
    );
    translateY.value = clampOffset(
      translateY.value,
      contentHeight,
      viewportSize.height,
      nextScale,
    );
  }, [contentHeight, contentWidth, viewportSize.height, viewportSize.width]);

  const updateViewportSize = (nextSize: ViewportSize) => {
    setViewportSize((currentSize) => {
      if (
        currentSize.width === nextSize.width &&
        currentSize.height === nextSize.height
      ) {
        return currentSize;
      }

      return nextSize;
    });
  };

  const animateZoom = (nextZoom: number) => {
    const clampedZoom = clampSeatZoom(nextZoom);

    setSeatZoom(clampedZoom);
    scale.value = withTiming(clampedZoom, { duration: 180 });
    translateX.value = withTiming(
      clampOffset(translateX.value, contentWidth, viewportSize.width, clampedZoom),
      { duration: 180 },
    );
    translateY.value = withTiming(
      clampOffset(translateY.value, contentHeight, viewportSize.height, clampedZoom),
      { duration: 180 },
    );
  };

  const animatedSeatMapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const panGesture = Gesture.Pan()
    .minDistance(6)
    .onStart(() => {
      translateXOffset.value = translateX.value;
      translateYOffset.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = clampOffset(
        translateXOffset.value + event.translationX,
        contentWidth,
        viewportSize.width,
        scale.value,
      );
      translateY.value = clampOffset(
        translateYOffset.value + event.translationY,
        contentHeight,
        viewportSize.height,
        scale.value,
      );
    })
    .onEnd(() => {
      translateX.value = withTiming(
        clampOffset(translateX.value, contentWidth, viewportSize.width, scale.value),
        { duration: 140 },
      );
      translateY.value = withTiming(
        clampOffset(translateY.value, contentHeight, viewportSize.height, scale.value),
        { duration: 140 },
      );
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      scaleOffset.value = scale.value;
    })
    .onUpdate((event) => {
      const nextScale = clampSeatZoom(scaleOffset.value * event.scale);

      scale.value = nextScale;
      translateX.value = clampOffset(
        translateX.value,
        contentWidth,
        viewportSize.width,
        nextScale,
      );
      translateY.value = clampOffset(
        translateY.value,
        contentHeight,
        viewportSize.height,
        nextScale,
      );
    })
    .onEnd(() => {
      const nextScale = clampSeatZoom(scale.value);

      scale.value = withTiming(nextScale, { duration: 160 });
      translateX.value = withTiming(
        clampOffset(translateX.value, contentWidth, viewportSize.width, nextScale),
        { duration: 160 },
      );
      translateY.value = withTiming(
        clampOffset(translateY.value, contentHeight, viewportSize.height, nextScale),
        { duration: 160 },
      );
      runOnJS(setSeatZoom)(nextScale);
    });

  const seatMapGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const handleSeatPress = (seat: RoomSeat) => {
    if (seat.cellType === 'empty') {
      return;
    }

    const coordinate = seat.coordinate.coordinateLabel.toUpperCase();
    const state = showtime?.seatStates.find((item) => item.seatCoordinate === coordinate);

    if (state && state.status !== 'available') {
      return;
    }

    const nextSelectedCoordinates = selectedCoordinates.includes(coordinate)
      ? selectedCoordinates.filter((item) => item !== coordinate)
      : [...selectedCoordinates, coordinate];
    const edgeSeatConflict = getEdgeSeatSelectionConflict(
      room?.seatLayout ?? [],
      showtime?.seatStates ?? [],
      nextSelectedCoordinates,
    );

    if (edgeSeatConflict) {
      setSelectionNotice(edgeSeatConflict.message);
      return;
    }

    setSelectionNotice('');
    setError('');
    setSelectedCoordinates(nextSelectedCoordinates);
  };

  const handleContinue = async () => {
    if (!showtime || !room) {
      return;
    }

    const edgeSeatConflict = getEdgeSeatSelectionConflict(
      room.seatLayout,
      showtime.seatStates,
      selectedCoordinates,
    );

    if (edgeSeatConflict) {
      setSelectionNotice(edgeSeatConflict.message);
      setError('');
      return;
    }

    setSelectionNotice('');
    setSubmitting(true);
    const result = await startCheckout(showtime.id, selectedCoordinates);
    setSubmitting(false);

    if (!result.ok) {
      const message = result.error ?? 'Không thể tiếp tục đến bước thanh toán.';
      setError(message);

      if (message.includes('ghế ngoài cùng')) {
        setSelectionNotice(message);
      }

      return;
    }

    setSelectionNotice('');
    setError('');
    router.push({
      pathname: '/booking/checkout',
      params: { showtimeId: showtime.id },
    });
  };

  return (
    <PageScroll tone="user">
      <Stack.Screen options={{ title: movie?.title ?? 'Chọn ghế' }} />
      {!showtime || !room || !movie || !cinema ? (
        <EmptyNotice
          tone="user"
          title="Không tìm thấy dữ liệu đặt ghế"
          description="Hãy quay lại danh sách suất chiếu và chọn lại một phiên phù hợp."
        />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Chọn ghế"
            title={`${movie.title} • ${formatRoomName(room.name)}`}
            description={`${cinema.brand} ${formatLocationName(cinema.name)} • ${formatShowtimeDayLabel(showtime.startTime)} • ${formatShowtimeTime(showtime.startTime)}`}>
            <View style={styles.heroMetaRail}>
              <Chip tone="user" label={formatScreenLabel(room.screenLabel)} active />
              <Chip tone="user" label={`${availableSeatsCount}/${room.activeSeatCount} ghế trống`} />
              <Chip tone="user" label={`${zoomPercent}% zoom`} />
            </View>
          </HeroCard>

          <SectionCard tone="user" style={styles.screenBanner}>
            <Text style={[styles.screenBannerEyebrow, { color: colors.accent }]}>
              SCREEN {formatScreenLabel(room.screenLabel)}
            </Text>
            <Text style={[styles.screenBannerTitle, { color: colors.text }]}>
              Box chọn ghế được giữ cố định, chỉ nội dung seat map bên trong mới pinch zoom và pan.
            </Text>
            <Text style={[styles.screenBannerCopy, { color: colors.muted }]}>
              Chạm để chọn ghế, pinch để zoom, kéo để di chuyển sơ đồ. Layout tổng thể không bị phóng to theo thao tác zoom.
            </Text>
          </SectionCard>

          <SectionCard tone="user" style={styles.workbenchCard}>
            {selectionNotice ? (
              <View
                style={[
                  styles.noticeBox,
                  {
                    backgroundColor: 'rgba(245, 130, 32, 0.1)',
                    borderColor: 'rgba(245, 130, 32, 0.22)',
                  },
                ]}>
                <Text style={[styles.noticeTitle, { color: colors.text }]}>Lưu ý chọn ghế</Text>
                <Text style={[styles.noticeText, { color: colors.muted }]}>{selectionNotice}</Text>
              </View>
            ) : null}

            <View style={[styles.workbenchGrid, wideLayout ? styles.workbenchGridWide : null]}>
              <View style={styles.mapColumn}>
                <View style={styles.mapColumnHeader}>
                  <Text style={[styles.panelTitle, { color: colors.text }]}>Sơ đồ ghế</Text>
                  <Text style={[styles.panelCopy, { color: colors.muted }]}>
                    Trạng thái màu hiển thị trực tiếp trên ghế, còn loại ghế được phân biệt bằng accent và legend bên cạnh.
                  </Text>
                </View>

                <View style={styles.screenArcWrap}>
                  <View style={[styles.screenArc, { borderColor: 'rgba(57, 102, 147, 0.9)' }]} />
                  <Text style={[styles.screenArcLabel, { color: colors.text }]}>
                    MÀN HÌNH CHIẾU
                  </Text>
                </View>

                <View
                  style={[
                    styles.seatMapShell,
                    {
                      backgroundColor: colors.panel,
                      borderColor: colors.border,
                    },
                  ]}>
                  <View style={styles.seatMapToolbar}>
                    <View style={styles.toolbarCopy}>
                      <Text style={[styles.toolbarTitle, { color: colors.text }]}>
                        Điều hướng sơ đồ
                      </Text>
                      <Text style={[styles.toolbarHint, { color: colors.muted }]}>
                        Zoom và pan chỉ tác động lên seat map content.
                      </Text>
                    </View>
                    <View style={styles.zoomActions}>
                      <Pressable
                        onPress={() => animateZoom(seatZoom - SEAT_ZOOM_STEP)}
                        disabled={seatZoom <= MIN_SEAT_ZOOM}
                        style={[
                          styles.zoomButton,
                          {
                            backgroundColor: colors.panelAlt,
                            borderColor: colors.border,
                            opacity: seatZoom <= MIN_SEAT_ZOOM ? 0.45 : 1,
                          },
                        ]}>
                        <Text style={[styles.zoomButtonText, { color: colors.text }]}>-</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => animateZoom(defaultZoom)}
                        style={[
                          styles.zoomBadge,
                          {
                            backgroundColor: colors.panelAlt,
                            borderColor: colors.border,
                          },
                        ]}>
                        <Text style={[styles.zoomBadgeText, { color: colors.text }]}>
                          {zoomPercent}%
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => animateZoom(seatZoom + SEAT_ZOOM_STEP)}
                        disabled={seatZoom >= MAX_SEAT_ZOOM}
                        style={[
                          styles.zoomButton,
                          {
                            backgroundColor: colors.panelAlt,
                            borderColor: colors.border,
                            opacity: seatZoom >= MAX_SEAT_ZOOM ? 0.45 : 1,
                          },
                        ]}>
                        <Text style={[styles.zoomButtonText, { color: colors.text }]}>+</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.seatViewport,
                      compact
                        ? styles.seatViewportCompact
                        : mediumLayout
                          ? styles.seatViewportWide
                          : styles.seatViewportRegular,
                      {
                        backgroundColor: '#FFF8EF',
                        borderColor: colors.border,
                      },
                    ]}
                    onLayout={(event) =>
                      updateViewportSize({
                        width: event.nativeEvent.layout.width,
                        height: event.nativeEvent.layout.height,
                      })
                    }>
                    <GestureDetector gesture={seatMapGesture}>
                      <View style={styles.seatViewportCenter}>
                        <Animated.View
                          style={[
                            styles.seatMapTransformLayer,
                            animatedSeatMapStyle,
                            {
                              width: contentWidth || layoutMetrics.cellWidth,
                              height: contentHeight || layoutMetrics.cellMinHeight,
                            },
                          ]}>
                          <SeatLayoutGrid
                            layout={room.seatLayout}
                            seatStates={showtime.seatStates}
                            selectedCoordinates={selectedCoordinates}
                            mode="user"
                            onPressSeat={handleSeatPress}
                            sizeScale={1}
                            useIntrinsicSizing
                            seatVariantLookup={seatVariantLookup}
                          />
                        </Animated.View>
                      </View>
                    </GestureDetector>
                  </View>
                </View>
              </View>

              <View style={[styles.sideColumn, wideLayout ? styles.sideColumnWide : null]}>
                <View
                  style={[
                    styles.sidePanel,
                    { backgroundColor: colors.panel, borderColor: colors.border },
                  ]}>
                  <Text style={[styles.panelTitle, { color: colors.text }]}>Trạng thái ghế</Text>
                  <View style={styles.legendGrid}>
                    {statusLegendItems.map((item) => (
                      <View key={item.key} style={styles.legendRow}>
                        <SeatLegendPreview
                          variant={item.variant}
                          status={item.status}
                          compact={compact}
                        />
                        <View style={styles.legendCopy}>
                          <Text style={[styles.legendLabel, { color: colors.text }]}>
                            {item.label}
                          </Text>
                          <Text style={[styles.legendDescription, { color: colors.muted }]}>
                            {item.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                <View
                  style={[
                    styles.sidePanel,
                    { backgroundColor: colors.panel, borderColor: colors.border },
                  ]}>
                  <Text style={[styles.panelTitle, { color: colors.text }]}>Loại ghế</Text>
                  <View style={styles.legendGrid}>
                    {typeLegendItems.map((item) => (
                      <View key={item.key} style={styles.legendRow}>
                        <SeatLegendPreview
                          variant={item.variant}
                          status={item.status}
                          compact={compact}
                        />
                        <View style={styles.legendCopy}>
                          <Text style={[styles.legendLabel, { color: colors.text }]}>
                            {item.label}
                          </Text>
                          <Text style={[styles.legendDescription, { color: colors.muted }]}>
                            {item.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                <View
                  style={[
                    styles.sidePanel,
                    { backgroundColor: colors.panel, borderColor: colors.border },
                  ]}>
                  <Text style={[styles.panelTitle, { color: colors.text }]}>Ghế đang chọn</Text>
                  <View style={styles.selectionStats}>
                    <View
                      style={[
                        styles.selectionStatTile,
                        { backgroundColor: colors.accentSoft, borderColor: colors.border },
                      ]}>
                      <Text style={[styles.selectionStatValue, { color: colors.text }]}>
                        {selectedSeats.length}
                      </Text>
                      <Text style={[styles.selectionStatLabel, { color: colors.muted }]}>
                        Ghế đã chọn
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.selectionStatTile,
                        { backgroundColor: colors.accentSoft, borderColor: colors.border },
                      ]}>
                      <Text style={[styles.selectionStatValue, { color: colors.text }]}>
                        {selectedTotal.toLocaleString('vi-VN')}đ
                      </Text>
                      <Text style={[styles.selectionStatLabel, { color: colors.muted }]}>
                        Tạm tính
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.selectionSummary, { color: colors.muted }]}>
                    {selectedSeats.length === 0
                      ? 'Chưa chọn ghế. Hãy chạm trực tiếp lên sơ đồ bên trái.'
                      : 'Các ghế đang chọn sẽ được tạm giữ khi bạn tiếp tục sang bước thanh toán.'}
                  </Text>

                  <View style={styles.chipRow}>
                    {selectedCoordinates.length === 0 ? (
                      <Chip tone="user" label="Chưa chọn ghế" />
                    ) : (
                      selectedSeats.map((seat) => (
                        <Chip
                          key={seat.coordinate}
                          tone="user"
                          label={`${seat.label} • ${formatSeatVisualLabel(seat.variant)}`}
                          active
                        />
                      ))
                    )}
                  </View>

                  {error ? (
                    <Text style={[styles.errorText, { color: colors.accent }]}>{error}</Text>
                  ) : null}

                  <ActionButton
                    tone="user"
                    label={
                      submitting ? 'Đang chuyển sang thanh toán...' : 'Tạm giữ ghế và tiếp tục'
                    }
                    onPress={handleContinue}
                    disabled={submitting}
                  />
                </View>
              </View>
            </View>
          </SectionCard>
        </>
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  heroMetaRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  screenBanner: {
    gap: 8,
  },
  screenBannerEyebrow: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontFamily: Fonts.sansBold,
  },
  screenBannerTitle: {
    fontSize: 19,
    lineHeight: 26,
    fontFamily: Fonts.rounded,
  },
  screenBannerCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  workbenchCard: {
    gap: 14,
  },
  noticeBox: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  noticeTitle: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  workbenchGrid: {
    gap: 14,
  },
  workbenchGridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mapColumn: {
    flex: 1.75,
    gap: 14,
  },
  mapColumnHeader: {
    gap: 4,
  },
  panelTitle: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
  },
  panelCopy: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Fonts.sans,
  },
  screenArcWrap: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  screenArc: {
    width: '96%',
    height: 46,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    backgroundColor: 'transparent',
  },
  screenArcLabel: {
    fontSize: 18,
    letterSpacing: 1.8,
    fontFamily: Fonts.rounded,
  },
  seatMapShell: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 14,
    gap: 14,
  },
  seatMapToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toolbarCopy: {
    flex: 1,
    gap: 2,
  },
  toolbarTitle: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
  },
  toolbarHint: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.sans,
  },
  zoomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoomButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: {
    fontSize: 20,
    lineHeight: 20,
    fontFamily: Fonts.sansBold,
  },
  zoomBadge: {
    minWidth: 72,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  zoomBadgeText: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  seatViewport: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  seatViewportCompact: {
    height: 360,
  },
  seatViewportRegular: {
    height: 410,
  },
  seatViewportWide: {
    height: 480,
  },
  seatViewportCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  seatMapTransformLayer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideColumn: {
    gap: 12,
  },
  sideColumnWide: {
    width: 340,
  },
  sidePanel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  legendGrid: {
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendCopy: {
    flex: 1,
    gap: 2,
  },
  legendLabel: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  legendDescription: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.sans,
  },
  legendSeatFrame: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 4,
    position: 'relative',
  },
  legendSeatAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  legendSeatBadge: {
    position: 'absolute',
    right: 4,
    top: 5,
    fontSize: 5,
    fontWeight: '800',
  },
  legendSeatText: {
    fontSize: 8,
    fontWeight: '800',
  },
  legendSeatSilhouette: {
    borderRadius: 999,
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  legendSeatDivider: {
    width: 2,
    alignSelf: 'stretch',
    opacity: 0.7,
  },
  selectionStats: {
    flexDirection: 'row',
    gap: 10,
  },
  selectionStatTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 2,
  },
  selectionStatValue: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.rounded,
  },
  selectionStatLabel: {
    fontSize: 12,
    fontFamily: Fonts.sans,
  },
  selectionSummary: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  errorText: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
});
