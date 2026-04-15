import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#09111F',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: '#09111F',
        },
      }}>
      <Stack.Screen name="index" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="movies/index" options={{ title: 'Manage Movies' }} />
      <Stack.Screen name="cinemas/index" options={{ title: 'Manage Cinemas' }} />
      <Stack.Screen name="rooms/index" options={{ title: 'Manage Rooms' }} />
      <Stack.Screen name="rooms/[roomId]/seat-layout" options={{ title: 'Seat Layout' }} />
    </Stack>
  );
}
