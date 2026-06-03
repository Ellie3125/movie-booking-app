import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { MoviePoster } from '@/components/ui/movie-poster';
import {
  EmptyNotice,
  HeroCard,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { type Showtime, useAppStore } from '@/lib/app-store';
import {
  filterAvailableBookingDates,
  filterAvailableShowtimes,
  parseShowtimeDateTime,
} from '@/lib/booking-availability';
import {
  formatFormats,
  formatLanguage,
  formatLocationName,
  formatMovieDescription,
  formatGenres,
  formatRoomName,
  formatRoomType,
  formatShowtimeDayLabel,
  formatShowtimeFormat,
  formatShowtimeTime,
} from '@/lib/user-display';

type ShowtimeDayGroup = {
  key: string;
  label: string;
  dateText: string;
  weekdayText: string;
  showtimeIds: string[];
};

type TimeWindow = 'all' | 'morning' | 'midday' | 'afternoon' | 'evening';

type CinemaShowtimeGroup = {
  cinemaId: string;
  cinemaBrand: string;
  cinemaName: string;
  city: string;
  address: string;
  showtimes: Showtime[];
};

const timeWindows: { key: TimeWindow; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'morning', label: '09:00 - 12:00' },
  { key: 'midday', label: '12:00 - 15:00' },
  { key: 'afternoon', label: '15:00 - 18:00' },
  { key: 'evening', label: '18:00 - 24:00' },
];

const getShowtimeWindow = (showtime: Showtime): TimeWindow => {
  const hour = parseShowtimeDateTime(showtime)?.getHours() ?? 0;

  if (hour < 12) {
    return 'morning';
  }

  if (hour < 15) {
    return 'midday';
  }

  if (hour < 18) {
    return 'afternoon';
  }

  return 'evening';
};

const splitDayLabel = (label: string) => {
  const [weekdayText = label, dateText = label] = label.split(' - ');

  return { weekdayText, dateText };
};

const getShowtimeSortTime = (showtime: Showtime) =>
  parseShowtimeDateTime(showtime)?.getTime() ?? Number.MAX_SAFE_INTEGER;

