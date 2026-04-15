import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function AdminSeatLayoutScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: roomId ? `Seat Layout: ${roomId}` : 'Seat Layout' }} />
      <View style={styles.container}>
        <Text style={styles.kicker}>Admin / Rooms</Text>
        <Text style={styles.title}>Seat Layout Editor</Text>
        <Text style={styles.subtitle}>
          Placeholder screen for customizing rows, seat counts, VIP areas, and disabled seats for{' '}
          {roomId ?? 'the selected room'}.
        </Text>

        <View style={styles.gridCard}>
          <Text style={styles.screenLabel}>SCREEN</Text>
          <View style={styles.rows}>
            <View style={styles.row}>
              <View style={styles.seat} />
              <View style={styles.seat} />
              <View style={styles.seat} />
              <View style={[styles.seat, styles.vipSeat]} />
              <View style={[styles.seat, styles.vipSeat]} />
            </View>
            <View style={styles.row}>
              <View style={styles.seat} />
              <View style={styles.seat} />
              <View style={styles.emptySeat} />
              <View style={styles.seat} />
              <View style={styles.seat} />
            </View>
            <View style={styles.row}>
              <View style={styles.seat} />
              <View style={[styles.seat, styles.disabledSeat]} />
              <View style={styles.seat} />
              <View style={styles.seat} />
              <View style={styles.seat} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#38BDF8',
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 22,
    maxWidth: 520,
  },
  gridCard: {
    marginTop: 10,
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 18,
  },
  screenLabel: {
    textAlign: 'center',
    color: '#F8FAFC',
    fontWeight: '700',
    letterSpacing: 2,
  },
  rows: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  seat: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#38BDF8',
  },
  vipSeat: {
    backgroundColor: '#A855F7',
  },
  disabledSeat: {
    backgroundColor: '#475569',
  },
  emptySeat: {
    width: 28,
    height: 28,
  },
});
