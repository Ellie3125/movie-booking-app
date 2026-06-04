import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AzureColors } from '@/constants/theme';
import { type RoomSeat, type ShowtimeSeatState } from '@/lib/app-store';
import { getSeatDisplayLabel } from '@/lib/seat-display';
import {
  getSeatStyle,
  getSeatVisualStatus,
  SELECTED_SEAT_SHADOW,
  type SeatVisualVariant,
} from '@/lib/seat-appearance';

type Props = {
  layout: RoomSeat[][];
  seatStates?: ShowtimeSeatState[];
  selectedCoordinates?: string[];
  mode: 'admin' | 'user';
  onPressSeat?: (seat: RoomSeat) => void;
  sizeScale?: number;
  useIntrinsicSizing?: boolean;
  seatVariantLookup?: Partial<Record<string, SeatVisualVariant>>;
};

const adminSeatStateColors = {
  available: '#22C55E',
  held: '#F59E0B',
  booked: '#EF4444',
  disabled: '#94A3B8',
  selected: '#38BDF8',
  blocked: '#EF4444',
  empty: 'transparent',
  space: 'transparent',
};

export const getSeatLayoutMetrics = (compact: boolean, sizeScale = 1) => {
  const scale = Math.min(Math.max(sizeScale, 0.75), 1.7);

  return {
    scale,
    gridGap: Math.round(4 * scale),
    cellWidth: Math.round(24 * scale),
    cellMinHeight: Math.round(24 * scale),
    cellRadius: Math.round(4 * scale),
    cellPaddingVertical: Math.max(2, Math.round(2 * scale)),
    cellPaddingHorizontal: Math.max(1, Math.round(1 * scale)),
    labelSize: Math.max(8, Math.round(10 * scale)),
    subtextSize: Math.max(6, Math.round(9 * scale)),
    subtextMarginTop: Math.max(1, Math.round(2 * scale)),
    emptyTextSize: Math.max(8, Math.round(12 * scale)),
    accentHeight: Math.max(4, Math.round(6 * scale)),
    silhouetteHeight: Math.max(6, Math.round(9 * scale)),
    silhouetteWidth: Math.max(12, Math.round(16 * scale)),
    silhouetteWideWidth: Math.max(18, Math.round(24 * scale)),
    badgeSize: Math.max(5, Math.round(7 * scale)),
    coupleCellWidth: Math.round(52 * scale),
  };
};

