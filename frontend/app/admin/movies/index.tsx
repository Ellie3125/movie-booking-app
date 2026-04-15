import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function AdminMoviesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>Admin / Movies</Text>
        <Text style={styles.title}>Movie CRUD</Text>
        <Text style={styles.subtitle}>
          Placeholder screen for creating, editing, publishing, hiding, and deleting movies.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Planned actions</Text>
          <Text style={styles.cardText}>Create movie records with posters, genres, duration, and status.</Text>
          <Text style={styles.cardText}>Update existing movies and control visibility in the user app.</Text>
          <Text style={styles.cardText}>Delete or archive titles that are no longer scheduled.</Text>
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
});
