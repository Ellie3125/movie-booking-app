/**
 * SPEC Disclosure - CinemasTabScreen:
 * 1. Autonomous Decisions:
 *    - Rebuilt the mobile Cinemas tab UI to match the provided "Chọn theo rạp" reference while keeping existing store/API/location data flow.
 *    - Added a local cinema-logo rail backed by bundled brand logo assets where available.
 *    - Added client-side search over the already loaded cinema list because the reference screen includes a search bar and this does not call new APIs.
 * 2. Deviations:
 *    - The "Tìm đường" and favorite controls are presented as visual affordances only; no map/favorite persistence logic was added.
 * 3. Trade-offs:
 *    - The screen now uses local layout primitives instead of the shared HeroCard/SectionCard wrappers to more closely match the supplied design.
 *    - BHD remains a neutral placeholder until a matching local logo asset is added.
 * 4. Context/Notes:
 *    - Backend, admin-web, and existing cinema fetch/sort/location logic are unchanged.
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { type Cinema, useAppStore } from '@/lib/app-store';
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

type CinemaWithDistance = Cinema & { distanceKm?: number };

const cinemaLogoSlides = [
  { key: 'suggested', label: 'Đề xuất', logoSource: undefined },
  { key: 'cgv', label: 'CGV', logoSource: require('../../../assets/images/CGV.png') },
  { key: 'lotte', label: 'Lotte', logoSource: require('../../../assets/images/Lotte Cinema.png') },
  { key: 'galaxy', label: 'Galaxy', logoSource: require('../../../assets/images/Galaxy Cinema.png') },
  { key: 'beta', label: 'Beta', logoSource: require('../../../assets/images/Beta Cinema.png') },
  { key: 'bhd', label: 'BHD', logoSource: undefined },
];

const cinemaBrandLogoSources = {
  cgv: require('../../../assets/images/CGV.png'),
  lotte: require('../../../assets/images/Lotte Cinema.png'),
  galaxy: require('../../../assets/images/Galaxy Cinema.png'),
  beta: require('../../../assets/images/Beta Cinema.png'),
};

const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
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
  const match = API_BASE_URL.match(/^(https?:\/\/[^/]+)/);
  const host = match ? match[1] : 'http://localhost:5000';
  return `${host}${path}`;
};

const getAreaLabel = (address: string, city: string) => {
  const formattedAddress = formatAddress(address);
  const parts = formattedAddress
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts[1] : formatCity(city);
};

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getCinemaBrandLogoSource = (brand?: string | null) => {
  const normalizedBrand = normalizeSearchText(brand ?? '');

  if (normalizedBrand.includes('cgv')) return cinemaBrandLogoSources.cgv;
  if (normalizedBrand.includes('lotte')) return cinemaBrandLogoSources.lotte;
  if (normalizedBrand.includes('galaxy')) return cinemaBrandLogoSources.galaxy;
  if (normalizedBrand.includes('beta')) return cinemaBrandLogoSources.beta;

  return undefined;
};

const formatCinemaTitle = (brandName: string, cinemaName: string) => {
  const displayName = formatLocationName(cinemaName);
  const normalizedBrand = normalizeSearchText(brandName);
  const normalizedName = normalizeSearchText(displayName);
  const primaryBrand = normalizedBrand.split(/\s+/).filter(Boolean)[0];

  return normalizedBrand &&
    (normalizedName.includes(normalizedBrand) ||
      (primaryBrand ? normalizedName.startsWith(primaryBrand) : false))
    ? displayName
    : `${brandName} ${displayName}`.trim();
};

export default function CinemasTabScreen() {
  const { cinemas, rooms, showtimes, brands, refreshData } = useAppStore();

  const [locationState, setLocationState] = useState<LocationState>({ phase: 'idle' });
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

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
    await Promise.all([refreshData(), fetchLocation(false)]);
    setRefreshing(false);
  };

  const isLoading = locationState.phase === 'loading';

  const sortedCinemas = useMemo<CinemaWithDistance[]>(() => {
    if (locationState.phase !== 'granted') {
      return cinemas.map((cinema) => ({
        ...cinema,
        distanceKm: undefined,
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
          distanceKm = Math.round(dist * 10) / 10;
        }
      }

      return {
        ...cinema,
        distanceKm,
      };
    });

    return mapped.sort((a, b) => {
      if (a.distanceKm === undefined && b.distanceKm === undefined) return 0;
      if (a.distanceKm === undefined) return 1;
      if (b.distanceKm === undefined) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [cinemas, locationState]);

  const nearbyFeaturedCinemas = useMemo(() => {
    if (locationState.phase !== 'granted') return [];
    return sortedCinemas.filter((cinema) => cinema.distanceKm !== undefined).slice(0, 3);
  }, [locationState, sortedCinemas]);

  const nearbyCinemaIds = useMemo(
    () => new Set(nearbyFeaturedCinemas.map((cinema) => cinema.id)),
    [nearbyFeaturedCinemas],
  );

  const filteredCinemas = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim());

    if (!normalizedQuery) {
      return sortedCinemas;
    }

    return sortedCinemas.filter((cinema) => {
      const brandInfo = brands.find(
        (brand) => brand.code.toLowerCase() === cinema.brand.toLowerCase(),
      );
      const searchable = [
        cinema.brand,
        brandInfo?.name,
        formatLocationName(cinema.name),
        formatCity(cinema.city),
        formatAddress(cinema.address),
      ]
        .join(' ')
        .toLowerCase();

      return normalizeSearchText(searchable).includes(normalizedQuery);
    });
  }, [brands, query, sortedCinemas]);

  const selectedCity = useMemo(() => {
    const firstHaNoiCinema = cinemas.find((cinema) => cinema.city === 'Ha Noi');
    return formatCity(firstHaNoiCinema?.city ?? cinemas[0]?.city ?? 'Ha Noi');
  }, [cinemas]);

  const listTitle = query.trim() ? 'Kết quả rạp' : 'Rạp đề xuất';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#153F73']}
            tintColor="#153F73"
          />
        }>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.roundButton, pressed ? styles.buttonPressed : null]}>
            <MaterialCommunityIcons name="arrow-left" size={30} color="#1C2734" />
          </Pressable>

          <Text style={styles.headerTitle}>Chọn theo rạp</Text>

          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Hỗ trợ"
              onPress={() => router.push('/profile/support')}
              style={({ pressed }) => [
                styles.segmentButton,
                pressed ? styles.buttonPressed : null,
              ]}>
              <MaterialCommunityIcons name="headset" size={27} color="#1C2734" />
            </Pressable>
            <View style={styles.segmentDivider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Về trang chọn phim"
              onPress={() => router.push('/(user)/(tabs)/home')}
              style={({ pressed }) => [
                styles.segmentButton,
                pressed ? styles.buttonPressed : null,
              ]}>
              <MaterialCommunityIcons name="home-outline" size={29} color="#1C2734" />
            </Pressable>
          </View>
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={35} color="#7E858C" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm rạp phim..."
            placeholderTextColor="#777B80"
            returnKeyType="search"
            style={styles.searchInput}
          />
          <MaterialCommunityIcons name="microphone-outline" size={32} color="#777B80" />
        </View>

        <View style={styles.logoRailShell}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.logoRail}>
            {cinemaLogoSlides.map((item, index) => {
              const isSuggested = item.key === 'suggested';

              return (
                <View key={item.key} style={styles.logoItem}>
                  <View
                    style={[
                      styles.logoTile,
                      isSuggested ? styles.logoTileActive : null,
                    ]}>
                    {item.logoSource ? (
                      <Image source={item.logoSource} style={styles.logoImage} contentFit="contain" />
                    ) : isSuggested ? (
                      <View style={styles.suggestedLogo}>
                        <MaterialCommunityIcons name="star" size={42} color="#FFD25A" />
                        <View style={styles.suggestedSpark} />
                      </View>
                    ) : (
                      <View style={styles.emptyLogoPlaceholder} />
                    )}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.logoLabel, index === 0 ? styles.logoLabelActive : null]}>
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.statusBanner}>
            <ActivityIndicator size="small" color="#153F73" />
            <Text style={styles.statusText}>Đang xác định vị trí GPS của bạn...</Text>
          </View>
        ) : null}

        {locationState.phase === 'denied' ? (
          <View style={styles.statusBanner}>
            <MaterialCommunityIcons name="map-marker-off-outline" size={21} color="#153F73" />
            <Text style={styles.statusText}>
              Bạn đã tắt quyền vị trí. Bật GPS để tự động sắp xếp rạp gần bạn.
            </Text>
            <Pressable onPress={() => fetchLocation(true)} style={styles.statusAction}>
              <Text style={styles.statusActionText}>Bật GPS</Text>
            </Pressable>
          </View>
        ) : null}

        {locationState.phase === 'error' ? (
          <View style={styles.statusBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={21} color="#153F73" />
            <Text style={styles.statusText}>
              {locationState.message}. Hiển thị danh sách rạp mặc định.
            </Text>
            <Pressable onPress={() => fetchLocation(true)} style={styles.statusAction}>
              <Text style={styles.statusActionText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {listTitle} ({filteredCinemas.length})
          </Text>
          <View style={styles.cityPill}>
            <MaterialCommunityIcons name="map-marker-outline" size={22} color="#143A6C" />
            <Text style={styles.cityText}>{selectedCity}</Text>
          </View>
        </View>

        <View style={styles.cinemaList}>
          {filteredCinemas.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Không tìm thấy rạp</Text>
              <Text style={styles.emptyText}>
                Thử tìm theo tên rạp, thương hiệu, thành phố hoặc địa chỉ.
              </Text>
            </View>
          ) : (
            filteredCinemas.map((cinema, index) => {
              const cinemaId = String(cinema.id);
              const roomCount = rooms.filter((room) => room.cinemaId === cinemaId).length;
              const showtimeCount = showtimes.filter(
                (showtime) => showtime.cinemaId === cinemaId,
              ).length;
              const brandInfo = brands.find(
                (brand) => brand.code.toLowerCase() === cinema.brand.toLowerCase(),
              );
              const brandName = brandInfo?.name || cinema.brand;
              const logoUrl = buildImageUrl(cinema.imageUrl || brandInfo?.logo);
              const localLogoSource = getCinemaBrandLogoSource(cinema.brand);
              const cinemaTitle = formatCinemaTitle(brandName, cinema.name);
              const areaLabel = getAreaLabel(cinema.address, cinema.city);
              const hasDistance = cinema.distanceKm !== undefined;
              const isNearbyCinema = nearbyCinemaIds.has(cinema.id);
              const featureCopy = formatCinemaFeatures(cinema.features);
              const badgeLabel = isNearbyCinema
                ? 'Bạn ở gần rạp này'
                : index < 2
                  ? 'Rạp mới'
                  : featureCopy || `${roomCount} phòng chiếu`;

              return (
                <Pressable
                  key={cinemaId}
                  accessibilityRole="button"
                  accessibilityLabel={`Xem chi tiết ${cinemaTitle}`}
                  onPress={() => router.push(`/cinemas/${cinemaId}`)}
                  style={({ pressed }) => [
                    styles.cinemaCard,
                    pressed ? styles.cinemaCardPressed : null,
                  ]}>
                  {index < 2 ? (
                    <View style={styles.ribbon}>
                      <Text style={styles.ribbonText}>New</Text>
                    </View>
                  ) : null}

                  <View style={styles.cardMainRow}>
                    <View style={styles.cinemaLogoBox}>
                      {logoUrl ? (
                        <Image source={{ uri: logoUrl }} style={styles.cinemaLogo} contentFit="contain" />
                      ) : localLogoSource ? (
                        <Image source={localLogoSource} style={styles.cinemaLogo} contentFit="contain" />
                      ) : (
                        <View style={styles.cinemaLogoPlaceholder} />
                      )}
                    </View>

                    <View style={styles.cinemaInfo}>
                      <Text numberOfLines={1} style={styles.cinemaName}>
                        {cinemaTitle}
                      </Text>
                      <Text numberOfLines={1} style={styles.cinemaMeta}>
                        {areaLabel}
                        {hasDistance ? ` • ${cinema.distanceKm} km` : ''}
                      </Text>
                      <View style={styles.badge}>
                        <Text numberOfLines={2} style={styles.badgeText}>
                          {badgeLabel}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <View style={styles.favoriteButton}>
                        <MaterialCommunityIcons name="heart-outline" size={28} color="#222833" />
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={34} color="#222833" />
                    </View>
                  </View>

                  <View style={styles.addressRow}>
                    <Text numberOfLines={1} style={styles.addressText}>
                      {formatAddress(cinema.address)}
                    </Text>
                    <Text style={styles.directionText}>Tìm đường</Text>
                  </View>

                  <Text style={styles.showtimeMeta}>
                    {roomCount} phòng chiếu • {showtimeCount} suất chiếu • Hotline {cinema.hotline}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D8EEFF',
  },
  content: {
    paddingTop: 14,
    paddingBottom: 112,
  },
  headerRow: {
    minHeight: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  roundButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#18202A',
    fontSize: 31,
    lineHeight: 38,
    fontFamily: Fonts.rounded,
  },
  headerActions: {
    height: 54,
    borderRadius: 28,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  segmentButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentDivider: {
    width: 1.5,
    height: 28,
    backgroundColor: '#1D2731',
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.82,
  },
  searchBox: {
    minHeight: 74,
    marginTop: 8,
    marginHorizontal: 20,
    borderRadius: 37,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#86A7C3',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    minHeight: 58,
    color: '#1D2731',
    fontSize: 24,
    fontFamily: Fonts.sansMedium,
  },
  logoRailShell: {
    marginTop: 30,
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    shadowColor: '#86A7C3',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  logoRail: {
    gap: 28,
    paddingHorizontal: 22,
  },
  logoItem: {
    width: 118,
    alignItems: 'center',
    gap: 9,
  },
  logoTile: {
    width: 94,
    height: 94,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#D8D8D8',
    backgroundColor: '#CFCFCF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoTileActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#143A6C',
  },
  logoImage: {
    width: 82,
    height: 82,
  },
  suggestedLogo: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#113A78',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedSpark: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE79A',
  },
  emptyLogoPlaceholder: {
    width: 78,
    height: 78,
    borderRadius: 15,
    backgroundColor: '#C9C9C9',
  },
  logoLabel: {
    maxWidth: 118,
    color: '#1D1F24',
    fontSize: 21,
    lineHeight: 25,
    fontFamily: Fonts.sansBold,
    textAlign: 'center',
  },
  logoLabelActive: {
    color: '#173A70',
  },
  statusBanner: {
    marginTop: 18,
    marginHorizontal: 20,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  statusText: {
    flex: 1,
    color: '#294966',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansMedium,
  },
  statusAction: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#153F73',
  },
  statusActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.sansBold,
  },
  listHeader: {
    marginTop: 31,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  listTitle: {
    flex: 1,
    color: '#1C2028',
    fontSize: 30,
    lineHeight: 36,
    fontFamily: Fonts.rounded,
  },
  cityPill: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#143A6C',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  cityText: {
    color: '#143A6C',
    fontSize: 21,
    fontFamily: Fonts.sansBold,
  },
  cinemaList: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
  },
  cinemaCard: {
    minHeight: 174,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE4EA',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  cinemaCardPressed: {
    backgroundColor: '#F5FAFF',
  },
  ribbon: {
    position: 'absolute',
    top: 0,
    left: -31,
    width: 112,
    height: 28,
    backgroundColor: '#123E78',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-34deg' }],
  },
  ribbonText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 16,
    fontFamily: Fonts.sansBold,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cinemaLogoBox: {
    width: 76,
    height: 76,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#D6D6D6',
    backgroundColor: '#CBCBCB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cinemaLogo: {
    width: 62,
    height: 62,
  },
  cinemaLogoPlaceholder: {
    width: 66,
    height: 66,
    borderRadius: 12,
    backgroundColor: '#C8C8C8',
  },
  cinemaInfo: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  cinemaName: {
    color: '#202124',
    fontSize: 24,
    lineHeight: 30,
    fontFamily: Fonts.sansBold,
  },
  cinemaMeta: {
    color: '#22252A',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.sansMedium,
  },
  badge: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#CFE8FF',
  },
  badgeText: {
    color: '#24436F',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: Fonts.sansBold,
  },
  cardActions: {
    minWidth: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  favoriteButton: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DFDFDF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addressRow: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  addressText: {
    flex: 1,
    color: '#25272D',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.sansMedium,
  },
  directionText: {
    color: '#173A70',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.sansBold,
  },
  showtimeMeta: {
    marginTop: 6,
    color: '#728091',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansBold,
  },
  emptyState: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#F3F8FE',
    gap: 6,
  },
  emptyTitle: {
    color: '#1C2028',
    fontSize: 18,
    fontFamily: Fonts.sansBold,
  },
  emptyText: {
    color: '#5D6977',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
});
