import { Link } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function AdminRoomsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>Admin / Rooms</Text>
        <Text style={styles.title}>Room CRUD</Text>
        <Text style={styles.subtitle}>
          Placeholder screen for creating cinema rooms, editing capacity, and opening seat layout tools.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Room actions</Text>
          <Text style={styles.cardText}>Create rooms by cinema branch and assign room codes.</Text>
          <Text style={styles.cardText}>Edit room metadata such as type, projection format, and capacity.</Text>
          <Link href="/admin/rooms/room-a/seat-layout" style={styles.link}>
            Configure seat layout for Room A
          </Link>
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
    maxWidth: 480,
  },
  card: {
    marginTop: 8,
    borderRadius: 20,
    padding: 18,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cardText: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  link: {
    marginTop: 6,
    color: '#7DD3FC',
    fontSize: 14,
    fontWeight: '600',
  },
});
