const { createSeatLayout } = require("./seat-layout.helper");

const createRoomTemplate = () => ({
  totalRows: 6,
  totalColumns: 10,
  seatLayout: createSeatLayout({
    totalRows: 6,
    totalColumns: 10,
    hiddenCoordinates: ["A1", "A6", "B6", "C1", "C6", "D6", "E6", "F1"],
    seatTypeOverrides: {
      D9: "vip",
      D10: "vip",
      E9: "couple",
      E10: "couple",
      F8: "vip",
      F9: "couple",
      F10: "couple",
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
    key: "room_cgv_aeon_long_bien_1",
    cinemaKey: "cinema_cgv_aeon_long_bien",
    name: "Phòng 2",
    screenLabel: "SCREEN FAMILY",
    ...createRoomTemplate(),
  },
  {
    key: "room_beta_my_dinh_1",
    cinemaKey: "cinema_beta_my_dinh",
    name: "Phòng 1",
    screenLabel: "SCREEN BETA",
    ...createRoomTemplate(),
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
        A7: "vip",
        A8: "vip",
        B7: "vip",
        B8: "vip",
        C7: "couple",
        C8: "couple",
        D7: "couple",
        D8: "couple",
      },
    }),
  },
  {
    key: "room_cgv_vincom_da_nang_1",
    cinemaKey: "cinema_cgv_vincom_da_nang",
    name: "Phòng 3",
    screenLabel: "SCREEN 03",
    ...createRoomTemplate(),
  },
];
