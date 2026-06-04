import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader, SectionHeader, StateNotice } from '@/components/booking/common';
import {
  CinemaBrandFilter,
  CinemaCard,
  DateSelector,
  TimeFilterChips,
} from '@/components/booking/showtimes';
import { AzureColors, AzureRadius, AzureShadow, Fonts } from '@/constants/theme';
import { useAppStore } from '@/lib/app-store';
import {
  buildShowtimeSelectionViewModel,
  type TimeRangeKey,
} from '@/lib/booking-view-models';
import { formatGenres, formatLanguage } from '@/lib/user-display';

export default function MovieShowtimeSelectionScreen() {
  const { id, cinemaId } = useLocalSearchParams<{ id?: string; cinemaId?: string }>();
  const { movies, showtimes, cinemas, rooms, brands } = useAppStore();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeKey>('all');
  const [selectedCinemaChain, setSelectedCinemaChain] = useState('all');
  const [expandedCinemaId, setExpandedCinemaId] = useState('');
  const [availabilityNow, setAvailabilityNow] = useState(() => new Date());

  useEffect(() => {
    setAvailabilityNow(new Date());
  }, [id, cinemaId, showtimes]);

  const viewModel = useMemo(
    () =>
      buildShowtimeSelectionViewModel({
        movieId: id,
        cinemaId,
        movies,
        cinemas,
        rooms,
        showtimes,
        brands,
        selectedDate,
        selectedTimeRange,
        selectedCinemaChain,
        expandedCinemaId,
        now: availabilityNow,
      }),
    [
      availabilityNow,
      brands,
      cinemaId,
      cinemas,
      expandedCinemaId,
      id,
      movies,
      rooms,
      selectedCinemaChain,
      selectedDate,
      selectedTimeRange,
      showtimes,
    ],
  );

  useEffect(() => {
    if (viewModel.activeDateKey && selectedDate !== viewModel.activeDateKey) {
      setSelectedDate(viewModel.activeDateKey);
    }
  }, [selectedDate, viewModel.activeDateKey]);

  useEffect(() => {
    if (selectedTimeRange !== viewModel.activeTimeRange) {
      setSelectedTimeRange(viewModel.activeTimeRange);
    }
  }, [selectedTimeRange, viewModel.activeTimeRange]);

  const handleToggleCinema = (nextCinemaId: string) => {
    setExpandedCinemaId((current) => (current === nextCinemaId ? '' : nextCinemaId));
  };

  const handlePressShowtime = (showtimeId: string) => {
    router.push({
      pathname: '/booking/seats',
      params: { showtimeId },
    });
  };

  const movie = viewModel.movie;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <AppHeader
          title={movie?.title ?? 'Chọn suất chiếu'}
          subtitle={movie ? `${movie.duration} phút • ${formatLanguage(movie.language)}` : undefined}
          onBack={() => router.back()}
          onSupport={() => router.push('/profile/support')}
          onHome={() => router.push('/(user)/(tabs)/home')}
        />

        {!movie ? (
          <StateNotice
            title="Không tìm thấy phim"
            description="Phim này không còn trong danh sách hiện tại. Hãy quay lại tab phim và chọn lại."
          />
        ) : (
          <>
            <View style={styles.movieContext}>
              <View style={styles.ageBadge}>
                <Text style={styles.ageBadgeText}>{movie.rating}</Text>
              </View>
              <View style={styles.movieContextCopy}>
                <Text numberOfLines={2} style={styles.movieTitle}>
                  {movie.title}
                </Text>
                <Text numberOfLines={2} style={styles.movieMeta}>
                  {formatGenres(movie.genre)} • {movie.formats.join(' • ')}
                </Text>
              </View>
            </View>

            <View style={styles.filterPanel}>
              <SectionHeader title="Chọn lịch chiếu" meta="Ngày, khung giờ và cụm rạp" />

              {viewModel.dateOptions.length === 0 ? (
                <StateNotice
                  title="Chưa có suất chiếu khả dụng"
                  description="Hiện chưa có suất chiếu trong tương lai cho phim này."
                />
              ) : (
                <>
                  <DateSelector
                    options={viewModel.dateOptions}
                    onSelectDate={setSelectedDate}
                  />
                  <TimeFilterChips
                    options={viewModel.timeFilters}
                    onSelectTimeRange={setSelectedTimeRange}
                  />
                  <CinemaBrandFilter
                    options={viewModel.brandFilters}
                    onSelectBrand={setSelectedCinemaChain}
                  />
                  <View style={styles.locationChip}>
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={19}
                      color={AzureColors.primary}
                    />
                    <Text numberOfLines={1} style={styles.locationText}>
                      {viewModel.locationLabel}
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.cinemaListHeader}>
              <SectionHeader
                title="Chọn rạp và suất"
                meta={`${viewModel.cinemaCards.length} rạp phù hợp bộ lọc`}
              />
            </View>

            <View style={styles.cinemaList}>
              {viewModel.cinemaCards.length === 0 ? (
                <StateNotice
                  title="Không có suất trong bộ lọc này"
                  description="Hãy đổi ngày, khung giờ hoặc cụm rạp để xem thêm suất chiếu."
                />
              ) : (
                viewModel.cinemaCards.map((cinema) => (
                  <CinemaCard
                    key={cinema.cinemaId}
                    cinema={cinema}
                    onToggle={handleToggleCinema}
                    onPressShowtime={handlePressShowtime}
                  />
                ))
              )}
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AzureColors.appBackground,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    gap: 18,
  },
  movieContext: {
    borderWidth: 1,
    borderColor: AzureColors.border,
    borderRadius: AzureRadius.xl,
    backgroundColor: AzureColors.surface,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...AzureShadow.card,
  },
  ageBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AzureColors.danger,
  },
  ageBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  movieContextCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  movieTitle: {
    color: AzureColors.textPrimary,
    fontSize: 18,
    lineHeight: 23,
    fontFamily: Fonts.sansBold,
  },
  movieMeta: {
    color: AzureColors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansMedium,
  },
  filterPanel: {
    borderWidth: 1,
    borderColor: AzureColors.border,
    borderRadius: AzureRadius.xl,
    backgroundColor: AzureColors.surface,
    padding: 16,
    gap: 14,
    ...AzureShadow.card,
  },
  locationChip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: 40,
    borderRadius: AzureRadius.round,
    borderWidth: 1,
    borderColor: AzureColors.border,
    backgroundColor: AzureColors.primaryLight,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  locationText: {
    color: AzureColors.primary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansBold,
  },
  cinemaListHeader: {
    marginTop: 4,
  },
  cinemaList: {
    gap: 14,
  },
  bottomSpacer: {
    height: 86,
  },
});