export default function MovieDetailScreen() {
  const { id, cinemaId } = useLocalSearchParams<{ id?: string; cinemaId?: string }>();
  const { movies, showtimes, cinemas, rooms } = useAppStore();
  const { width } = useWindowDimensions();
  const colors = getTonePalette('user');
  const [selectedDateKey, setSelectedDateKey] = useState('');
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<TimeWindow>('all');
  const [availabilityNow, setAvailabilityNow] = useState(() => new Date());

  const compact = width < 700;
  const movie = movies.find((item) => item.id === id);
  const selectedCinema = cinemaId ? cinemas.find((item) => item.id === cinemaId) : null;

  useFocusEffect(
    useCallback(() => {
      setAvailabilityNow(new Date());
    }, []),
  );

  useEffect(() => {
    setAvailabilityNow(new Date());
  }, [cinemaId, id, showtimes]);

  const movieShowtimes = showtimes
    .filter(
      (item) =>
        item.movieId === movie?.id && (!selectedCinema || item.cinemaId === selectedCinema.id),
    )
    .sort((first, second) => getShowtimeSortTime(first) - getShowtimeSortTime(second));
  const availableMovieShowtimes = filterAvailableShowtimes(movieShowtimes, availabilityNow);
  const availableShowtimeById = new Map(
    availableMovieShowtimes.map((showtime) => [showtime.id, showtime]),
  );
  const showtimeGroups = filterAvailableBookingDates(movieShowtimes, availabilityNow)
    .map((dateGroup) => {
      const firstShowtime = dateGroup.showtimeIds
        .map((showtimeId) => availableShowtimeById.get(showtimeId))
        .find(Boolean);

      if (!firstShowtime) {
        return null;
      }

      const label = formatShowtimeDayLabel(firstShowtime.startTime);
      const { dateText, weekdayText } = splitDayLabel(label);

      return {
        key: dateGroup.key,
        label,
        dateText,
        weekdayText,
        showtimeIds: dateGroup.showtimeIds,
      };
    })
    .filter((group): group is ShowtimeDayGroup => Boolean(group));

  const firstDateKey = showtimeGroups[0]?.key ?? '';
  const selectedDateIsAvailable = showtimeGroups.some((group) => group.key === selectedDateKey);

  useEffect(() => {
    if (!firstDateKey) {
      if (selectedDateKey) {
        setSelectedDateKey('');
      }
      return;
    }

    if (!selectedDateIsAvailable) {
      setSelectedDateKey(firstDateKey);
    }
  }, [firstDateKey, selectedDateIsAvailable, selectedDateKey]);

  const activeDateKey = selectedDateIsAvailable ? selectedDateKey : firstDateKey;
  const activeDayGroup = showtimeGroups.find((group) => group.key === activeDateKey) ?? null;
  const activeShowtimeIds = new Set(activeDayGroup?.showtimeIds ?? []);
  const activeShowtimes = availableMovieShowtimes.filter((showtime) =>
    activeShowtimeIds.has(showtime.id),
  );
  const activeTimeWindowKeys = new Set(activeShowtimes.map((showtime) => getShowtimeWindow(showtime)));
  const availableTimeWindows =
    activeShowtimes.length === 0
      ? []
      : timeWindows.filter(
          (window) => window.key === 'all' || activeTimeWindowKeys.has(window.key),
        );
  const selectedTimeWindowIsAvailable = availableTimeWindows.some(
    (window) => window.key === selectedTimeWindow,
  );
  const effectiveTimeWindow = selectedTimeWindowIsAvailable ? selectedTimeWindow : 'all';
  const filteredShowtimes =
    effectiveTimeWindow === 'all'
      ? activeShowtimes
      : activeShowtimes.filter(
          (showtime) => getShowtimeWindow(showtime) === effectiveTimeWindow,
        );
  const cinemaShowtimeGroups: CinemaShowtimeGroup[] = [];

  filteredShowtimes.forEach((showtime) => {
    const cinema = cinemas.find((item) => item.id === showtime.cinemaId);

    if (!cinema) {
      return;
    }

    const existingGroup = cinemaShowtimeGroups.find((group) => group.cinemaId === cinema.id);

    if (existingGroup) {
      existingGroup.showtimes.push(showtime);
      return;
    }

    cinemaShowtimeGroups.push({
      cinemaId: cinema.id,
      cinemaBrand: cinema.brand,
      cinemaName: cinema.name,
      city: cinema.city,
      address: cinema.address,
      showtimes: [showtime],
    });
  });

  const activeCities = Array.from(
    new Set(cinemaShowtimeGroups.map((group) => group.city).filter(Boolean)),
  );
  const locationSummary = selectedCinema
    ? `${selectedCinema.brand} • ${formatLocationName(selectedCinema.name)}`
    : activeCities.length === 1
      ? activeCities[0]
      : activeCities.length > 1
        ? `${activeCities.length} khu vực`
        : 'Chưa có suất khả dụng';

  useEffect(() => {
    if (!selectedTimeWindowIsAvailable) {
      setSelectedTimeWindow('all');
    }
  }, [selectedTimeWindowIsAvailable]);

  return (
    <PageScroll tone="user">
      <Stack.Screen options={{ title: movie?.title ?? 'Chi tiết phim' }} />
      {!movie ? (
        <EmptyNotice
          tone="user"
          title="Không tìm thấy phim"
          description="Phim này không còn trong danh sách hiện tại. Hãy quay lại tab phim và chọn lại."
        />
      ) : (
        <>
          <HeroCard
            tone="user"
            eyebrow="Chọn phim và suất chiếu"
            title={movie.title}
            description={formatMovieDescription(movie.description)}>
            <View style={styles.heroBody}>
              <MoviePoster
                uri={movie.poster}
                title={movie.title}
                tone="user"
                width={compact ? 108 : 132}
                height={compact ? 154 : 188}
                borderRadius={22}
              />
              <View style={styles.heroCopy}>
                <View style={styles.heroMetaRail}>
                  <View
                    style={[
                      styles.heroPill,
                      { backgroundColor: colors.accentSoft, borderColor: colors.border },
                    ]}>
                    <Text style={[styles.heroPillText, { color: colors.text }]}>
                      {movie.rating}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.heroPill,
                      { backgroundColor: colors.accentSoft, borderColor: colors.border },
                    ]}>
                    <Text style={[styles.heroPillText, { color: colors.text }]}>
                      {movie.duration} phút
                    </Text>
                  </View>
                </View>
                <Text style={[styles.heroInfo, { color: colors.muted }]}>
                  {formatGenres(movie.genre)} • {formatLanguage(movie.language)}
                </Text>
                <Text style={[styles.heroInfo, { color: colors.muted }]}>
                  {formatFormats(movie.formats)}
                </Text>
                <Text style={[styles.heroFeaturedNote, { color: colors.text }]}>
                  {movie.featuredNote}
                </Text>
              </View>
            </View>
          </HeroCard>

          <SectionTitle
            tone="user"
            title="Chọn lịch chiếu"
            description="Chọn ngày trước, sau đó lọc theo khung giờ. Danh sách phía dưới chỉ hiển thị các suất thuộc đúng ngày đang active."
          />

          {showtimeGroups.length === 0 ? (
            <EmptyNotice
              tone="user"
              title="Không có suất chiếu khả dụng"
              description="Hiện chưa có suất chiếu khả dụng."
            />
          ) : (
            <SectionCard tone="user" style={styles.scheduleBoard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dateRail}>
                  {showtimeGroups.map((group) => {
                    const active = group.key === activeDateKey;

                    return (
                      <Pressable
                        key={group.key}
                        onPress={() => setSelectedDateKey(group.key)}
                        style={[
                          styles.dateCard,
                          {
                            backgroundColor: active ? colors.accent : colors.panel,
                            borderColor: active ? colors.accent : colors.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.dateCardDate,
                            { color: active ? '#FFFDF7' : colors.text },
                          ]}>
                          {group.dateText}
                        </Text>
                        <Text
                          style={[
                            styles.dateCardWeekday,
                            { color: active ? '#FFF7EA' : colors.muted },
                          ]}>
                          {group.weekdayText}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timeWindowRail}>
                  {availableTimeWindows.map((window) => {
                    const active = window.key === effectiveTimeWindow;

                    return (
                      <Pressable
                        key={window.key}
                        onPress={() => setSelectedTimeWindow(window.key)}
                        style={[
                          styles.timeWindowChip,
                          {
                            backgroundColor: active ? colors.accent : colors.panel,
                            borderColor: active ? colors.accent : colors.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.timeWindowText,
                            { color: active ? '#FFFDF7' : colors.text },
                          ]}>
                          {window.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={styles.locationRow}>
                <Text style={[styles.locationHeadline, { color: colors.text }]}>
                  {activeDayGroup
                    ? `Suất chiếu ngày ${activeDayGroup.dateText}`
                    : 'Suất chiếu theo ngày'}
                </Text>
                <View
                  style={[
                    styles.locationPill,
                    {
                      backgroundColor: colors.panel,
                      borderColor: colors.border,
                    },
                  ]}>
                  <Text style={[styles.locationPillText, { color: colors.accent }]}>
                    {locationSummary}
                  </Text>
                </View>
              </View>
            </SectionCard>
          )}

          {showtimeGroups.length > 0 && cinemaShowtimeGroups.length === 0 ? (
            <EmptyNotice
              tone="user"
              title="Không có suất trong bộ lọc này"
              description="Hãy đổi sang khung giờ khác hoặc chọn một ngày khác để xem thêm lịch chiếu."
            />
          ) : null}

          {cinemaShowtimeGroups.map((group) => (
            <SectionCard key={group.cinemaId} tone="user" style={styles.cinemaCard}>
              <View style={styles.cinemaHeader}>
                <View
                  style={[
                    styles.cinemaBadge,
                    { backgroundColor: colors.accentSoft, borderColor: colors.border },
                  ]}>
                  <Text style={[styles.cinemaBadgeText, { color: colors.accent }]}>
                    {group.cinemaBrand.slice(0, 4).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cinemaCopy}>
                  <Text style={[styles.cinemaTitle, { color: colors.text }]}>
                    {group.cinemaBrand} {formatLocationName(group.cinemaName)}
                  </Text>
                  <Text style={[styles.cinemaMeta, { color: colors.muted }]}>
                    {group.address}
                  </Text>
                  <Text style={[styles.cinemaMeta, { color: colors.muted }]}>
                    {group.showtimes.length} suất khả dụng • {group.city}
                  </Text>
                </View>
              </View>

              <View style={styles.showtimeGrid}>
                {group.showtimes.map((showtime) => {
                  const room = rooms.find((item) => item.id === showtime.roomId);
                  const availableSeats = showtime.seatStates.filter(
                    (seat) => seat.status === 'available',
                  ).length;
                  const totalSeats = room?.activeSeatCount ?? showtime.seatStates.length;

                  return (
                    <Pressable
                      key={showtime.id}
                      onPress={() =>
                        router.push({
                          pathname: '/booking/seats',
                          params: { showtimeId: showtime.id },
                        })
                      }
                      style={[
                        styles.showtimeSlot,
                        compact ? styles.showtimeSlotCompact : styles.showtimeSlotWide,
                        {
                          backgroundColor: colors.panel,
                          borderColor: colors.border,
                        },
                      ]}>
                      <View style={styles.showtimeSlotTop}>
                        <Text style={[styles.showtimeStart, { color: colors.text }]}>
                          {formatShowtimeTime(showtime.startTime)}
                        </Text>
                        <Text style={[styles.showtimeEnd, { color: colors.muted }]}>
                          ~{formatShowtimeTime(showtime.endTime)}
                        </Text>
                      </View>
                      <Text style={[styles.showtimeRoom, { color: colors.text }]}>
                        {room ? formatRoomName(room.name) : 'Phòng đang cập nhật'}
                      </Text>
                      <Text style={[styles.showtimeDetail, { color: colors.muted }]}>
                        {room ? formatRoomType(room.roomType) : 'Loại phòng đang cập nhật'}
                      </Text>
                      <Text style={[styles.showtimeDetail, { color: colors.muted }]}>
                        {formatShowtimeFormat(showtime.format)}
                      </Text>
                      <View
                        style={[
                          styles.seatAvailabilityPill,
                          {
                            backgroundColor: colors.accentSoft,
                          },
                        ]}>
                        <Text style={[styles.seatAvailabilityText, { color: colors.text }]}>
                          Còn {availableSeats}/{totalSeats} ghế
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </SectionCard>
          ))}
        </>
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  heroBody: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroMetaRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroPillText: {
    fontSize: 12,
    fontFamily: Fonts.sansBold,
  },
  heroInfo: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  heroFeaturedNote: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sansBold,
  },
  scheduleBoard: {
    gap: 14,
  },
  dateRail: {
    flexDirection: 'row',
    gap: 10,
  },
  dateCard: {
    width: 118,
    minHeight: 92,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 4,
  },
  dateCardDate: {
    fontSize: 24,
    fontFamily: Fonts.rounded,
  },
  dateCardWeekday: {
    fontSize: 15,
    fontFamily: Fonts.sansBold,
    textAlign: 'center',
  },
  timeWindowRail: {
    flexDirection: 'row',
    gap: 10,
  },
  timeWindowChip: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  timeWindowText: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  locationHeadline: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
  },
  locationPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  locationPillText: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
  },
  cinemaCard: {
    gap: 16,
  },
  cinemaHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  cinemaBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cinemaBadgeText: {
    fontSize: 15,
    fontFamily: Fonts.rounded,
  },
  cinemaCopy: {
    flex: 1,
    gap: 4,
  },
  cinemaTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: Fonts.rounded,
  },
  cinemaMeta: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  showtimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  showtimeSlot: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 5,
  },
  showtimeSlotWide: {
    width: '48%',
  },
  showtimeSlotCompact: {
    width: '100%',
  },
  showtimeSlotTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  showtimeStart: {
    fontSize: 28,
    lineHeight: 32,
    fontFamily: Fonts.rounded,
  },
  showtimeEnd: {
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  showtimeRoom: {
    fontSize: 15,
    fontFamily: Fonts.sansBold,
  },
  showtimeDetail: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  seatAvailabilityPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  seatAvailabilityText: {
    fontSize: 12,
    fontFamily: Fonts.sansBold,
  },
});
