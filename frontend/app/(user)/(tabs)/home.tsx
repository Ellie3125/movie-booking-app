import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function HomeTabScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>User app</Text>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>
          Placeholder home screen for the customer-facing movie booking experience.
        </Text>
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
  kicker: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: '#B48245',
    fontWeight: '700',
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
    maxWidth: 320,
  },
});
