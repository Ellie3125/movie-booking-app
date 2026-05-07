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

  const layout = [];
  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    const rowLabel = String.fromCharCode(65 + rowIndex);
    const seats = [];
    let visibleSeatIndex = 0;

    for (let columnIndex = 0; columnIndex < totalColumns; columnIndex++) {
      const coordinateLabel = `${rowLabel}${columnIndex + 1}`;

      if (hiddenSet.has(coordinateLabel)) {
        seats.push({
          label: null,
          seatCode: coordinateLabel,
          rowIndex,
          columnIndex,
          type: 'space',
          status: 'active',
          capacity: 0,
          size: 1,
        });
      } else {
        visibleSeatIndex += 1;
        const seatType = seatTypeOverrides[coordinateLabel] ?? 'regular';
        seats.push({
          label: coordinateLabel,
          seatCode: coordinateLabel,
          rowIndex,
          columnIndex,
          type: seatType,
          status: 'active',
          priceType: seatType === 'couple' ? 'couple' : (seatType === 'vip' ? 'vip' : 'regular'),
          capacity: seatType === 'couple' ? 2 : 1,
          size: 1,
        });
      }
    }
    layout.push({ rowLabel, seats });
  }
  return layout;
};

const flattenRoomSeats = (seatLayout = []) => {
  if (!Array.isArray(seatLayout)) return [];
  return seatLayout.flatMap(row => row.seats || []);
};

const buildShowtimeSeatStatesFromRoomLayout = (
  seatLayout = []
) => {
  const allSeats = flattenRoomSeats(seatLayout);

  return allSeats
    .filter(seat => 
      seat.status === 'active' && 
      seat.type !== 'space' && 
      seat.type !== 'disabled'
    )
    .map((seat) => {
      return {
        seatCoordinate: seat.seatCode,
        status: 'available',
        userId: null,
        bookingId: null,
        heldAt: null,
        holdExpiresAt: null,
        paidAt: null,
      };
    });
};

module.exports = {
  buildShowtimeSeatStatesFromRoomLayout,
  flattenRoomSeats,
  createSeatLayout,
};
