type SeatLayoutCellLike = {
  type: string;
  seatCode: string;
  label?: string;
};

type ShowtimeSeatStateLike = {
  seatCode: string;
  status: string;
};

export type EdgeSeatSelectionConflict = {
  side: 'left' | 'right';
  edgeCode: string;
  edgeSeatLabel: string;
  adjacentCode: string;
  adjacentSeatLabel: string;
  message: string;
};

const normalizeCoordinate = (value: string) => value.trim().toUpperCase();

const buildConflictMessage = (seatLabel: string) =>
  `Không thể để trống ghế ngoài cùng ${seatLabel}. Hãy chọn thêm ${seatLabel} hoặc đổi ghế khác.`;

export const getEdgeSeatSelectionConflict = (
  layout: SeatLayoutCellLike[][],
  seatStates: ShowtimeSeatStateLike[] = [],
  selectedCodes: string[] = [],
): EdgeSeatSelectionConflict | null => {
  const stateMap = new Map(
    seatStates.map((seatState) => [
      normalizeCoordinate(seatState.seatCode),
      seatState,
    ]),
  );
  const selectedSet = new Set(selectedCodes.map(normalizeCoordinate));

  for (const row of layout) {
    const rowSeats = row
      .filter((seat) => seat.type !== 'space')
      .map((seat) => {
        const coordinate = normalizeCoordinate(seat.seatCode);

        return {
          code: coordinate,
          label: seat.label ?? coordinate,
          isSelected: selectedSet.has(coordinate),
          status: stateMap.get(coordinate)?.status ?? 'available',
        };
      });

    if (rowSeats.length < 2) {
      continue;
    }

    const firstSeat = rowSeats[0];
    const secondSeat = rowSeats[1];

    if (
      firstSeat.status === 'available' &&
      !firstSeat.isSelected &&
      secondSeat.isSelected
    ) {
      return {
        side: 'left',
        edgeCode: firstSeat.code,
        edgeSeatLabel: firstSeat.label,
        adjacentCode: secondSeat.code,
        adjacentSeatLabel: secondSeat.label,
        message: buildConflictMessage(firstSeat.label),
      };
    }

    const lastSeat = rowSeats[rowSeats.length - 1];
    const beforeLastSeat = rowSeats[rowSeats.length - 2];

    if (
      lastSeat.status === 'available' &&
      !lastSeat.isSelected &&
      beforeLastSeat.isSelected
    ) {
      return {
        side: 'right',
        edgeCode: lastSeat.code,
        edgeSeatLabel: lastSeat.label,
        adjacentCode: beforeLastSeat.code,
        adjacentSeatLabel: beforeLastSeat.label,
        message: buildConflictMessage(lastSeat.label),
      };
    }
  }

  return null;
};
