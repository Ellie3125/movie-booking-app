/**
 * SPEC Disclosure - CinemasTabScreen:
 * 1. Autonomous Decisions:
 *    - Tự động triển khai công thức tính khoảng cách Haversine trực tiếp ở frontend thay vì chỉ phụ thuộc vào API `/cinemas/nearby`
 *      để có thể tính khoảng cách và sắp xếp cho TOÀN BỘ danh sách rạp trong store thay vì giới hạn 5 rạp.
 *    - Tách biệt UI thành 2 phần rõ rệt khi có GPS: "Rạp gần bạn nhất" (top 3 rạp) và "Tất cả rạp đang hoạt động" (được sắp xếp
 *      theo khoảng cách từ gần đến xa), tăng tính trực quan.
 *    - Bổ sung nút "Bật định vị GPS" hoặc "Thử lại" khi quyền GPS bị từ chối hoặc gặp lỗi.
 * 2. Deviations:
 *    - Không sử dụng API `fetchNearbyCinemas` nữa do API này bị giới hạn số lượng trả về (chỉ 5 rạp) và định dạng trả về ở backend
 *      khác biệt, thay vào đó tính toán trực tiếp trên danh sách rạp của store giúp trải nghiệm đồng bộ và chính xác hơn.
 * 3. Trade-offs:
 *    - Việc tính khoảng cách ở frontend tiêu tốn thêm một ít CPU (tính toán toán học cơ bản) khi danh sách rạp rất lớn.
 *      Tuy nhiên với số lượng rạp chiếu phim thông thường (vài chục đến vài trăm), hiệu năng là cực kỳ tốt và không gây giật lag.
 * 4. Context/Notes:
 *    - Sử dụng RefreshControl từ react-native để tích hợp Pull-to-refresh hoàn chỉnh.
 */

import { useEffect, useState, useMemo } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View, RefreshControl, Pressable } from 'react-native';
import { Image } from 'expo-image';

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
import { API_BASE_URL } from '@/lib/backend-api';
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
  | { phase: 'granted'; latitude: number; longitude: number }
  | { phase: 'denied' }
  | { phase: 'error'; message: string };

// Công thức Haversine để tính khoảng cách địa lý giữa 2 điểm toạ độ
const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Bán kính Trái Đất tính bằng km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const buildImageUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const match = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
  const host = match ? match[1] : 'http://localhost:5000';
  return `${host}${path}`;
};

