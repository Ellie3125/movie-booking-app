import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  ActionButton,
  Chip,
  EmptyNotice,
  HeroCard,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { SeatLayoutGrid } from '@/components/ui/seat-layout-grid';
import { type RoomSeat, useAppStore } from '@/lib/app-store';

const rowLetter = (rowIndex: number) => String.fromCharCode(65 + rowIndex);
const OUTER_COLUMN_MESSAGE = 'Không thể để trống ghế ở cột 1 hoặc cột cuối.';

const parseSeatCoordinate = (coordinate: string) => {
  const normalizedCoordinate = coordinate.trim().toUpperCase();
  const match = normalizedCoordinate.match(/^([A-Z])(\d+)$/);

  if (!match) {
    return null;
  }

  return {
    coordinate: normalizedCoordinate,
    rowIndex: match[1].charCodeAt(0) - 65,
    columnNumber: Number(match[2]),
  };
};

const findOuterColumnHiddenCoordinates = ({
  totalRows,
  totalColumns,
  hiddenCoordinates,
}: {
  totalRows: number;
  totalColumns: number;
  hiddenCoordinates: string[];
}) =>
  [...new Set(hiddenCoordinates.map((item) => item.toUpperCase()))].filter((coordinate) => {
    const parsedCoordinate = parseSeatCoordinate(coordinate);

    if (!parsedCoordinate) {
      return false;
    }

    const withinRowRange =
      parsedCoordinate.rowIndex >= 0 && parsedCoordinate.rowIndex < totalRows;
    const withinColumnRange =
      parsedCoordinate.columnNumber >= 1 &&
      parsedCoordinate.columnNumber <= totalColumns;

    return (
      withinRowRange &&
      withinColumnRange &&
      (parsedCoordinate.columnNumber === 1 ||
        parsedCoordinate.columnNumber === totalColumns)
    );
  });

const buildPreviewLayout = (
  totalRows: number,
  totalColumns: number,
  hiddenCoordinates: string[],
): RoomSeat[][] => {
  const hiddenSet = new Set(hiddenCoordinates.map((item) => item.toUpperCase()));

  return Array.from({ length: totalRows }, (_, rowIndex) => {
    let seatIndex = 0;

    return Array.from({ length: totalColumns }, (_, columnIndex) => {
      const coordinate = `${rowLetter(rowIndex)}${columnIndex + 1}`;

      if (hiddenSet.has(coordinate)) {
        return {
          id: `empty_${coordinate}`,
          cellType: 'empty',
          coordinate: {
            rowIndex,
            columnIndex,
            coordinateLabel: coordinate,
          },
          seatLabel: null,
          seatType: null,
          priceModifier: 0,
        };
      }

      seatIndex += 1;

      return {
        id: `seat_${coordinate}`,
        cellType: 'seat',
        coordinate: {
          rowIndex,
          columnIndex,
          coordinateLabel: coordinate,
        },
        seatLabel: `${rowLetter(rowIndex)}${seatIndex}`,
        seatType: 'standard',
        priceModifier: 1,
      };
    });
  });
};

