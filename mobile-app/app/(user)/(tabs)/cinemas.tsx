import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

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
  formatAddress,
  formatCinemaFeatures,
  formatCity,
  formatLocationName,
} from '@/lib/user-display';

export default function CinemasTabScreen() {
  const { cinemas, rooms, showtimes } = useAppStore();
  const colors = getTonePalette('user');

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

      <SectionTitle tone="user" title="Rạp đang hoạt động" />
      {cinemas.map((cinema) => {
        const roomCount = rooms.filter((room) => room.cinemaId === cinema.id).length;
        const showtimeCount = showtimes.filter((showtime) => showtime.cinemaId === cinema.id).length;

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
              <Link href={`/cinemas/${cinema.id}`} style={[styles.link, { color: colors.accent }]}>
                Xem lịch
              </Link>
            </View>
            <Text style={[styles.inlineMeta, { color: colors.text }]}>
              {roomCount} phòng • {showtimeCount} suất chiếu
            </Text>
          </SectionCard>
        );
      })}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  inlineMeta: {
    fontSize: 13,
    fontFamily: Fonts.sansBold,
  },
  link: {
    fontSize: 14,
    fontFamily: Fonts.sansBold,
  },
});
