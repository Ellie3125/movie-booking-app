const adjacentSeatRangePattern = /^([A-Z]+)([1-9]\d*)-\1([1-9]\d*)$/;

const normalizeSeatType = (seat = {}) =>
  String(seat.seatType || seat.type || '').trim().toLowerCase();

const isCoupleSeat = (seat = {}) =>
  normalizeSeatType(seat) === 'couple' || Number(seat.capacity) === 2;

const getSeatDisplayLabel = (seat = {}) => {
  const rawLabel = seat.seatLabel ?? seat.label ?? seat.seatCode ?? '';
  const label = String(rawLabel).trim().toUpperCase();

  if (!label || !isCoupleSeat(seat)) {
    return label;
  }

  const rangeMatch = label.match(adjacentSeatRangePattern);
  if (!rangeMatch) {
    return label;
  }

  const firstSeatNumber = Number(rangeMatch[2]);
  const secondSeatNumber = Number(rangeMatch[3]);

  if (secondSeatNumber !== firstSeatNumber + 1) {
    return label;
  }

  const displaySeatNumber = Math.ceil(firstSeatNumber / 2);

  return `${rangeMatch[1]}${displaySeatNumber}`;
};

module.exports = {
  getSeatDisplayLabel,
};
