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
import { SeatLayoutGrid } from '@/components/ui/seat-layout-grid';
import { type RoomSeat, useAppStore } from '@/lib/app-store';

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

  const handleContinue = () => {
    if (!showtime) {
      return;
    }

    const result = startCheckout(showtime.id, selectedCoordinates);

    if (!result.ok) {
      setError(result.error ?? 'Khong the tam giu ghe.');
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
      <Stack.Screen options={{ title: movie?.title ?? 'Seat Selection' }} />
      {!showtime || !room || !movie || !cinema ? (
        <EmptyNotice
          tone="user"
          title="Khong tim thay du lieu dat ghe"
          description="Suat chieu hoac phong chieu dang bi thieu du lieu."
        />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Seat selection"
            title={`${movie.title} • ${room.name}`}
            description={`${cinema.brand} ${cinema.name} • ${formatSession(showtime.startTime)}`}
          />

          <SectionCard tone="user">
            <Text style={[styles.cardTitle, { color: colors.text }]}>{room.screenLabel}</Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              Toa do that va seat label duoc tach rieng. Vi du A2 co the hien la ghe A1 neu A1 la o trong.
            </Text>
          </SectionCard>

          <SectionTitle
            tone="user"
            title="Seat map"
            description="Mau ghe: xanh la trong, vang la held, do la paid, xam la reserved, xanh duong la dang chon."
          />
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
            <Text style={[styles.cardTitle, { color: colors.text }]}>Ghe dang chon</Text>
            <View style={styles.chipRow}>
              {selectedCoordinates.length === 0 ? (
                <Chip tone="user" label="Chua chon ghe" />
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
              label="Tam giu ghe va tiep tuc"
              onPress={handleContinue}
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
    fontWeight: '800',
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
