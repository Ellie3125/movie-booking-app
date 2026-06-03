import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { type RoomSeat, type ShowtimeSeatState } from '@/lib/app-store';
import { getSeatVisualStatus, type SeatVisualVariant } from '@/lib/seat-appearance';
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
    gridGap: Math.max(4, Math.round((compact ? 6 : 8) * scale)),
    cellWidth: Math.max(22, Math.round((compact ? 30 : 36) * scale)),
    cellMinHeight: Math.max(30, Math.round((compact ? 38 : 46) * scale)),
    cellRadius: Math.max(8, Math.round((compact ? 10 : 12) * scale)),
    cellPaddingVertical: Math.max(3, Math.round((compact ? 4 : 6) * scale)),
    cellPaddingHorizontal: Math.max(2, Math.round(2 * scale)),
    labelSize: Math.max(8, Math.round((compact ? 9 : 11) * scale)),
    subtextSize: Math.max(6, Math.round((compact ? 7 : 9) * scale)),
    subtextMarginTop: Math.max(1, Math.round((compact ? 1 : 2) * scale)),
    emptyTextSize: Math.max(8, Math.round((compact ? 9 : 12) * scale)),
    accentHeight: Math.max(4, Math.round((compact ? 5 : 6) * scale)),
    silhouetteHeight: Math.max(6, Math.round((compact ? 7 : 9) * scale)),
    silhouetteWidth: Math.max(12, Math.round((compact ? 13 : 16) * scale)),
    silhouetteWideWidth: Math.max(18, Math.round((compact ? 19 : 24) * scale)),
    badgeSize: Math.max(5, Math.round((compact ? 6 : 7) * scale)),
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
            const seatVariant =
              seatVariantLookup?.[coordinate] ?? (seat.type === 'couple' ? 'couple' : 'regular');

            return (
              <Pressable
                key={seat.seatCode}
                disabled={isSpaceLike || seat.type === 'disabled' || (isUserMode && isUnavailableSeat)}
                onPress={() => onPressSeat?.(seat)}
                style={[
                  styles.cell,
                  useIntrinsicSizing 
                    ? { width: seat.type === 'couple' ? metrics.cellWidth * 2 + metrics.gridGap : metrics.cellWidth } 
                    : styles.cellFlexible,
                  isUserMode
                    ? isSpaceLike
                      ? styles.emptyCellUser
                      : styles.userSeatHitBox
                    : isSpaceLike
                      ? styles.emptyCell
                      : styles.seatCell,
                  {
                    minHeight: metrics.cellMinHeight,
                    borderRadius: metrics.cellRadius,
                    paddingVertical: metrics.cellPaddingVertical,
                    paddingHorizontal: metrics.cellPaddingHorizontal,
                  },
                  !isUserMode
                    ? {
                        backgroundColor: adminBackgroundColor,
                        opacity: isSpaceLike ? 0 : 1,
                      }
                    : null,
                ]}>
                {isUserMode ? (
                  !isSpaceLike ? (
                    (() => {
                      const visualStatus = getSeatVisualStatus({ selected, seatState });
                      const isReserved = visualStatus === 'booked' || visualStatus === 'held';
                      const isAvailable = visualStatus === 'available';
                      const isSelected = visualStatus === 'selected';

                      let bgColor = '#E8F0FE';
                      let textColor = '#0041c8';
                      let borderColor = 'transparent';
                      let borderWidth = 0;
                      let fontWeight: '500' | '700' = '500';
                      let opacity = 1;

                      if (isSelected) {
                        bgColor = '#0041c8';
                        textColor = '#ffffff';
                        fontWeight = '700';
                      } else if (isReserved) {
                        bgColor = '#c3c5d9';
                        textColor = '#9e9e9e';
                        opacity = 0.5;
                      } else if (isAvailable) {
                        if (seatVariant === 'vip') {
                          bgColor = '#D1E3FF';
                          textColor = '#0041c8';
                          borderColor = 'rgba(0, 65, 200, 0.2)';
                          borderWidth = 1;
                          fontWeight = '700';
                        } else if (seatVariant === 'couple') {
                          bgColor = '#F3E5F5';
                          textColor = '#6a4a00';
                        }
                      }

                      return (
                        <View
                          style={[
                            styles.userSeatFrame,
                            {
                              borderRadius: seat.type === 'couple' ? 6 : 4,
                              borderColor: borderColor,
                              borderWidth: borderWidth,
                              backgroundColor: bgColor,
                              opacity: opacity,
                            },
                          ]}>
                          {isReserved ? (
                            <Text style={[styles.userSeatText, { color: textColor, fontWeight: '700', fontSize: metrics.labelSize }]}>
                              X
                            </Text>
                          ) : (
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.userSeatText,
                                {
                                  color: textColor,
                                  fontSize: metrics.labelSize,
                                  fontWeight: fontWeight,
                                },
                              ]}>
                              {seat.label}
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
                      {seat.label}
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
    borderColor: 'rgba(255,255,255,0.14)',
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  emptyCellUser: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  userSeatHitBox: {
    backgroundColor: 'transparent',
  },
  userEmptySlot: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(193, 146, 103, 0.28)',
    backgroundColor: 'rgba(255, 245, 231, 0.88)',
  },
  userEmptyText: {
    color: 'rgba(124, 102, 85, 0.55)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userSeatFrame: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSeatAccent: {
    height: 0,
  },
  userSeatBadge: {
    fontSize: 0,
  },
  userSeatText: {
    // Sẽ được override động
  },
  userSeatSilhouette: {
    height: 0,
  },
  userSeatDivider: {
    width: 0,
  },
  cellText: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  cellSubtext: {
    color: '#DBEAFE',
  },
  emptyText: {
    color: '#CBD5E1',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