export default function AdminSeatLayoutScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const { rooms, cinemas, saveRoomLayout } = useAppStore();
  const colors = getTonePalette('admin');
  const room = rooms.find((item) => item.id === roomId);
  const cinema = cinemas.find((item) => item.id === room?.cinemaId);
  const [rows, setRows] = useState(room ? String(room.totalRows) : '6');
  const [columns, setColumns] = useState(room ? String(room.totalColumns) : '10');
  const [hiddenCoordinates, setHiddenCoordinates] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!room) {
      return;
    }

    setRows(String(room.totalRows));
    setColumns(String(room.totalColumns));
    setHiddenCoordinates(
      room.seatLayout
        .flat()
        .filter((seat) => seat.cellType === 'empty')
        .map((seat) => seat.coordinate.coordinateLabel.toUpperCase()),
    );
  }, [room]);

  const totalRows = Math.max(1, Number(rows) || 1);
  const totalColumns = Math.max(1, Number(columns) || 1);
  const previewLayout = buildPreviewLayout(totalRows, totalColumns, hiddenCoordinates);
  const remappedSeats = previewLayout
    .flat()
    .filter(
      (seat) =>
        seat.cellType === 'seat' &&
        seat.seatLabel &&
        seat.coordinate.coordinateLabel !== seat.seatLabel,
    )
    .slice(0, 6);

  const handleSeatPress = (seat: RoomSeat) => {
    const coordinate = seat.coordinate.coordinateLabel.toUpperCase();
    const isCurrentlyHidden = hiddenCoordinates.includes(coordinate);
    const isOuterColumn =
      seat.coordinate.columnIndex === 0 ||
      seat.coordinate.columnIndex === totalColumns - 1;

    if (!isCurrentlyHidden && isOuterColumn) {
      setFeedback(OUTER_COLUMN_MESSAGE);
      return;
    }

    setFeedback(null);

    setHiddenCoordinates((current) =>
      current.includes(coordinate)
        ? current.filter((item) => item !== coordinate)
        : [...current, coordinate],
    );
  };

  const applyGrid = () => {
    setFeedback(null);
    setHiddenCoordinates([]);
  };

  const saveLayout = async () => {
    if (!room) {
      return;
    }

    const blockedCoordinates = findOuterColumnHiddenCoordinates({
      totalRows,
      totalColumns,
      hiddenCoordinates,
    });

    if (blockedCoordinates.length > 0) {
      const blockedPreview = blockedCoordinates.slice(0, 4).join(', ');
      setFeedback(
        `${OUTER_COLUMN_MESSAGE} (${blockedPreview}${blockedCoordinates.length > 4 ? ', ...' : ''})`,
      );
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const result = await saveRoomLayout({
      roomId: room.id,
      totalRows,
      totalColumns,
      hiddenCoordinates,
    });

    setIsSaving(false);
    setFeedback(
      result.ok
        ? 'Đã lưu sơ đồ ghế vào backend.'
        : result.error || 'Không thể lưu sơ đồ ghế.'
    );
  };

  return (
    <PageScroll tone="admin">
      <Stack.Screen options={{ title: room?.name ?? 'Seat Layout' }} />
      {!room ? (
        <EmptyNotice tone="admin" title="Khong tim thay room" />
      ) : (
        <>
          <HeroCard
            tone="admin"
            eyebrow="Admin / Seat Layout"
            title={`${room.name} • ${cinema?.brand ?? ''} ${cinema?.name ?? ''}`}
          />

          <SectionCard tone="admin">
            <View style={styles.controls}>
              <TextInput
                placeholder="Rows"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={rows}
                onChangeText={(value) => {
                  setFeedback(null);
                  setRows(value);
                }}
              />
              <TextInput
                placeholder="Columns"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={columns}
                onChangeText={(value) => {
                  setFeedback(null);
                  setColumns(value);
                }}
              />
            </View>
            <ActionButton
              tone="admin"
              variant="secondary"
              label="Regenerate empty grid"
              onPress={applyGrid}
            />
          </SectionCard>

          <SectionTitle
            tone="admin"
            title="Seat builder"
            description="Nhấn vào ghế để ẩn hoặc khôi phục. Cột 1 và cột cuối luôn phải có ghế."
          />
          <SectionCard tone="admin">
            <SeatLayoutGrid layout={previewLayout} mode="admin" onPressSeat={handleSeatPress} />
          </SectionCard>

          <SectionCard tone="admin">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Mapping preview</Text>
            <View style={styles.chipRow}>
              {remappedSeats.length === 0 ? (
                <Chip tone="admin" label="Khong co seat remap" />
              ) : (
                remappedSeats.map((seat) => (
                  <Chip
                    key={seat.id}
                    tone="admin"
                    active
                    label={`${seat.coordinate.coordinateLabel} => ${seat.seatLabel}`}
                  />
                ))
              )}
            </View>
            {feedback ? <Text style={[styles.feedback, { color: colors.accent }]}>{feedback}</Text> : null}
            <ActionButton
              tone="admin"
              label={isSaving ? 'Saving...' : 'Save layout'}
              onPress={saveLayout}
            />
          </SectionCard>
        </>
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  feedback: {
    fontSize: 14,
    fontWeight: '700',
  },
});
