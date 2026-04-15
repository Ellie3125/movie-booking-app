import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  type RoomSeat,
  type ShowtimeSeatState,
} from '@/lib/app-store';

type Props = {
  layout: RoomSeat[][];
  seatStates?: ShowtimeSeatState[];
  selectedCoordinates?: string[];
  mode: 'admin' | 'user';
  onPressSeat?: (seat: RoomSeat) => void;
};

const seatStateColors = {
  available: '#22C55E',
  held: '#F59E0B',
  paid: '#EF4444',
  reserved: '#94A3B8',
  selected: '#38BDF8',
  empty: 'rgba(148, 163, 184, 0.12)',
};

export function SeatLayoutGrid({
  layout,
  seatStates = [],
  selectedCoordinates = [],
  mode,
  onPressSeat,
}: Props) {
  const stateMap = new Map(
    seatStates.map((seat) => [seat.seatCoordinate.toUpperCase(), seat]),
  );
  const selectedSet = new Set(selectedCoordinates.map((item) => item.toUpperCase()));

  return (
    <View style={styles.grid}>
      {layout.map((row, rowIndex) => (
        <View key={`row_${rowIndex + 1}`} style={styles.row}>
          {row.map((seat) => {
            const coordinate = seat.coordinate.coordinateLabel.toUpperCase();
            const seatState = stateMap.get(coordinate);
            const selected = selectedSet.has(coordinate);
            const backgroundColor =
              seat.cellType === 'empty'
                ? seatStateColors.empty
                : selected
                  ? seatStateColors.selected
                  : seatState
                    ? seatStateColors[seatState.status]
                    : seatStateColors.available;

            return (
              <Pressable
                key={seat.id}
                onPress={() => onPressSeat?.(seat)}
                style={[
                  styles.cell,
                  seat.cellType === 'empty' ? styles.emptyCell : styles.seatCell,
                  {
                    backgroundColor,
                    opacity: seat.cellType === 'empty' ? 0.5 : 1,
                  },
                ]}>
                {seat.cellType === 'seat' ? (
                  <>
                    <Text style={styles.cellText}>{seat.seatLabel}</Text>
                    {mode === 'admin' ? (
                      <Text style={styles.cellSubtext}>{coordinate}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.emptyText}>x</Text>
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
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  cell: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
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
  cellText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  cellSubtext: {
    color: '#DBEAFE',
    fontSize: 9,
    marginTop: 2,
  },
  emptyText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
