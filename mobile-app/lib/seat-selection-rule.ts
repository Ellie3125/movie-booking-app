type SeatLayoutCellLike = {
  type?: string;
  seatCode?: string;
  label?: string;
  rowLabel?: string;
  rowIndex?: number;
  columnIndex?: number;
  seatIndex?: number;
  number?: number;
  status?: string;
};

type SeatLayoutRowLike =
  | SeatLayoutCellLike[]
  | {
      rowLabel?: string;
      rowIndex?: number;
      seats?: SeatLayoutCellLike[];
    };

type ShowtimeSeatStateLike = {
  seatCode: string;
  label?: string;
  rowLabel?: string;
  rowIndex?: number;
  columnIndex?: number;
  status: string;
};

export type OrderedSeat = SeatLayoutCellLike & {
  code: string;
  label: string;
  rowKey: string;
  rowSortValue: number;
  columnSortValue: number;
  stateStatus: string;
};

export type SeatRowGroup = {
  rowKey: string;
  rowSortValue: number;
  seats: OrderedSeat[];
};

export type EdgeSeatSelectionConflict = {
  side: 'left' | 'right';
  edgeCode: string;
  edgeSeatLabel: string;
  adjacentCode: string;
  adjacentSeatLabel: string;
  message: string;
};

export const OUTER_EDGE_EMPTY_SEAT_WARNING =
  'Không thể để trống 1 ghế ngoài cùng của dãy ghế. Vui lòng chọn thêm ghế hoặc đổi vị trí.';

const STRUCTURAL_SEAT_TYPES = new Set(['space', 'aisle', 'empty']);
const UNSELECTABLE_SEAT_TYPES = new Set(['space', 'aisle', 'empty', 'disabled']);
const UNSELECTABLE_STATE_STATUSES = new Set(['booked', 'held', 'disabled']);

const normalizeCoordinate = (value: string) => value.trim().toUpperCase();

const getFirstNumber = (...values: Array<string | undefined>) => {
  for (const value of values) {
    const match = value?.match(/\d+/);

    if (match) {
      return Number(match[0]);
    }
  }

  return null;
};

const getRowLetters = (...values: Array<string | undefined>) => {
  for (const value of values) {
    const match = value?.trim().match(/^[A-Za-z]+/);

    if (match) {
      return match[0].toUpperCase();
    }
  }

  return null;
};

const rowLabelToSortValue = (rowLabel?: string | null) => {
  if (!rowLabel) {
    return null;
  }

  let value = 0;

  for (const character of rowLabel.toUpperCase()) {
    const charCode = character.charCodeAt(0);

    if (charCode < 65 || charCode > 90) {
      return null;
    }

    value = value * 26 + charCode - 64;
  }

  return value - 1;
};

const getSeatRowSortValue = (seat: SeatLayoutCellLike, fallbackIndex = 0) => {
  if (Number.isFinite(seat.rowIndex)) {
    return seat.rowIndex as number;
  }

  const parsedRowValue = rowLabelToSortValue(getRowLetters(seat.rowLabel, seat.seatCode, seat.label));

  return parsedRowValue ?? fallbackIndex;
};

const getSeatColumnSortValue = (seat: SeatLayoutCellLike, fallbackIndex = 0) => {
  if (Number.isFinite(seat.columnIndex)) {
    return seat.columnIndex as number;
  }

  if (Number.isFinite(seat.seatIndex)) {
    return seat.seatIndex as number;
  }

  if (Number.isFinite(seat.number)) {
    return seat.number as number;
  }

  return getFirstNumber(seat.seatCode, seat.label) ?? fallbackIndex;
};

export const sortSeatsInPhysicalOrder = <T extends SeatLayoutCellLike>(seats: T[]) =>
  [...seats].sort((firstSeat, secondSeat) => {
    const rowDiff =
      getSeatRowSortValue(firstSeat) - getSeatRowSortValue(secondSeat);

    if (rowDiff !== 0) {
      return rowDiff;
    }

    const columnDiff =
      getSeatColumnSortValue(firstSeat) - getSeatColumnSortValue(secondSeat);

    if (columnDiff !== 0) {
      return columnDiff;
    }

    return normalizeCoordinate(firstSeat.seatCode ?? '').localeCompare(
      normalizeCoordinate(secondSeat.seatCode ?? ''),
    );
  });

const normalizeLayoutRows = (layout: SeatLayoutRowLike[]) =>
  layout.map((row, rowIndex) => {
    if (Array.isArray(row)) {
      return {
        rowLabel: undefined,
        rowIndex,
        seats: row,
      };
    }

    return {
      rowLabel: row.rowLabel,
      rowIndex: row.rowIndex ?? rowIndex,
      seats: row.seats ?? [],
    };
  });

const isStructuralSeat = (seat: SeatLayoutCellLike) =>
  STRUCTURAL_SEAT_TYPES.has((seat.type ?? '').toLowerCase());

