import { Link } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function AdminDashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>Admin workspace</Text>
        <Text style={styles.title}>Cinema Operations</Text>
        <Text style={styles.subtitle}>
          Separate admin area for CRUD operations and room seat-layout configuration.
        </Text>

        <View style={styles.actions}>
          <Link href="/admin/movies" style={styles.link}>
            Manage movies
          </Link>
          <Link href="/admin/rooms" style={styles.link}>
            Manage rooms
          </Link>
          <Link href="/admin/rooms/room-a/seat-layout" style={styles.link}>
            Edit sample seat layout
          </Link>
          <Link href="/" style={styles.secondaryLink}>
            Back to login
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
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: '#38BDF8',
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#CBD5E1',
    maxWidth: 420,
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  link: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#111827',
    color: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryLink: {
    marginTop: 8,
    color: '#7DD3FC',
    fontSize: 14,
    fontWeight: '600',
  },
});
