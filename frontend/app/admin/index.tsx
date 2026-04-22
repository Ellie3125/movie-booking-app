import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  HeroCard,
  MetricTile,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { useAppStore } from '@/lib/app-store';

export default function AdminDashboardScreen() {
  const { movies, cinemas, rooms, showtimes, bookings } = useAppStore();
  const colors = getTonePalette('admin');

  return (
    <PageScroll tone="admin">
      <HeroCard
        tone="admin"
        eyebrow="Admin workspace"
        title="BeatCinema control tower">
        <View style={styles.metricRow}>
          <MetricTile tone="admin" value={String(movies.length)} label="Movies" />
          <MetricTile tone="admin" value={String(cinemas.length)} label="Cinemas" />
          <MetricTile tone="admin" value={String(rooms.length)} label="Rooms" />
          <MetricTile tone="admin" value={String(showtimes.length)} label="Showtimes" />
          <MetricTile tone="admin" value={String(bookings.length)} label="Bookings" />
        </View>
      </HeroCard>

      <SectionTitle tone="admin" title="Quick Access" />
      <SectionCard tone="admin">
        <Link href="/admin/movies" style={[styles.link, { color: colors.accent }]}>
          Movie CRUD
        </Link>
        <Link href="/admin/cinemas" style={[styles.link, { color: colors.accent }]}>
          Cinema CRUD
        </Link>
        <Link href="/admin/rooms" style={[styles.link, { color: colors.accent }]}>
          Room CRUD + seat builder
        </Link>
        <Link href=".." style={[styles.link, { color: colors.muted }]}>
          Back to login
        </Link>
      </SectionCard>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  link: {
    fontSize: 15,
    fontWeight: '800',
  },
});
