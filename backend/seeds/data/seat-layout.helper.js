const createSeatLayout = ({
  totalRows,
  totalColumns,
  hiddenCoordinates = [],
  seatTypeOverrides = {},
}) => {
  const hiddenSet = new Set(hiddenCoordinates.map((item) => item.toUpperCase()));

  return Array.from({ length: totalRows }, (_, rowIndex) => {
    const rowLabel = String.fromCharCode(65 + rowIndex);
    let visibleSeatIndex = 0;

    return Array.from({ length: totalColumns }, (_, columnIndex) => {
      const coordinateLabel = `${rowLabel}${columnIndex + 1}`;

      if (hiddenSet.has(coordinateLabel)) {
        return {
          cellType: "empty",
          coordinate: {
            rowIndex,
            columnIndex,
            coordinateLabel,
          },
          seatLabel: null,
          seatType: null,
          priceModifier: 0,
        };
      }

      visibleSeatIndex += 1;
      const seatType = seatTypeOverrides[coordinateLabel] ?? "standard";

      return {
        cellType: "seat",
        coordinate: {
          rowIndex,
          columnIndex,
          coordinateLabel,
        },
        seatLabel: `${rowLabel}${visibleSeatIndex}`,
        seatType,
        priceModifier: seatType === "couple" ? 1.5 : 1,
      };
    });
  });
};

const buildSeatStates = (seatLayout, overrides = []) => {
  const overrideMap = new Map(
    overrides.map((item) => [item.seatCoordinate.toUpperCase(), item]),
  );

  return seatLayout
    .flat()
    .filter((cell) => cell.cellType === "seat")
    .map((cell) => {
      const coordinate = cell.coordinate.coordinateLabel.toUpperCase();
      const override = overrideMap.get(coordinate);

      return {
        seatCoordinate: coordinate,
        seatLabel: cell.seatLabel,
        seatType: cell.seatType,
        status: override?.status ?? "available",
        userId: override?.userId ?? null,
        bookingId: override?.bookingId ?? null,
        heldAt: override?.heldAt ?? null,
        holdExpiresAt: override?.holdExpiresAt ?? null,
        paidAt: override?.paidAt ?? null,
      };
    });
};

module.exports = {
  createSeatLayout,
  buildSeatStates,
};
