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

    setHiddenCoordinates((current) =>
      current.includes(coordinate)
        ? current.filter((item) => item !== coordinate)
        : [...current, coordinate],
    );
  };

  const applyGrid = () => {
    setHiddenCoordinates([]);
  };

  const saveLayout = () => {
    if (!room) {
      return;
    }

    saveRoomLayout({
      roomId: room.id,
      totalRows,
      totalColumns,
      hiddenCoordinates,
    });
  };

  return (
    <PageScroll tone="admin">
      <Stack.Screen options={{ title: room?.name ?? 'Seat Layout' }} />
      {!room ? (
        <EmptyNotice
          tone="admin"
          title="Khong tim thay room"
          description="Chon room tu trang CRUD truoc khi mo seat builder."
        />
      ) : (
        <>
          <HeroCard
            tone="admin"
            eyebrow="Admin / Seat Layout"
            title={`${room.name} • ${cinema?.brand ?? ''} ${cinema?.name ?? ''}`}
            description="Nhap so hang, so cot roi scan ra bang. Tap vao o nao thi o do khong phai ghe va se bien mat o giao dien dat ve."
          />

          <SectionCard tone="admin">
            <View style={styles.controls}>
              <TextInput
                placeholder="Rows"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={rows}
                onChangeText={setRows}
              />
              <TextInput
                placeholder="Columns"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                value={columns}
                onChangeText={setColumns}
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
            description="O mau xam la no-seat. O mau xanh la seat se duoc ban o phia user."
          />
          <SectionCard tone="admin">
            <SeatLayoutGrid layout={previewLayout} mode="admin" onPressSeat={handleSeatPress} />
          </SectionCard>

          <SectionCard tone="admin">
            <Text style={[styles.cardTitle, { color: colors.text }]}>Mapping preview</Text>
            <Text style={[styles.cardCopy, { color: colors.muted }]}>
              He thong tu dong tach coordinate that va seat label hien thi. Neu bo trong o dau hang, ten ghe se duoc danh lai lien tuc.
            </Text>
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
            <ActionButton tone="admin" label="Save layout" onPress={saveLayout} />
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
});
