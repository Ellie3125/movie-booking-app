/**
 * Merges Room seat layout with Showtime seat states.
 * 
 * @param {Array} seatLayout - Array of rows from Room model
 * @param {Array} seatStates - Array of seat states from Showtime model
 * @returns {Array} - Merged layout with status, userId, etc.
 */
const mergeLayoutWithStates = (seatLayout = [], seatStates = []) => {
  const stateMap = new Map(
    (seatStates || []).map(state => [state.seatCoordinate.toUpperCase(), state])
  );

  return seatLayout.map(row => ({
    rowLabel: row.rowLabel,
    seats: (row.seats || []).map(seat => {
      const state = stateMap.get(seat.seatCode.toUpperCase());
      
      // Merge logic:
      // 1. If seat exists in Room layout, it's the base.
      // 2. If it has an entry in Showtime seatStates, override status.
      // 3. Otherwise, default status is 'available'.
      return {
        ...seat.toObject ? seat.toObject() : seat,
        status: state ? state.status : 'available',
        userId: state?.userId || null,
        bookingId: state?.bookingId || null,
        heldAt: state?.heldAt || null,
        holdExpiresAt: state?.holdExpiresAt || null,
        paidAt: state?.paidAt || null,
      };
    })
  }));
};

/**
 * Validates a seat layout for consistency and constraints.
 * 
 * @param {Array} seatLayout - The layout to validate
 * @throws {Error} - If validation fails
 */
const validateSeatLayout = (seatLayout) => {
  if (!Array.isArray(seatLayout)) {
    throw new Error('Seat layout must be an array');
  }

  const seatCodes = new Set();

  seatLayout.forEach((row, rowIndex) => {
    if (!row.rowLabel) throw new Error(`Row at index ${rowIndex} missing rowLabel`);
    if (!Array.isArray(row.seats)) throw new Error(`Row ${row.rowLabel} missing seats array`);

    row.seats.forEach((seat, seatIndex) => {
      if (!seat.seatCode) throw new Error(`Seat at row ${row.rowLabel} index ${seatIndex} missing seatCode`);
      
      // 1. Unique seatCode
      if (seatCodes.has(seat.seatCode)) {
        throw new Error(`Duplicate seat code found: ${seat.seatCode}`);
      }
      seatCodes.add(seat.seatCode);

      // 2. Business Rules Validation
      const { type, label, status, priceType, capacity, size } = seat;

      if (type === 'regular' || type === 'vip') {
        if (!label) throw new Error(`Seat ${seat.seatCode} (${type}) missing label`);
        if (!status) throw new Error(`Seat ${seat.seatCode} (${type}) missing status`);
        if (!priceType) throw new Error(`Seat ${seat.seatCode} (${type}) missing priceType`);
        if (capacity !== 1) throw new Error(`Seat ${seat.seatCode} (${type}) must have capacity = 1`);
      } else if (type === 'couple') {
        if (!label) throw new Error(`Seat ${seat.seatCode} (couple) missing label`);
        if (!status) throw new Error(`Seat ${seat.seatCode} (couple) missing status`);
        if (priceType !== 'couple') throw new Error(`Seat ${seat.seatCode} (couple) must have priceType = "couple"`);
        if (capacity !== 2) throw new Error(`Seat ${seat.seatCode} (couple) must have capacity = 2`);
      } else if (type === 'disabled') {
        if (status !== 'disabled') throw new Error(`Seat ${seat.seatCode} (disabled) must have status = "disabled"`);
        // Disabled seats can have labels but shouldn't have capacity/priceType for sale
      } else if (type === 'space') {
        if (capacity && capacity !== 0) throw new Error(`Space at ${seat.seatCode} must have capacity = 0`);
        if (size < 0) throw new Error(`Space at ${seat.seatCode} must have size >= 0`);
      }
    });
  });
};

module.exports = {
  mergeLayoutWithStates,
  validateSeatLayout,
};
