import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ActionButton,
  Chip,
  EmptyNotice,
  HeroCard,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { SeatLayoutGrid } from '@/components/ui/seat-layout-grid';
import { type RoomSeat, useAppStore } from '@/lib/app-store';
import {
  formatLocationName,
  formatRoomName,
  formatScreenLabel,
} from '@/lib/user-display';

const formatSession = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function SeatSelectionScreen() {
  const { showtimeId } = useLocalSearchParams<{ showtimeId?: string }>();
  const { movies, cinemas, rooms, showtimes, startCheckout } = useAppStore();
  const colors = getTonePalette('user');
  const [selectedCoordinates, setSelectedCoordinates] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showtime = showtimes.find((item) => item.id === showtimeId);
  const movie = movies.find((item) => item.id === showtime?.movieId);
  const cinema = cinemas.find((item) => item.id === showtime?.cinemaId);
  const room = rooms.find((item) => item.id === showtime?.roomId);

  const handleSeatPress = (seat: RoomSeat) => {
    if (seat.cellType === 'empty') {
      return;
    }

    const coordinate = seat.coordinate.coordinateLabel.toUpperCase();
    const state = showtime?.seatStates.find((item) => item.seatCoordinate === coordinate);

    if (state && state.status !== 'available') {
      return;
    }

    setSelectedCoordinates((current) =>
      current.includes(coordinate)
        ? current.filter((item) => item !== coordinate)
        : [...current, coordinate],
    );
  };

  const handleContinue = async () => {
    if (!showtime) {
      return;
    }

    setSubmitting(true);
    const result = await startCheckout(showtime.id, selectedCoordinates);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'Không thể tạm giữ ghế.');
      return;
    }

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
        <EmptyNotice tone="user" title="Không tìm thấy dữ liệu đặt ghế" />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Chọn ghế"
            title={`${movie.title} • ${formatRoomName(room.name)}`}
            description={`${cinema.brand} ${formatLocationName(cinema.name)} • ${formatSession(showtime.startTime)}`}
          />

          <SectionCard tone="user">
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {formatScreenLabel(room.screenLabel)}
            </Text>
          </SectionCard>

          <SectionTitle tone="user" title="Sơ đồ ghế" />
          <SectionCard tone="user">
            <SeatLayoutGrid
              layout={room.seatLayout}
              seatStates={showtime.seatStates}
              selectedCoordinates={selectedCoordinates}
              mode="user"
              onPressSeat={handleSeatPress}
            />
          </SectionCard>

          <SectionCard tone="user">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Ghế đang chọn</Text>
            <View style={styles.chipRow}>
              {selectedCoordinates.length === 0 ? (
                <Chip tone="user" label="Chưa chọn ghế" />
              ) : (
                selectedCoordinates.map((coordinate) => {
                  const seatState = showtime.seatStates.find(
                    (item) => item.seatCoordinate === coordinate,
                  );

                  return (
                    <Chip
                      key={coordinate}
                      tone="user"
                      label={`${seatState?.seatLabel ?? coordinate} / ${coordinate}`}
                      active
                    />
                  );
                })
              )}
            </View>
            {error ? (
              <Text style={[styles.errorText, { color: colors.accent }]}>{error}</Text>
            ) : null}
            <ActionButton
              tone="user"
              label={submitting ? 'Đang tạm giữ ghế...' : 'Tạm giữ ghế và tiếp tục'}
              onPress={handleContinue}
              disabled={submitting}
            />
          </SectionCard>
        </>
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: 17,
    fontFamily: Fonts.sansBold,
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
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
