import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import {
  HeroCard,
  MetricTile,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import {
  fetchNearbyCinemas,
  type BackendNearbyCinema,
} from '@/lib/backend-api';
import { getCurrentLocation } from '@/lib/locationService';
import {
  formatAddress,
  formatCinemaFeatures,
  formatCity,
  formatLocationName,
} from '@/lib/user-display';

type LocationState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'granted'; nearbyCinemas: BackendNearbyCinema[] }
  | { phase: 'denied' }
  | { phase: 'error'; message: string };

export default function CinemasTabScreen() {
  const { cinemas, rooms, showtimes } = useAppStore();
  const colors = getTonePalette('user');

  const [locationState, setLocationState] = useState<LocationState>({ phase: 'idle' });

  useEffect(() => {
    let active = true;

    const fetchNearby = async () => {
      setLocationState({ phase: 'loading' });

      const locationResult = await getCurrentLocation();

      if (!active) return;

      if (locationResult.status === 'denied') {
        setLocationState({ phase: 'denied' });
        return;
      }

      if (locationResult.status === 'unavailable' || locationResult.status === 'error') {
        const message =
          locationResult.status === 'error'
            ? locationResult.message
            : 'Không thể lấy vị trí';
        setLocationState({ phase: 'error', message });
        return;
      }

      // status === 'granted'
      try {
        const response = await fetchNearbyCinemas(
          locationResult.latitude,
          locationResult.longitude,
        );

        if (!active) return;
        setLocationState({ phase: 'granted', nearbyCinemas: response.items });
      } catch {
        if (!active) return;
        setLocationState({ phase: 'error', message: 'Không thể tải danh sách rạp gần đây.' });
      }
    };

    fetchNearby();

    return () => {
      active = false;
    };
  }, []);

  const isNearby = locationState.phase === 'granted';
  const isLoading = locationState.phase === 'loading';

  return (
    <PageScroll tone="user">
      <HeroCard
        tone="user"
        eyebrow="Khám phá rạp"
        title="Người dùng có tab riêng để xem rạp và lịch chiếu.">
        <View style={styles.metrics}>
          <MetricTile tone="user" value={String(cinemas.length)} label="Chi nhánh" />
          <MetricTile tone="user" value={String(rooms.length)} label="Phòng chiếu" />
        </View>
      </HeroCard>

      {/* Location status banner */}
      {isLoading && (
        <SectionCard tone="user">
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.statusText, { color: colors.muted }]}>
              Đang lấy vị trí GPS...
            </Text>
          </View>
        </SectionCard>
      )}

      {locationState.phase === 'denied' && (
        <SectionCard tone="user">
          <Text style={[styles.statusText, { color: colors.muted }]}>
            📍 Quyền vị trí bị từ chối. Hiển thị tất cả rạp theo thứ tự mặc định.
          </Text>
        </SectionCard>
      )}

      {locationState.phase === 'error' && (
        <SectionCard tone="user">
          <Text style={[styles.statusText, { color: colors.muted }]}>
            ⚠️ {locationState.message} Hiển thị tất cả rạp.
          </Text>
        </SectionCard>
      )}

      {/* Nearby cinemas list (GPS granted) */}
      {isNearby && (
        <>
          <SectionTitle tone="user" title="Rạp gần bạn nhất" />
          {locationState.nearbyCinemas.length === 0 ? (
            <SectionCard tone="user">
              <Text style={[styles.cardCopy, { color: colors.muted }]}>
                Không tìm thấy rạp có tọa độ gần vị trí của bạn.
              </Text>
            </SectionCard>
          ) : (
            locationState.nearbyCinemas.map((cinema) => {
              const cinemaId = String(cinema._id);
              const roomCount = rooms.filter((room) => room.cinemaId === cinemaId).length;
              const showtimeCount = showtimes.filter(
                (showtime) => showtime.cinemaId === cinemaId,
              ).length;

              return (
                <SectionCard key={cinemaId} tone="user">
                  <View style={styles.rowBetween}>
                    <View style={styles.flex}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {cinema.brand} {formatLocationName(cinema.name)}
                      </Text>
                      <Text style={[styles.cardCopy, { color: colors.muted }]}>
                        {formatAddress(cinema.address)}
                      </Text>
                      <Text style={[styles.cardCopy, { color: colors.muted }]}>
                        {formatCity(cinema.city)}
                      </Text>
                      <Text style={[styles.distanceBadge, { color: colors.accent }]}>
                        📍 {cinema.distanceKm} km
                      </Text>
                    </View>
                    <Link
                      href={`/cinemas/${cinemaId}`}
                      style={[styles.link, { color: colors.accent }]}>
                      Xem lịch
                    </Link>
                  </View>
                  <Text style={[styles.inlineMeta, { color: colors.text }]}>
                    {roomCount} phòng • {showtimeCount} suất chiếu
                  </Text>
                </SectionCard>
              );
            })
          )}
        </>
      )}

      {/* Fallback: all cinemas (no GPS or error/denied) */}
      {!isNearby && !isLoading && (
        <>
          <SectionTitle tone="user" title="Rạp đang hoạt động" />
          {cinemas.map((cinema) => {
            const roomCount = rooms.filter((room) => room.cinemaId === cinema.id).length;
            const showtimeCount = showtimes.filter(
              (showtime) => showtime.cinemaId === cinema.id,
            ).length;

            return (
              <SectionCard key={cinema.id} tone="user">
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      {cinema.brand} {formatLocationName(cinema.name)}
                    </Text>
                    <Text style={[styles.cardCopy, { color: colors.muted }]}>
                      {formatAddress(cinema.address)}
                    </Text>
                    <Text style={[styles.cardCopy, { color: colors.muted }]}>
                      {formatCity(cinema.city)} • {formatCinemaFeatures(cinema.features)}
                    </Text>
                  </View>
                  <Link
                    href={`/cinemas/${cinema.id}`}
                    style={[styles.link, { color: colors.accent }]}>
                    Xem lịch
                  </Link>
                </View>
                <Text style={[styles.inlineMeta, { color: colors.text }]}>
                  {roomCount} phòng • {showtimeCount} suất chiếu
                </Text>
              </SectionCard>
            );
          })}
        </>
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  flex: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: Fonts.sansBold,
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  distanceBadge: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    marginTop: 2,
  },
  inlineMeta: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  link: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
  },
});
