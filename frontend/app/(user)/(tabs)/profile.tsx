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

export default function ProfileTabScreen() {
  const { currentUser, bookings, cinemas } = useAppStore();
  const colors = getTonePalette('user');
  const myBookings = bookings.filter((booking) => booking.userId === currentUser.id);
  const totalSpent = myBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

  return (
    <PageScroll tone="user">
      <HeroCard
        tone="user"
        eyebrow="Account"
        title={currentUser.name}
        description="Trang profile cho user gom thong tin tai khoan, thong ke dat ve va rap yeu thich.">
        <View style={styles.metrics}>
          <MetricTile
            tone="user"
            value={String(myBookings.length)}
            label="Bookings"
            helper="So booking user da thanh toan trong session hien tai."
          />
          <MetricTile
            tone="user"
            value={totalSpent.toLocaleString('vi-VN')}
            label="Total spend"
            helper="Tong chi phi tren mock store."
          />
        </View>
      </HeroCard>

      <SectionTitle
        tone="user"
        title="Thong tin tai khoan"
        description="Tach rieng khoi admin, user chi thay du lieu lien quan den dat ve."
      />
      <SectionCard tone="user">
        <Text style={[styles.cardTitle, { color: colors.text }]}>Email</Text>
        <Text style={[styles.cardCopy, { color: colors.muted }]}>{currentUser.email}</Text>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Rap goi y</Text>
        <Text style={[styles.cardCopy, { color: colors.muted }]}>
          {cinemas.slice(0, 2).map((cinema) => `${cinema.brand} ${cinema.name}`).join(' • ')}
        </Text>
      </SectionCard>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
});