export function SeatLayoutGrid({
  layout,
  seatStates = [],
  selectedCoordinates = [],
  mode,
  onPressSeat,
  sizeScale = 1,
  useIntrinsicSizing = false,
  seatVariantLookup,
}: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 430;
  const isUserMode = mode === 'user';
  const metrics = getSeatLayoutMetrics(compact, sizeScale);
  const stateMap = new Map(
    seatStates.map((seat) => [seat.seatCode.toUpperCase(), seat]),
  );
  const selectedSet = new Set(selectedCoordinates.map((item) => item.toUpperCase()));

  return (
    <View
      style={[
        styles.grid,
        useIntrinsicSizing ? styles.gridIntrinsic : null,
        { gap: metrics.gridGap },
      ]}>
      {layout.map((row, rowIndex) => (
        <View
          key={`row_${rowIndex + 1}`}
          style={[
            styles.row,
            useIntrinsicSizing ? styles.rowIntrinsic : null,
            { gap: metrics.gridGap },
          ]}>
          {row.map((seat) => {
            const coordinate = seat.seatCode.toUpperCase();
            const seatState = stateMap.get(coordinate);
            const selected = selectedSet.has(coordinate);
            const isSpaceLike = ['space', 'empty', 'aisle'].includes(seat.type);
            const isUnavailableSeat =
              !isSpaceLike && Boolean(seatState && seatState.status !== 'available');
            const adminBackgroundColor =
              isSpaceLike
                ? 'transparent'
                : selected
                  ? adminSeatStateColors.selected
                  : isUserMode && isUnavailableSeat
                    ? adminSeatStateColors.blocked
                  : seatState
                    ? adminSeatStateColors[seatState.status]
                    : adminSeatStateColors.available;
            const typeLower = String(seat.type || '').trim().toLowerCase();
            const seatVariant =
              seatVariantLookup?.[coordinate] ??
              (typeLower === 'couple' || typeLower === 'double' || typeLower === 'pair' ? 'couple' :
               typeLower === 'vip' ? 'vip' : 'regular');
            const isCouple = typeLower === 'couple' || typeLower === 'double' || typeLower === 'pair';
            const displayLabel = getSeatDisplayLabel(seat);

            return (
              <Pressable
                key={`seat-${rowIndex}-${seat.columnIndex}-${seat.seatCode || seat.type}`}
                accessibilityRole={isSpaceLike ? undefined : 'button'}
                accessibilityLabel={isSpaceLike ? undefined : `Ghế ${displayLabel || coordinate}`}
                accessibilityState={{
                  selected,
                  disabled: isSpaceLike || seat.type === 'disabled' || (isUserMode && isUnavailableSeat),
                }}
                disabled={isSpaceLike || seat.type === 'disabled' || (isUserMode && isUnavailableSeat)}
                onPress={() => onPressSeat?.(seat)}
                style={[
                  styles.cell,
                  useIntrinsicSizing
                    ? { width: isCouple ? metrics.coupleCellWidth : metrics.cellWidth,
                        height: metrics.cellMinHeight }
                    : styles.cellFlexible,
                  isUserMode
                    ? isSpaceLike
                      ? styles.emptyCellUser
                      : null
                    : isSpaceLike
                      ? styles.emptyCell
                      : styles.seatCell,
                  {
                    borderRadius: metrics.cellRadius,
                  },
                  !isUserMode
                    ? {
                        backgroundColor: adminBackgroundColor,
                        minHeight: metrics.cellMinHeight,
                        paddingVertical: metrics.cellPaddingVertical,
                        paddingHorizontal: metrics.cellPaddingHorizontal,
                        opacity: isSpaceLike ? 0 : 1,
                      }
                    : null,
                ]}>
                {isUserMode ? (
                  !isSpaceLike ? (
                    (() => {
                      const visualStatus = getSeatVisualStatus({ selected, seatState });
                      const seatStyle = getSeatStyle(seatVariant, visualStatus);
                      const isReserved = visualStatus === 'booked' || visualStatus === 'held';
                      const isSelected = visualStatus === 'selected';

                      return (
                        <View
                          style={[
                            styles.userSeatFrame,
                            {
                              borderRadius: metrics.cellRadius,
                              borderColor: seatStyle.borderColor,
                              borderWidth: seatStyle.borderWidth,
                              backgroundColor: seatStyle.bg,
                              opacity: seatStyle.opacity,
                            },
                            isSelected && SELECTED_SEAT_SHADOW,
                          ]}>
                          {isReserved ? (
                            <Text style={[styles.userSeatText, {
                              color: seatStyle.text,
                              fontWeight: '700',
                              fontSize: metrics.labelSize,
                            }]}>
                              ✕
                            </Text>
                          ) : (
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.userSeatText,
                                {
                                  color: seatStyle.text,
                                  fontSize: metrics.labelSize,
                                  fontWeight: '500',
                                },
                              ]}>
                              {displayLabel}
                            </Text>
                          )}
                        </View>
                      );
                    })()
                  ) : (
                    <View style={{ flex: 1 }} />
                  )
                ) : !isSpaceLike ? (
                  <>
                    <Text style={[styles.cellText, { fontSize: metrics.labelSize }]}>
                      {displayLabel}
                    </Text>
                    <Text
                      style={[
                        styles.cellSubtext,
                        {
                          fontSize: metrics.subtextSize,
                          marginTop: metrics.subtextMarginTop,
                        },
                      ]}>
                      {coordinate}
                    </Text>
                  </>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {},
  gridIntrinsic: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
  },
  rowIntrinsic: {
    alignSelf: 'flex-start',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFlexible: {
    flex: 1,
  },
  seatCell: {
    borderWidth: 1,
    borderColor: AzureColors.border,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  emptyCellUser: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  userSeatFrame: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSeatText: {
    // Dynamically overridden
  },
  cellText: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  cellSubtext: {
    color: '#DBEAFE',
  },
});
