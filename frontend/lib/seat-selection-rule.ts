type SeatLayoutCellLike = {
  cellType: 'seat' | 'empty';
  coordinate: {
    coordinateLabel: string;
  };
  seatLabel: string | null;
};

type ShowtimeSeatStateLike = {
  seatCoordinate: string;
  status: string;
};

export type EdgeSeatSelectionConflict = {
  side: 'left' | 'right';
  edgeCoordinate: string;
  edgeSeatLabel: string;
  adjacentCoordinate: string;
  adjacentSeatLabel: string;
  message: string;
};

const normalizeCoordinate = (value: string) => value.trim().toUpperCase();

const buildConflictMessage = (seatLabel: string) =>
  `Không thể để trống ghế ngoài cùng ${seatLabel}. Hãy chọn thêm ${seatLabel} hoặc đổi ghế khác.`;

export const getEdgeSeatSelectionConflict = (
  layout: SeatLayoutCellLike[][],
  seatStates: ShowtimeSeatStateLike[] = [],
  selectedCoordinates: string[] = [],
): EdgeSeatSelectionConflict | null => {
  const stateMap = new Map(
    seatStates.map((seatState) => [
      normalizeCoordinate(seatState.seatCoordinate),
      seatState,
    ]),
  );
  const selectedSet = new Set(selectedCoordinates.map(normalizeCoordinate));

  for (const row of layout) {
    const rowSeats = row
      .filter((seat) => seat.cellType === 'seat')
      .map((seat) => {
        const coordinate = normalizeCoordinate(seat.coordinate.coordinateLabel);

        return {
          coordinate,
          label: seat.seatLabel ?? coordinate,
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
        edgeCoordinate: firstSeat.coordinate,
        edgeSeatLabel: firstSeat.label,
        adjacentCoordinate: secondSeat.coordinate,
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
        edgeCoordinate: lastSeat.coordinate,
        edgeSeatLabel: lastSeat.label,
        adjacentCoordinate: beforeLastSeat.coordinate,
        adjacentSeatLabel: beforeLastSeat.label,
        message: buildConflictMessage(lastSeat.label),
      };
    }
  }

  return null;
};
