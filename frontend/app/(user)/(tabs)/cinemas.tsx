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
import { useAppStore } from '@/lib/app-store';

export default function CinemasTabScreen() {
  const { cinemas, rooms, showtimes } = useAppStore();
  const colors = getTonePalette('user');

  return (
    <PageScroll tone="user">
      <HeroCard
        tone="user"
        eyebrow="Cinema browsing"
        title="User co tab rieng de xem rap va lich chieu."
        description="Cau truc nay giong app dat ve thuc te hon: user co the di tu rap sang phim hoac phim sang rap.">
        <View style={styles.metrics}>
          <MetricTile
            tone="user"
            value={String(cinemas.length)}
            label="Branches"
            helper="Danh sach rap dang co trong mock store."
          />
          <MetricTile
            tone="user"
            value={String(rooms.length)}
            label="Rooms"
            helper="Phong chieu duoc admin tao va sua layout."
          />
        </View>
      </HeroCard>

      <SectionTitle
        tone="user"
        title="Rap dang hoat dong"
        description="Moi rap co room count va duong dan sang lich chieu chi tiet."
      />
      {cinemas.map((cinema) => {
        const roomCount = rooms.filter((room) => room.cinemaId === cinema.id).length;
        const showtimeCount = showtimes.filter((showtime) => showtime.cinemaId === cinema.id).length;

        return (
          <SectionCard key={cinema.id} tone="user">
            <View style={styles.rowBetween}>
              <View style={styles.flex}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {cinema.brand} {cinema.name}
                </Text>
                <Text style={[styles.cardCopy, { color: colors.muted }]}>{cinema.address}</Text>
                <Text style={[styles.cardCopy, { color: colors.muted }]}>
                  {cinema.city} • {cinema.features.join(' • ')}
                </Text>
              </View>
              <Link href={`/cinemas/${cinema.id}`} style={[styles.link, { color: colors.accent }]}>
                Xem lich
              </Link>
            </View>
            <Text style={[styles.inlineMeta, { color: colors.text }]}>
              {roomCount} rooms • {showtimeCount} showtimes
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
    fontWeight: '800',
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  inlineMeta: {
    fontSize: 13,
    fontWeight: '700',
  },
  link: {
    fontSize: 14,
    fontWeight: '800',
  },
});
