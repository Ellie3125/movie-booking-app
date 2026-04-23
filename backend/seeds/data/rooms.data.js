const { createSeatLayout } = require("./seat-layout.helper");

const createRoomTemplate = () => ({
  totalRows: 6,
    totalColumns: 10,
    seatLayout: createSeatLayout({
      totalRows: 6,
      totalColumns: 10,
      hiddenCoordinates: ["A5", "A6", "B6", "C5", "C6", "D6", "E6", "F5"],
      seatTypeOverrides: {
        E9: "couple",
        E10: "couple",
        F9: "couple",
        F10: "couple",
      },
    }),
});

const createLargeRoomTemplate = () => ({
  totalRows: 8,
  totalColumns: 12,
  seatLayout: createSeatLayout({
    totalRows: 8,
    totalColumns: 12,
    hiddenCoordinates: [
      "A6",
      "A7",
      "B6",
      "B7",
      "C6",
      "C7",
      "D6",
      "D7",
      "E6",
      "E7",
      "F6",
      "F7",
      "G6",
      "G7",
    ],
    seatTypeOverrides: {
      G9: "couple",
      G10: "couple",
      G11: "couple",
      H9: "couple",
      H10: "couple",
      H11: "couple",
      H12: "couple",
    },
  }),
});

const createCompactRoomTemplate = () => ({
  totalRows: 5,
  totalColumns: 8,
  seatLayout: createSeatLayout({
    totalRows: 5,
    totalColumns: 8,
    hiddenCoordinates: ["A4", "B4", "C4", "D4", "E4"],
    seatTypeOverrides: {
      E7: "couple",
      E8: "couple",
    },
  }),
});

const createPremiumRoomTemplate = () => ({
  totalRows: 5,
  totalColumns: 6,
  seatLayout: createSeatLayout({
    totalRows: 5,
    totalColumns: 6,
    hiddenCoordinates: ["A3", "B3", "C3", "D3", "E3"],
    seatTypeOverrides: {
      D5: "couple",
      D6: "couple",
      E5: "couple",
      E6: "couple",
    },
  }),
});

module.exports = [
  {
    key: "room_cgv_vincom_ba_trieu_1",
    cinemaKey: "cinema_cgv_vincom_ba_trieu",
    name: "Phòng 1",
    screenLabel: "SCREEN 01",
    ...createRoomTemplate(),
  },
  {
    key: "room_cgv_vincom_ba_trieu_2",
    cinemaKey: "cinema_cgv_vincom_ba_trieu",
    name: "Phòng IMAX",
    screenLabel: "SCREEN IMAX",
    ...createLargeRoomTemplate(),
  },
  {
    key: "room_cgv_aeon_long_bien_1",
    cinemaKey: "cinema_cgv_aeon_long_bien",
    name: "Phòng 2",
    screenLabel: "SCREEN FAMILY",
    ...createRoomTemplate(),
  },
  {
    key: "room_cgv_aeon_long_bien_2",
    cinemaKey: "cinema_cgv_aeon_long_bien",
    name: "Phòng 5",
    screenLabel: "SCREEN MAX",
    ...createLargeRoomTemplate(),
  },
  {
    key: "room_beta_my_dinh_1",
    cinemaKey: "cinema_beta_my_dinh",
    name: "Phòng 1",
    screenLabel: "SCREEN BETA",
    ...createRoomTemplate(),
  },
  {
    key: "room_beta_my_dinh_2",
    cinemaKey: "cinema_beta_my_dinh",
    name: "Phòng 2",
    screenLabel: "SCREEN COSY",
    ...createCompactRoomTemplate(),
  },
  {
    key: "room_lotte_govap_1",
    cinemaKey: "cinema_lotte_govap",
    name: "Gold Class",
    screenLabel: "PREMIUM SCREEN",
    totalRows: 4,
    totalColumns: 8,
    seatLayout: createSeatLayout({
      totalRows: 4,
      totalColumns: 8,
      hiddenCoordinates: ["A4", "B4", "C4", "D4"],
      seatTypeOverrides: {
        C7: "couple",
        C8: "couple",
        D7: "couple",
        D8: "couple",
      },
    }),
  },
  {
    key: "room_lotte_govap_2",
    cinemaKey: "cinema_lotte_govap",
    name: "Standard 2",
    screenLabel: "SCREEN 02",
    ...createCompactRoomTemplate(),
  },
  {
    key: "room_cgv_vincom_da_nang_1",
    cinemaKey: "cinema_cgv_vincom_da_nang",
    name: "Phòng 3",
    screenLabel: "SCREEN 03",
    ...createRoomTemplate(),
  },
  {
    key: "room_cgv_vincom_da_nang_2",
    cinemaKey: "cinema_cgv_vincom_da_nang",
    name: "Phòng Premium",
    screenLabel: "SCREEN PREMIUM",
    ...createPremiumRoomTemplate(),
  },
];
