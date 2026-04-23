const rowLetter = (rowIndex) => String.fromCharCode(65 + rowIndex);

const buildCoordinateLabel = (rowIndex, columnIndex) =>
  `${rowLetter(rowIndex)}${columnIndex + 1}`;

const createSeatCell = (rowIndex, columnIndex, seatNumber, seatType) => ({
  cellType: 'seat',
  coordinate: {
    rowIndex,
    columnIndex,
    coordinateLabel: buildCoordinateLabel(rowIndex, columnIndex),
  },
  seatLabel: `${rowLetter(rowIndex)}${seatNumber}`,
  seatType,
  priceModifier: seatType === 'couple' ? 1.5 : 1,
});

const createEmptyCell = (rowIndex, columnIndex) => ({
  cellType: 'empty',
  coordinate: {
    rowIndex,
    columnIndex,
    coordinateLabel: buildCoordinateLabel(rowIndex, columnIndex),
  },
  seatLabel: null,
  seatType: null,
  priceModifier: 0,
});

const createSeatLayout = ({
  totalRows,
  totalColumns,
  hiddenCoordinates = [],
  seatTypeOverrides = {},
}) => {
  const hiddenSet = new Set(
    hiddenCoordinates.map((coordinate) => String(coordinate).trim().toUpperCase())
  );

  return Array.from({ length: totalRows }, (_, rowIndex) => {
    let visibleSeatIndex = 0;

    return Array.from({ length: totalColumns }, (_, columnIndex) => {
      const coordinateLabel = buildCoordinateLabel(rowIndex, columnIndex);

      if (hiddenSet.has(coordinateLabel)) {
        return createEmptyCell(rowIndex, columnIndex);
      }

      visibleSeatIndex += 1;
      const seatType = seatTypeOverrides[coordinateLabel] ?? 'standard';

      return createSeatCell(rowIndex, columnIndex, visibleSeatIndex, seatType);
    });
  });
};

const flattenRoomSeats = (seatLayout = []) =>
  seatLayout.flat().filter((cell) => cell && cell.cellType === 'seat');

const extractSeatTypeOverrides = (seatLayout = []) =>
  Object.fromEntries(
    flattenRoomSeats(seatLayout)
      .filter((cell) => typeof cell.seatType === 'string' && cell.seatType)
      .map((cell) => [
        String(cell.coordinate.coordinateLabel).toUpperCase(),
        cell.seatType,
      ])
  );

const buildShowtimeSeatStatesFromRoomLayout = (
  seatLayout = [],
  currentSeatStates = []
) => {
  const currentMap = new Map(
    currentSeatStates.map((seatState) => [
      String(seatState.seatCoordinate).toUpperCase(),
      seatState,
    ])
  );

  return flattenRoomSeats(seatLayout).map((seat) => {
    const coordinate = String(seat.coordinate.coordinateLabel).toUpperCase();
    const previous = currentMap.get(coordinate);

    return {
      seatCoordinate: coordinate,
      seatLabel: seat.seatLabel || coordinate,
      seatType: seat.seatType || 'standard',
      status: previous?.status || 'available',
      userId: previous?.userId || null,
      bookingId: previous?.bookingId || null,
      heldAt: previous?.heldAt || null,
      holdExpiresAt: previous?.holdExpiresAt || null,
      paidAt: previous?.paidAt || null,
    };
  });
};

module.exports = {
  buildShowtimeSeatStatesFromRoomLayout,
  createSeatLayout,
  extractSeatTypeOverrides,
  flattenRoomSeats,
};
