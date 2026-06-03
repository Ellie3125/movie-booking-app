const rowLetter = (rowIndex) => String.fromCharCode(65 + rowIndex);

const buildCoordinateLabel = (rowIndex, columnIndex) =>
  `${rowLetter(rowIndex)}${columnIndex + 1}`;

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
    const rowLabel = rowLetter(rowIndex);
    const seats = [];

    for (let columnIndex = 0; columnIndex < totalColumns; columnIndex++) {
      const seatCode = buildCoordinateLabel(rowIndex, columnIndex);
      const isHidden = hiddenSet.has(seatCode);
      
      const seatType = isHidden ? 'empty' : (seatTypeOverrides[seatCode] ?? 'regular');
      
      const seat = {
        label: isHidden ? null : seatCode,
        rowLabel,
        seatCode,
        rowIndex,
        columnIndex,
        type: seatType,
        status: 'active',
        capacity: seatType === 'couple' ? 2 : (['empty', 'aisle', 'disabled'].includes(seatType) ? 0 : 1),
        size: 1,
        priceType: seatType === 'couple' ? 'couple' : (seatType === 'vip' ? 'vip' : 'regular'),
        coupleGroupId: null, // To be filled by editor or logic if needed
      };

      seats.push(seat);
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

  const bookableSeats = allSeats.filter(
    (seat) => !['empty', 'aisle', 'space'].includes(seat.type)
  );

  return bookableSeats.map((seat) => {
    // Snapshot ALL fields for Showtime
    return {
      seatCode: seat.seatCode,
      label: seat.label,
      rowLabel: seat.rowLabel,
      rowIndex: seat.rowIndex,
      columnIndex: seat.columnIndex,
      type: seat.type,
      capacity: seat.capacity,
      coupleGroupId: seat.coupleGroupId,
      
      // Initial status
      status: seat.status === 'disabled' || seat.type === 'disabled' ? 'disabled' : 'available',
      userId: null,
      bookingId: null,
      heldAt: null,
      holdExpiresAt: null,
      bookedAt: null,
    };
  });
};

module.exports = {
  buildShowtimeSeatStatesFromRoomLayout,
  flattenRoomSeats,
  createSeatLayout,
};