export default function CinemasTabScreen() {
  const { cinemas, rooms, showtimes, brands, refreshData } = useAppStore();
  const colors = getTonePalette('user');

  const [locationState, setLocationState] = useState<LocationState>({ phase: 'idle' });
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocation = async (showLoading = true) => {
    if (showLoading) {
      setLocationState({ phase: 'loading' });
    }

    const locationResult = await getCurrentLocation();

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
    setLocationState({
      phase: 'granted',
      latitude: locationResult.latitude,
      longitude: locationResult.longitude,
    });
  };

  useEffect(() => {
    fetchLocation(true);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshData(),
      fetchLocation(false),
    ]);
    setRefreshing(false);
  };

  const isNearby = locationState.phase === 'granted';
  const isLoading = locationState.phase === 'loading';

  // Tính khoảng cách cho toàn bộ rạp và sắp xếp theo khoảng cách gần nhất
  const sortedCinemas = useMemo(() => {
    if (locationState.phase !== 'granted') {
      return cinemas.map((cinema) => ({
        ...cinema,
        distanceKm: undefined as number | undefined,
      }));
    }

    const { latitude: userLat, longitude: userLng } = locationState;

    const mapped = cinemas.map((cinema) => {
      let distanceKm: number | undefined = undefined;

      if (
        cinema.location &&
        Array.isArray(cinema.location.coordinates) &&
        cinema.location.coordinates.length === 2
      ) {
        const [cinemaLng, cinemaLat] = cinema.location.coordinates;
        if (typeof cinemaLat === 'number' && typeof cinemaLng === 'number') {
          const dist = calcDistance(userLat, userLng, cinemaLat, cinemaLng);
          distanceKm = Math.round(dist * 10) / 10; // làm tròn 1 chữ số thập phân
        }
      }

      return {
        ...cinema,
        distanceKm,
      };
    });

    // Sắp xếp: có khoảng cách xếp lên trước và tăng dần, không có toạ độ đẩy xuống cuối
    return mapped.sort((a, b) => {
      if (a.distanceKm === undefined && b.distanceKm === undefined) return 0;
      if (a.distanceKm === undefined) return 1;
      if (b.distanceKm === undefined) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [cinemas, locationState]);

  // Lấy ra tối đa 3 rạp gần nhất làm tiêu điểm hiển thị
  const nearbyFeaturedCinemas = useMemo(() => {
    if (locationState.phase !== 'granted') return [];
    return sortedCinemas.filter((c) => c.distanceKm !== undefined).slice(0, 3);
  }, [sortedCinemas, locationState]);

  return (
    <PageScroll
      tone="user"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }>
      <HeroCard
        tone="user"
        eyebrow="Khám phá rạp"
        title="Tìm rạp chiếu phim phù hợp nhất với bạn.">
        <View style={styles.metrics}>
          <MetricTile tone="user" value={String(cinemas.length)} label="Chi nhánh" />
          <MetricTile tone="user" value={String(rooms.length)} label="Phòng chiếu" />
        </View>
      </HeroCard>

      {/* Location status banners */}
      {isLoading && (
        <SectionCard tone="user">
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.statusText, { color: colors.muted }]}>
              Đang xác định vị trí GPS của bạn...
            </Text>
          </View>
        </SectionCard>
      )}

      {locationState.phase === 'denied' && (
        <SectionCard tone="user">
          <View style={styles.statusCol}>
            <Text style={[styles.statusText, { color: colors.muted }]}>
              📍 Bạn đã tắt quyền vị trí. Hãy bật GPS để tự động tìm rạp gần bạn nhất.
            </Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.accent }]}
              onPress={() => fetchLocation(true)}>
              <Text style={styles.retryButtonText}>Kích hoạt GPS</Text>
            </Pressable>
          </View>
        </SectionCard>
      )}

      {locationState.phase === 'error' && (
        <SectionCard tone="user">
          <View style={styles.statusCol}>
            <Text style={[styles.statusText, { color: colors.muted }]}>
              ⚠️ {locationState.message}. Hiển thị danh sách rạp mặc định.
            </Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.accent }]}
              onPress={() => fetchLocation(true)}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </Pressable>
          </View>
        </SectionCard>
      )}

      {/* Nearby featured cinemas (GPS granted) */}
      {isNearby && nearbyFeaturedCinemas.length > 0 && (
        <>
          <SectionTitle tone="user" title="Rạp gần bạn nhất" description="Các rạp chiếu phim có khoảng cách địa lý ngắn nhất" />
          {nearbyFeaturedCinemas.map((cinema) => {
            const cinemaId = String(cinema.id);
            const roomCount = rooms.filter((room) => room.cinemaId === cinemaId).length;
            const showtimeCount = showtimes.filter(
              (showtime) => showtime.cinemaId === cinemaId,
            ).length;
            const brandInfo = brands.find(
              (b) => b.code.toLowerCase() === cinema.brand.toLowerCase(),
            );
            const logoUrl = buildImageUrl(cinema.imageUrl || brandInfo?.logo);

            return (
              <SectionCard key={`nearby-${cinemaId}`} tone="user" style={styles.featuredCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.cinemaHeader}>
                    <View style={styles.brandLogoContainer}>
                      {logoUrl ? (
                        <Image source={{ uri: logoUrl }} style={styles.brandLogo} contentFit="contain" />
                      ) : (
                        <Text style={[styles.brandTextPlaceholder, { color: colors.muted }]}>
                          {cinema.brand.substring(0, 3)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.flex}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {formatLocationName(cinema.name)}
                      </Text>
                      <Text style={[styles.cardCopy, { color: colors.muted }]}>
                        {formatAddress(cinema.address)}
                      </Text>
                      <Text style={[styles.cardCopy, { color: colors.muted }]}>
                        {formatCity(cinema.city)}
                      </Text>
                      <View style={[styles.distanceBadge, { backgroundColor: colors.accentSoft }]}>
                        <Text style={[styles.distanceText, { color: colors.accent }]}>
                          📍 Cách đây {cinema.distanceKm} km
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Link
                    href={`/cinemas/${cinemaId}`}
                    style={[styles.link, { color: colors.accent }]}>
                    Xem lịch
                  </Link>
                </View>
                <View style={styles.divider} />
                <Text style={[styles.inlineMeta, { color: colors.muted }]}>
                  {roomCount} phòng chiếu • {showtimeCount} suất chiếu hôm nay
                </Text>
              </SectionCard>
            );
          })}
        </>
      )}

      {/* List of all cinemas */}
      {!isLoading && (
        <>
          <SectionTitle
            tone="user"
            title="Tất cả các rạp"
            description={isNearby ? "Danh sách rạp chiếu phim được sắp xếp theo khoảng cách" : "Danh sách tất cả các chi nhánh trên hệ thống"}
          />
          {sortedCinemas.length === 0 ? (
            <SectionCard tone="user">
              <Text style={[styles.cardCopy, { color: colors.muted, textAlign: 'center' }]}>
                Không có dữ liệu rạp chiếu phim. Kéo xuống để tải lại.
              </Text>
            </SectionCard>
          ) : (
            sortedCinemas.map((cinema) => {
              const cinemaId = String(cinema.id);
              const roomCount = rooms.filter((room) => room.cinemaId === cinemaId).length;
              const showtimeCount = showtimes.filter(
                (showtime) => showtime.cinemaId === cinemaId,
              ).length;
              const brandInfo = brands.find(
                (b) => b.code.toLowerCase() === cinema.brand.toLowerCase(),
              );
              const logoUrl = buildImageUrl(cinema.imageUrl || brandInfo?.logo);

              return (
                <SectionCard key={`all-${cinemaId}`} tone="user">
                  <View style={styles.rowBetween}>
                    <View style={styles.cinemaHeader}>
                      <View style={styles.brandLogoContainer}>
                        {logoUrl ? (
                          <Image source={{ uri: logoUrl }} style={styles.brandLogo} contentFit="contain" />
                        ) : (
                          <Text style={[styles.brandTextPlaceholder, { color: colors.muted }]}>
                            {cinema.brand.substring(0, 3)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.flex}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>
                          {formatLocationName(cinema.name)}
                        </Text>
                        <Text style={[styles.cardCopy, { color: colors.muted }]}>
                          {formatAddress(cinema.address)}
                        </Text>
                        <Text style={[styles.cardCopy, { color: colors.muted }]}>
                          {formatCity(cinema.city)}
                        </Text>
                        {cinema.distanceKm !== undefined && (
                          <Text style={[styles.distanceTextInline, { color: colors.accent }]}>
                            📍 {cinema.distanceKm} km
                          </Text>
                        )}
                      </View>
                    </View>
                    <Link
                      href={`/cinemas/${cinemaId}`}
                      style={[styles.link, { color: colors.accent }]}>
                      Xem lịch
                    </Link>
                  </View>
                  <View style={styles.divider} />
                  <Text style={[styles.inlineMeta, { color: colors.muted }]}>
                    {roomCount} phòng chiếu • {showtimeCount} suất chiếu
                  </Text>
                </SectionCard>
              );
            })
          )}
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
  statusCol: {
    gap: 10,
    alignItems: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: Fonts.sansBold,
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
  featuredCard: {
    borderWidth: 1.5,
    borderColor: 'rgba(245, 130, 32, 0.35)', // viền nổi bật cho rạp gần nhất
  },
  distanceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  distanceText: {
    fontSize: 12,
    fontFamily: Fonts.sansBold,
  },
  distanceTextInline: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(188, 132, 82, 0.12)',
    marginVertical: 10,
  },
  inlineMeta: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  link: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
    alignSelf: 'center',
  },
  cinemaHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  brandLogoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFDF7',
    borderWidth: 1,
    borderColor: 'rgba(188, 132, 82, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogo: {
    width: 36,
    height: 36,
  },
  brandTextPlaceholder: {
    fontSize: 12,
    fontFamily: Fonts.sansBold,
    textTransform: 'uppercase',
  },
});
