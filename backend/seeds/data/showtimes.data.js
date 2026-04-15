module.exports = [
  {
    key: "showtime_dune_ba_trieu_evening",
    movieKey: "movie_dune_part_two",
    cinemaKey: "cinema_cgv_vincom_ba_trieu",
    roomKey: "room_cgv_vincom_ba_trieu_1",
    startOffsetDays: 1,
    startHour: 18,
    startMinute: 30,
    seatStates: [
      {
        seatCoordinate: "A2",
        status: "paid",
        userKey: "nguyen_van_a",
      },
      {
        seatCoordinate: "A3",
        status: "paid",
        userKey: "nguyen_van_a",
      },
      {
        seatCoordinate: "B3",
        status: "held",
        userKey: "tran_thi_b",
        holdMinutes: 5,
      },
      {
        seatCoordinate: "F10",
        status: "reserved",
        userKey: "admin",
      },
    ],
  },
  {
    key: "showtime_inside_out_aeon_morning",
    movieKey: "movie_inside_out_2",
    cinemaKey: "cinema_cgv_aeon_long_bien",
    roomKey: "room_cgv_aeon_long_bien_1",
    startOffsetDays: 2,
    startHour: 10,
    startMinute: 0,
    seatStates: [],
  },
  {
    key: "showtime_interstellar_govap_night",
    movieKey: "movie_interstellar",
    cinemaKey: "cinema_lotte_govap",
    roomKey: "room_lotte_govap_1",
    startOffsetDays: 2,
    startHour: 20,
    startMinute: 15,
    seatStates: [
      {
        seatCoordinate: "C7",
        status: "paid",
        userKey: "tran_thi_b",
      },
      {
        seatCoordinate: "C8",
        status: "paid",
        userKey: "tran_thi_b",
      },
    ],
  },
  {
    key: "showtime_dune_da_nang_afternoon",
    movieKey: "movie_dune_part_two",
    cinemaKey: "cinema_cgv_vincom_da_nang",
    roomKey: "room_cgv_vincom_da_nang_1",
    startOffsetDays: 3,
    startHour: 15,
    startMinute: 45,
    seatStates: [
      {
        seatCoordinate: "A4",
        status: "held",
        userKey: "tran_thi_b",
        holdMinutes: 10,
      },
    ],
  },
];
