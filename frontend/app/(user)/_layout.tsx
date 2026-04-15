import { Stack } from 'expo-router';

export default function UsersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="movies/[id]" options={{ headerShown: true, title: 'Movie Details' }} />
      <Stack.Screen name="cinemas/[id]" options={{ headerShown: true, title: 'Cinema Details' }} />
      <Stack.Screen name="booking/seats" options={{ headerShown: true, title: 'Seat Selection' }} />
      <Stack.Screen name="booking/checkout" options={{ headerShown: true, title: 'Checkout' }} />
    </Stack>
  );
}
