import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { type RoomSeat, type ShowtimeSeatState } from '@/lib/app-store';
import {
  getSeatVisualStatus,
  seatStatusTokens,
  seatVariantTokens,
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
  paid: '#EF4444',
  reserved: '#94A3B8',
  selected: '#38BDF8',
  blocked: '#EF4444',
  empty: 'rgba(148, 163, 184, 0.12)',
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
    seatStates.map((seat) => [seat.seatCoordinate.toUpperCase(), seat]),
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
            const coordinate = seat.coordinate.coordinateLabel.toUpperCase();
            const seatState = stateMap.get(coordinate);
            const selected = selectedSet.has(coordinate);
            const isUnavailableSeat =
              seat.cellType === 'seat' && Boolean(seatState && seatState.status !== 'available');
            const adminBackgroundColor =
              seat.cellType === 'empty'
                ? isUserMode
                  ? 'transparent'
                  : adminSeatStateColors.empty
                : selected
                  ? adminSeatStateColors.selected
                  : isUserMode && isUnavailableSeat
                    ? adminSeatStateColors.blocked
                  : seatState
                    ? adminSeatStateColors[seatState.status]
                    : adminSeatStateColors.available;
            const seatVariant =
              seatVariantLookup?.[coordinate] ?? (seat.seatType === 'couple' ? 'couple' : 'standard');
            const statusToken = seatStatusTokens[
              getSeatVisualStatus({
                selected,
                seatState,
              })
            ];
            const variantToken = seatVariantTokens[seatVariant];

            return (
              <Pressable
                key={seat.id}
                disabled={seat.cellType === 'empty' || (isUserMode && isUnavailableSeat)}
                onPress={() => onPressSeat?.(seat)}
                style={[
                  styles.cell,
                  useIntrinsicSizing ? { width: metrics.cellWidth } : styles.cellFlexible,
                  isUserMode
                    ? seat.cellType === 'empty'
                      ? styles.emptyCellUser
                      : styles.userSeatHitBox
                    : seat.cellType === 'empty'
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
                        opacity: seat.cellType === 'empty' ? 0.5 : 1,
                      }
                    : null,
                ]}>
                {isUserMode ? (
                  seat.cellType === 'seat' ? (
                    <View
                      style={[
                        styles.userSeatFrame,
                        {
                          borderRadius: metrics.cellRadius,
                          borderColor: statusToken.border,
                          backgroundColor: statusToken.fill,
                          paddingTop: metrics.cellPaddingVertical + metrics.accentHeight + 2,
                          paddingBottom: metrics.cellPaddingVertical,
                          paddingHorizontal: metrics.cellPaddingHorizontal + 2,
                        },
                      ]}>
                      <View
                        style={[
                          styles.userSeatAccent,
                          {
                            height: metrics.accentHeight,
                            backgroundColor: variantToken.accent,
                          },
                        ]}
                      />
                      {seatVariant === 'vip' ? (
                        <Text
                          style={[
                            styles.userSeatBadge,
                            {
                              color: variantToken.accent,
                              fontSize: metrics.badgeSize,
                              top: metrics.accentHeight + 2,
                            },
                          ]}>
                          VIP
                        </Text>
                      ) : null}
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.userSeatText,
                          {
                            color: statusToken.text,
                            fontSize: metrics.labelSize,
                          },
                        ]}>
                        {seat.seatLabel}
                      </Text>
                      <View
                        style={[
                          styles.userSeatSilhouette,
                          {
                            backgroundColor: variantToken.accentSoft,
                            width: variantToken.previewWide
                              ? metrics.silhouetteWideWidth
                              : metrics.silhouetteWidth,
                            height: metrics.silhouetteHeight,
                            marginTop: metrics.subtextMarginTop + 1,
                          },
                        ]}>
                        {seatVariant === 'couple' ? (
                          <View
                            style={[
                              styles.userSeatDivider,
                              { backgroundColor: variantToken.accent },
                            ]}
                          />
                        ) : null}
                      </View>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.userEmptySlot,
                        {
                          borderRadius: Math.max(metrics.cellRadius - 2, 8),
                        },
                      ]}>
                      <Text
                        style={[
                          styles.userEmptyText,
                          {
                            fontSize: metrics.emptyTextSize,
                          },
                        ]}>
                        ×
                      </Text>
                    </View>
                  )
                ) : seat.cellType === 'seat' ? (
                  <>
                    <Text style={[styles.cellText, { fontSize: metrics.labelSize }]}>
                      {seat.seatLabel}
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
                ) : (
                  <Text style={[styles.emptyText, { fontSize: metrics.emptyTextSize }]}>x</Text>
                )}
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
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(148,163,184,0.35)',
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  userSeatAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  userSeatBadge: {
    position: 'absolute',
    right: 4,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  userSeatText: {
    fontWeight: '800',
  },
  userSeatSilhouette: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userSeatDivider: {
    width: 2,
    alignSelf: 'stretch',
    opacity: 0.7,
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
