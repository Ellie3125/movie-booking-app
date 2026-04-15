import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: id ? `Movie ${id}` : 'Movie Details' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Movie Detail</Text>
        <Text style={styles.subtitle}>Placeholder detail screen for movie ID: {id ?? 'unknown'}.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8ED',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5A3E2B',
  },
  subtitle: {
    fontSize: 15,
    color: '#8A6A50',
    textAlign: 'center',
  },
});
