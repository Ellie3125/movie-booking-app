/**
 * PinchableZoomView — vùng seat map có thể phóng to thu nhỏ độc lập.
 *
 * Autonomous Decisions:
 * - Dùng react-native-gesture-handler (GestureDetector + Gesture) thay PanResponder
 *   vì đã có sẵn trong project và hỗ trợ simultaneous gesture tốt hơn
 * - Dùng react-native-reanimated cho transform mượt mà (60fps)
 * - Double-tap để reset về scale 1 (UX tiêu chuẩn)
 * - Zoom bar hiển thị scale hiện tại
 *
 * Trade-offs:
 * - Giữ scroll ngang bên ngoài vẫn hoạt động khi scale = 1
 * - Khi đang zoom (scale > 1), tắt parent scroll để pan tự do trong vùng zoom
 *
 * Context/Notes:
 * - Chỉ dùng cho khu vực seat grid trong màn hình booking
 * - Không ảnh hưởng đến scroll dọc của màn hình hay bottom panel
 */

import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AzureColors, Fonts } from '@/constants/theme';

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.8;
const SNAP_BACK_SCALE = 1.0;

type Props = {
  children: React.ReactNode;
  /** Callback khi scale thay đổi — dùng để disable parent scroll khi đang zoom */
  onScaleChange?: (scale: number) => void;
};

export function PinchableZoomView({ children, onScaleChange }: Props) {
  // ── Shared values (chạy trên UI thread) ──
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const notifyScale = useCallback(
    (s: number) => onScaleChange?.(s),
    [onScaleChange],
  );

  // ── Pinch gesture ──
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const next = Math.min(Math.max(savedScale.value * e.scale, MIN_SCALE), MAX_SCALE);
      scale.value = next;
      runOnJS(notifyScale)(next);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Snap back nếu scale quá nhỏ
      if (scale.value < 1) {
        scale.value = withSpring(SNAP_BACK_SCALE, { damping: 15, stiffness: 120 });
        savedScale.value = SNAP_BACK_SCALE;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(notifyScale)(SNAP_BACK_SCALE);
      }
    });

  // ── Pan gesture (di chuyển khi đang zoom) ──
  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      if (scale.value <= 1.05) return; // Chỉ pan khi đang zoom
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // ── Double-tap: reset về scale 1 ──
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(SNAP_BACK_SCALE, { damping: 15, stiffness: 120 });
      savedScale.value = SNAP_BACK_SCALE;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      runOnJS(notifyScale)(SNAP_BACK_SCALE);
    });

  // ── Kết hợp gestures ──
  const composed = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, pinchGesture),
    panGesture,
  );

  // ── Animated style ──
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // ── Zoom indicator (scale badge) ──
  const indicatorStyle = useAnimatedStyle(() => {
    const isZoomed = scale.value > 1.08;
    return {
      opacity: withTiming(isZoomed ? 1 : 0, { duration: 200 }),
      transform: [{ scale: withSpring(isZoomed ? 1 : 0.8) }],
    };
  });

  const scaleTextStyle = useAnimatedStyle(() => ({
    // chỉ để trigger re-read — text update qua runOnJS nếu cần
  }));

  const ScaleLabel = () => {
    // Hiện badge % zoom ở góc trên phải vùng seat
    return (
      <Animated.View style={[styles.zoomBadge, indicatorStyle]} pointerEvents="none">
        <Text style={styles.zoomBadgeText}>🔍 Đang zoom</Text>
        <Text style={styles.zoomHint}>Double-tap để reset</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.inner, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
      <ScaleLabel />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Không clip — cho phép pinch zoom ra ngoài bounds khi cần
    overflow: 'visible',
  },
  inner: {
    // Không set width/height cố định — để content tự xác định
  },
  zoomBadge: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    backgroundColor: AzureColors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 2,
    alignItems: 'center',
    // Shadow
    shadowColor: AzureColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  zoomBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.sansBold,
    lineHeight: 16,
  },
  zoomHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontFamily: Fonts.sansMedium,
    lineHeight: 13,
  },
});
