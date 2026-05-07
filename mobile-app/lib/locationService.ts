import * as Location from 'expo-location';

export type LocationResult =
  | { status: 'granted'; latitude: number; longitude: number }
  | { status: 'denied' }
  | { status: 'unavailable' }
  | { status: 'error'; message: string };

/**
 * Xin quyền foreground location và lấy tọa độ hiện tại.
 * Không bao giờ throw — luôn trả về LocationResult.
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return { status: 'denied' };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      status: 'granted',
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Không thể lấy vị trí';
    return { status: 'error', message };
  }
}

/**
 * Kiểm tra quyền hiện tại mà không hỏi user.
 */
export async function getLocationPermissionStatus(): Promise<Location.PermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status;
}