const isSelectableSeat = (seat: OrderedSeat) => {
  const seatType = (seat.type ?? '').toLowerCase();
  const stateStatus = seat.stateStatus.toLowerCase();

  return (
    !UNSELECTABLE_SEAT_TYPES.has(seatType) &&
    !UNSELECTABLE_STATE_STATUSES.has(stateStatus)
  );
};

export const groupSeatsByRow = (
  layout: SeatLayoutRowLike[],
  seatStates: ShowtimeSeatStateLike[] = [],
): SeatRowGroup[] => {
  const stateMap = new Map(
    seatStates.map((seatState) => [
      normalizeCoordinate(seatState.seatCode),
      seatState,
    ]),
  );
  const rowMap = new Map<string, SeatRowGroup>();

  normalizeLayoutRows(layout).forEach((row, rowFallbackIndex) => {
    row.seats.forEach((seat, columnFallbackIndex) => {
      const code = normalizeCoordinate(seat.seatCode ?? '');

      if (!code || isStructuralSeat(seat)) {
        return;
      }

      const seatState = stateMap.get(code);
      const rowSortValue = getSeatRowSortValue(
        {
          ...seat,
          rowLabel: seat.rowLabel ?? seatState?.rowLabel ?? row.rowLabel,
          rowIndex: seat.rowIndex ?? seatState?.rowIndex ?? row.rowIndex,
        },
        rowFallbackIndex,
      );
      const columnSortValue = getSeatColumnSortValue(
        {
          ...seat,
          columnIndex: seat.columnIndex ?? seatState?.columnIndex,
        },
        columnFallbackIndex,
      );
      const rowKey =
        seat.rowLabel ??
        seatState?.rowLabel ??
        row.rowLabel ??
        getRowLetters(seat.seatCode, seat.label) ??
        String(rowSortValue);
      const orderedSeat: OrderedSeat = {
        ...seat,
        code,
        label: seat.label ?? seatState?.label ?? code,
        rowKey,
        rowSortValue,
        columnSortValue,
        stateStatus: seatState?.status ?? seat.status ?? 'available',
      };
      const rowGroup = rowMap.get(rowKey) ?? {
        rowKey,
        rowSortValue,
        seats: [],
      };

      rowGroup.rowSortValue = Math.min(rowGroup.rowSortValue, rowSortValue);
      rowGroup.seats.push(orderedSeat);
      rowMap.set(rowKey, rowGroup);
    });
  });

  return [...rowMap.values()]
    .map((row) => ({
      ...row,
      seats: row.seats.sort(
        (firstSeat, secondSeat) =>
          firstSeat.columnSortValue - secondSeat.columnSortValue ||
          firstSeat.code.localeCompare(secondSeat.code),
      ),
    }))
    .sort(
      (firstRow, secondRow) =>
        firstRow.rowSortValue - secondRow.rowSortValue ||
        firstRow.rowKey.localeCompare(secondRow.rowKey),
    );
};

const findLastSelectedSeatIndex = (
  seats: OrderedSeat[],
  selectedSet: Set<string>,
) => {
  for (let index = seats.length - 1; index >= 0; index -= 1) {
    if (selectedSet.has(seats[index].code)) {
      return index;
    }
  }

  return -1;
};

export const getEdgeSeatSelectionConflict = (
  layout: SeatLayoutRowLike[],
  seatStates: ShowtimeSeatStateLike[] = [],
  selectedCodes: string[] = [],
): EdgeSeatSelectionConflict | null => {
  const selectedSet = new Set(selectedCodes.map(normalizeCoordinate));

  for (const row of groupSeatsByRow(layout, seatStates)) {
    const selectableSeats = row.seats.filter(isSelectableSeat);

    if (selectableSeats.length < 2) {
      continue;
    }

    const firstSelectedIndex = selectableSeats.findIndex((seat) =>
      selectedSet.has(seat.code),
    );

    if (firstSelectedIndex === 1) {
      const edgeSeat = selectableSeats[0];
      const adjacentSeat = selectableSeats[1];

      return {
        side: 'left',
        edgeCode: edgeSeat.code,
        edgeSeatLabel: edgeSeat.label,
        adjacentCode: adjacentSeat.code,
        adjacentSeatLabel: adjacentSeat.label,
        message: OUTER_EDGE_EMPTY_SEAT_WARNING,
      };
    }

    const lastSelectedIndex = findLastSelectedSeatIndex(selectableSeats, selectedSet);

    if (lastSelectedIndex === selectableSeats.length - 2) {
      const edgeSeat = selectableSeats[selectableSeats.length - 1];
      const adjacentSeat = selectableSeats[lastSelectedIndex];

      return {
        side: 'right',
        edgeCode: edgeSeat.code,
        edgeSeatLabel: edgeSeat.label,
        adjacentCode: adjacentSeat.code,
        adjacentSeatLabel: adjacentSeat.label,
        message: OUTER_EDGE_EMPTY_SEAT_WARNING,
      };
    }
  }

  return null;
};
