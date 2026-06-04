import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { SearchBar, StateNotice } from '@/components/booking/common';
import { BannerCarousel, MovieCarousel } from '@/components/booking/movies';
import { AzureColors, Fonts } from '@/constants/theme';
import { type Movie, useAppStore } from '@/lib/app-store';
import { API_BASE_URL } from '@/lib/backend-api';
import { buildMovieHomeViewModel } from '@/lib/booking-view-models';
import { normalizePosterUrl } from '@/lib/image-url';

const getPosterUrl = (movie: Movie) =>
  normalizePosterUrl(movie.poster, { backendApiBaseUrl: API_BASE_URL }) || movie.poster;

export default function HomeMoviesTabScreen() {
  const { movies, draftCheckout } = useAppStore();
  const [query, setQuery] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  // Thường xuyên kiểm tra xem draftCheckout đã hết hạn chưa
  useEffect(() => {
    if (!draftCheckout) {
      setIsExpired(true);
      return;
    }
    
    const checkExpiry = () => {
      const expired = new Date(draftCheckout.heldUntil).getTime() <= Date.now();
      setIsExpired(expired);
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [draftCheckout]);

  const showReminder = draftCheckout && !isExpired;

  const viewModel = useMemo(
    () =>
      buildMovieHomeViewModel(
        movies.map((movie) => ({
          ...movie,
          poster: getPosterUrl(movie),
        })),
        query,
      ),
    [movies, query],
  );

  const handlePressMovie = (movieId: string) => {
    router.push({
      pathname: '/movies/[id]',
      params: { id: movieId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm phim, thể loại, định dạng..."
        />

        {showReminder && (
          <Pressable
            onPress={() => router.push('/booking/checkout')}
            style={styles.reminderBanner}>
            <View style={styles.reminderLeft}>
              <MaterialCommunityIcons name="credit-card-clock" size={24} color="#FFF" />
              <View style={styles.reminderTextWrap}>
                <Text style={styles.reminderTitle}>Giao dịch chờ thanh toán!</Text>
                <Text style={styles.reminderSubtitle}>Bạn có ghế đang được giữ. Nhấn để tiếp tục thanh toán.</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
          </Pressable>
        )}

        {movies.length === 0 ? (
          <StateNotice
            title="Chưa có dữ liệu phim"
            description="Ứng dụng sẽ hiển thị phim từ backend hoặc dữ liệu catalog local khi có sẵn."
          />
        ) : (
          <>
            <BannerCarousel items={viewModel.banners} onPressMovie={handlePressMovie} />

            <MovieCarousel
              title="Chọn phim"
              meta={`${viewModel.filtered.length} phim khả dụng`}
              movies={viewModel.featured}
              onPressMovie={handlePressMovie}
            />

            <MovieCarousel
              title="Đang chiếu"
              meta="Danh sách phim có thể đặt vé ngay"
              movies={viewModel.nowShowing}
              onPressMovie={handlePressMovie}
              compact
            />
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
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 24,
  },
  bottomSpacer: {
    height: 92,
  },
  reminderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D97706', // màu cam ấm áp
    borderRadius: 12,
    padding: 14,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reminderTextWrap: {
    flex: 1,
  },
  reminderTitle: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: Fonts.sansBold,
  },
  reminderSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontFamily: Fonts.sansMedium,
    marginTop: 2,
  },
});
