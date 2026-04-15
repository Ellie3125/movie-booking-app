import type { BookingStatus, PaymentMethod, UserProfile } from '@/lib/app-store';

const genreMap: Record<string, string> = {
  Action: 'Hành động',
  Adventure: 'Phiêu lưu',
  Animation: 'Hoạt hình',
  Comedy: 'Hài',
  Drama: 'Chính kịch',
  Family: 'Gia đình',
  'Sci-Fi': 'Khoa học viễn tưởng',
};

const languageMap: Record<string, string> = {
  'English subtitle': 'Tiếng Anh phụ đề',
  'Vietnamese dub': 'Lồng tiếng Việt',
};

const formatMap: Record<string, string> = {
  '2D': '2D',
  '2D Atmos': '2D Atmos',
  '2D Family': '2D gia đình',
  'Dolby Atmos': 'Dolby Atmos',
  Family: 'Suất gia đình',
  IMAX: 'IMAX',
  'IMAX Laser': 'IMAX Laser',
  'Premium 2D': '2D cao cấp',
  'Special Re-run': 'Suất chiếu đặc biệt',
};

const featureMap: Record<string, string> = {
  'Couple seats': 'Ghế đôi',
  'Family rooms': 'Phòng gia đình',
  'Food court nearby': 'Khu ẩm thực gần rạp',
  IMAX: 'IMAX',
  'Late sessions': 'Suất muộn',
  'Mall parking': 'Gửi xe trong trung tâm thương mại',
  'Parking in mall': 'Gửi xe trong trung tâm thương mại',
  'Premium seats': 'Ghế cao cấp',
  'Wide aisle': 'Lối đi rộng',
};

const cityMap: Record<string, string> = {
  'Ha Noi': 'Hà Nội',
  'Ho Chi Minh City': 'TP. Hồ Chí Minh',
};

const addressMap: Record<string, string> = {
  '191 Ba Trieu, Hai Ba Trung, Ha Noi': '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
  '27 Co Linh, Long Bien, Ha Noi': '27 Cổ Linh, Long Biên, Hà Nội',
  '242 Nguyen Van Luong, Go Vap, Ho Chi Minh City':
    '242 Nguyễn Văn Lượng, Gò Vấp, TP. Hồ Chí Minh',
};

const locationNameMap: Record<string, string> = {
  'Aeon Long Bien': 'Aeon Long Biên',
  'Go Vap': 'Gò Vấp',
  'Vincom Ba Trieu': 'Vincom Bà Triệu',
};

const roomNameMap: Record<string, string> = {
  'Gold Class': 'Phòng Gold Class',
  'Room 1': 'Phòng 1',
  'Room 2': 'Phòng 2',
};

const screenLabelMap: Record<string, string> = {
  'PREMIUM SCREEN': 'MÀN HÌNH CAO CẤP',
  'SCREEN 01': 'MÀN HÌNH 01',
  'SCREEN FAMILY': 'MÀN HÌNH GIA ĐÌNH',
};

const movieDescriptionMap: Record<string, string> = {
  'A return screening for one of the most expansive space epics ever projected.':
    'Suất chiếu trở lại của một trong những sử thi không gian đồ sộ nhất từng lên màn ảnh rộng.',
  'Coming soon campaign page with booking reminder and franchise demand metrics.':
    'Phim sắp chiếu với trang giới thiệu, nhắc mở bán vé và theo dõi độ quan tâm của khán giả.',
  'Paul Atreides returns to Arrakis and chooses war, prophecy, and impossible love.':
    'Paul Atreides trở lại Arrakis và phải chọn giữa chiến tranh, lời tiên tri và một tình yêu không thể.',
  'Riley enters the storm of teenage years and meets a louder emotional control room.':
    'Riley bước vào tuổi teen và đối diện với một bảng điều khiển cảm xúc ồn ào hơn bao giờ hết.',
};

const featuredNoteMap: Record<string, string> = {
  'Epic scale, premium sound, sold fast after 18:00.':
    'Quy mô hoành tráng, âm thanh cao cấp, thường hết chỗ rất nhanh sau 18:00.',
  'Family sessions are strongest on weekend mornings.':
    'Các suất gia đình thường đông nhất vào buổi sáng cuối tuần.',
  'Late-night audience, premium rows nearly full.':
    'Khán giả chuộng suất đêm, các hàng ghế đẹp thường gần kín.',
  'Open ticket alerts before pre-sale starts.':
    'Bật nhắc mở bán để không bỏ lỡ đợt pre-sale đầu tiên.',
};

const bookingStatusMap: Record<BookingStatus, string> = {
  cancelled: 'Đã hủy',
  held: 'Đang giữ ghế',
  paid: 'Đã thanh toán',
};

const paymentMethodMap: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  momo_sandbox: 'MoMo Sandbox',
  vnpay_sandbox: 'VNPay Sandbox',
};

export const translateRawText = (value: string, map: Record<string, string>) =>
  map[value] ?? value;

export const formatGenres = (values: string[]) =>
  values.map((value) => translateRawText(value, genreMap)).join(' • ');

export const formatLanguage = (value: string) => translateRawText(value, languageMap);

export const formatFormats = (values: string[]) =>
  values.map((value) => translateRawText(value, formatMap)).join(' • ');

export const formatShowtimeFormat = (value: string) => translateRawText(value, formatMap);

export const formatCinemaFeatures = (values: string[]) =>
  values.map((value) => translateRawText(value, featureMap)).join(' • ');

export const formatCity = (value: string) => translateRawText(value, cityMap);

export const formatAddress = (value: string) => translateRawText(value, addressMap);

export const formatLocationName = (value: string) =>
  translateRawText(value, locationNameMap);

export const formatRoomName = (value: string) => translateRawText(value, roomNameMap);

export const formatScreenLabel = (value: string) =>
  translateRawText(value, screenLabelMap);

export const formatMovieDescription = (value: string) =>
  translateRawText(value, movieDescriptionMap);

export const formatFeaturedNote = (value: string) =>
  translateRawText(value, featuredNoteMap);

export const formatBookingStatus = (value: BookingStatus) => bookingStatusMap[value] ?? value;

export const formatPaymentMethod = (value: PaymentMethod | null) =>
  value ? paymentMethodMap[value] ?? value : 'Chưa thanh toán';

export const formatRoleLabel = (role: UserProfile['role']) =>
  role === 'admin' ? 'Quản trị viên' : 'Người dùng';
