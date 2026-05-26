// Script to add rooms for new cinemas
const fs = require('fs');
const path = require('path');

const roomsPath = path.join(__dirname, 'data', 'rooms.data.js');

// Read existing rooms and extract the seatLayout from the first room as template
const existingRooms = require('./data/rooms.data.js');
const templateSeatLayout = existingRooms[0].seatLayout; // Phòng 1 STANDARD from CGV Vincom

// New cinemas that need rooms
const newCinemas = [
  { cinemaId: "a1b2c3d4e5f6a7b8c9d0e1f2", name: "Cinestar Quốc Thanh" },
  { cinemaId: "b2c3d4e5f6a7b8c9d0e1f2a3", name: "CGV Landmark 81" },
  { cinemaId: "c3d4e5f6a7b8c9d0e1f2a3b4", name: "Lotte Cinema Nam Sài Gòn" },
  { cinemaId: "d4e5f6a7b8c9d0e1f2a3b4c5", name: "BHD Star Phạm Hùng" },
  { cinemaId: "e5f6a7b8c9d0e1f2a3b4c5d6", name: "Galaxy Nguyễn Du" },
  { cinemaId: "f6a7b8c9d0e1f2a3b4c5d6e7", name: "Mega GS Cao Thắng" },
];

// Generate unique _id for each room
const makeId = (index) => {
  const hex = "0123456789abcdef";
  let id = "";
  // Use a deterministic seed based on index for reproducibility
  const seed = `room_new_${index}_seed`;
  for (let i = 0; i < 24; i++) {
    id += hex[(seed.charCodeAt(i % seed.length) + i * 7 + index * 13) % 16];
  }
  return id;
};

const newRooms = [];
let roomIndex = 0;

for (const cinema of newCinemas) {
  // Room 1: Standard
  newRooms.push({
    _id: makeId(roomIndex++),
    cinemaId: cinema.cinemaId,
    name: "Phòng 1 (STANDARD)",
    roomType: "standard",
    seatLayout: JSON.parse(JSON.stringify(templateSeatLayout))
  });

  // Room 2: VIP (use same layout but different type)
  newRooms.push({
    _id: makeId(roomIndex++),
    cinemaId: cinema.cinemaId,
    name: "Phòng 2 (VIP)",
    roomType: "vip",
    seatLayout: JSON.parse(JSON.stringify(templateSeatLayout))
  });
}

// Read the existing file content
let fileContent = fs.readFileSync(roomsPath, 'utf-8');

// Find the last '];\n' and insert new rooms before it
const lastBracket = fileContent.lastIndexOf('];');
if (lastBracket === -1) {
  console.error('Could not find closing bracket in rooms.data.js');
  process.exit(1);
}

// Build the new rooms JSON
const newRoomsJson = newRooms.map(room => JSON.stringify(room, null, 2)).join(',\n  ');

// Insert after the last room (before the closing bracket)
const beforeBracket = fileContent.substring(0, lastBracket).trimEnd();
const afterBracket = fileContent.substring(lastBracket);

// Make sure we add a comma after the last existing room
const newContent = beforeBracket + ',\n  ' + newRoomsJson + '\n' + afterBracket;

fs.writeFileSync(roomsPath, newContent, 'utf-8');
console.log(`Added ${newRooms.length} new rooms for ${newCinemas.length} new cinemas`);
console.log('Room IDs:');
newRooms.forEach(r => console.log(`  ${r._id} -> ${r.name} (${r.cinemaId.substring(0, 8)}...)`));
