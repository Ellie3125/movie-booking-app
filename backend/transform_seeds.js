const fs = require('fs');
const path = require('path');

const ROOM_DATA_PATH = path.resolve(__dirname, 'seeds/data/rooms.data.js');

if (!fs.existsSync(ROOM_DATA_PATH)) {
  console.error(`File not found: ${ROOM_DATA_PATH}`);
  process.exit(1);
}

const rooms = require(ROOM_DATA_PATH);

const transformSeats = (layout) => {
  return layout.map(row => {
    return {
      rowLabel: row.rowLabel,
      seats: row.seats.map(seat => {
        const type = seat.type === 'space' ? 'empty' : seat.type;
        const isSellable = ['regular', 'vip', 'couple'].includes(type);
        
        const newSeat = {
          seatCode: seat.seatCode,
          rowIndex: seat.rowIndex,
          columnIndex: seat.columnIndex,
          type: type,
          status: isSellable ? 'active' : 'disabled',
          label: isSellable ? (seat.label || seat.seatCode) : '',
          capacity: type === 'couple' ? 2 : (isSellable ? 1 : 0)
        };

        if (type === 'couple') {
          // If it's a couple seat, it might need a coupleGroupId if not present
          // For simplicity, we can use a group ID based on its position if missing
          newSeat.coupleGroupId = seat.coupleGroupId || `grp_${seat.rowIndex}_${seat.columnIndex}`;
        }

        if (isSellable) {
          newSeat.priceType = type;
        }

        return newSeat;
      })
    };
  });
};

const transformedRooms = rooms.map(room => ({
  ...room,
  seatLayout: transformSeats(room.seatLayout)
}));

const fileContent = `module.exports = ${JSON.stringify(transformedRooms, null, 2)};\n`;

fs.writeFileSync(ROOM_DATA_PATH, fileContent);
console.log(`Transformed ${rooms.length} rooms in ${ROOM_DATA_PATH}`);
