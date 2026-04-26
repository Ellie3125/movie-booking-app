import type { BookingStatus, PaymentMethod, UserProfile } from '@/lib/app-store';

const genreMap: Record<string, string> = {
  Action: 'Hành động',
  Adventure: 'Phiêu lưu',
  Animation: 'Hoạt hình',
  Comedy: 'Hài',
  Crime: 'Tội phạm',
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
  'Da Nang': 'Đà Nẵng',
  'Ha Noi': 'Hà Nội',
  'Ho Chi Minh City': 'TP. Hồ Chí Minh',
};

const addressMap: Record<string, string> = {
  '191 Ba Trieu, Hai Ba Trung, Ha Noi': '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
  '27 Co Linh, Long Bien, Ha Noi': '27 Cổ Linh, Long Biên, Hà Nội',
  'Ngo Quyen, Son Tra, Da Nang': 'Ngô Quyền, Sơn Trà, Đà Nẵng',
  'Me Tri, Nam Tu Liem, Ha Noi': 'Mễ Trì, Nam Từ Liêm, Hà Nội',
  '242 Nguyen Van Luong, Go Vap, Ho Chi Minh City':
    '242 Nguyễn Văn Lượng, Gò Vấp, TP. Hồ Chí Minh',
};

const locationNameMap: Record<string, string> = {
  'Aeon Long Bien': 'Aeon Long Biên',
  'Go Vap': 'Gò Vấp',
  'My Dinh': 'Mỹ Đình',
  'Vincom Ba Trieu': 'Vincom Bà Triệu',
  'Vincom Da Nang': 'Vincom Đà Nẵng',
};

const roomNameMap: Record<string, string> = {
  'Gold Class': 'Phòng Gold Class',
  'IMAX Hall': 'Phòng IMAX',
  'Premium Hall': 'Phòng Premium',
  'Room 1': 'Phòng 1',
  'Room 2': 'Phòng 2',
  'Room 3': 'Phòng 3',
  'Room 5': 'Phòng 5',
  'Standard 2': 'Phòng Standard 2',
};

const screenLabelMap: Record<string, string> = {
  'SCREEN 02': 'MÀN HÌNH 02',
  'SCREEN 03': 'MÀN HÌNH 03',
  'SCREEN BETA': 'MÀN HÌNH BETA',
  'SCREEN COSY': 'MÀN HÌNH COSY',
  'PREMIUM SCREEN': 'MÀN HÌNH CAO CẤP',
  'SCREEN 01': 'MÀN HÌNH 01',
  'SCREEN FAMILY': 'MÀN HÌNH GIA ĐÌNH',
  'SCREEN IMAX': 'MÀN HÌNH IMAX',
  'SCREEN MAX': 'MÀN HÌNH MAX',
  'SCREEN PREMIUM': 'MÀN HÌNH PREMIUM',
};

const movieDescriptionMap: Record<string, string> = {
  'A return screening for one of the most expansive space epics ever projected.':
    'Suất chiếu trở lại của một trong những sử thi không gian đồ sộ nhất từng lên màn ảnh rộng.',
  'Batman follows a darker trail of clues through Gotham as the city fractures under fear.':
    'Batman lần theo chuỗi manh mối đen tối xuyên qua Gotham khi thành phố rạn nứt trong sợ hãi.',
  'Coming soon campaign page with booking reminder and franchise demand metrics.':
    'Phim sắp chiếu với trang giới thiệu, nhắc mở bán vé và theo dõi độ quan tâm của khán giả.',
  'Po returns to protect the Valley of Peace and train the next warrior.':
    'Po trở lại để bảo vệ Thung lũng Bình Yên và huấn luyện chiến binh kế nhiệm.',
  'The Titans are forced into a new alliance when an ancient threat rises from Hollow Earth.':
    'Các Titan buộc phải liên minh trước một mối đe dọa cổ xưa trỗi dậy từ Hollow Earth.',
  'The most chaotic duo in Marvel collides with a mission that tears across the multiverse.':
    'Bộ đôi hỗn loạn nhất của Marvel lao vào một nhiệm vụ xé toạc đa vũ trụ.',
  'Paul Atreides returns to Arrakis and chooses war, prophecy, and impossible love.':
    'Paul Atreides trở lại Arrakis và phải chọn giữa chiến tranh, lời tiên tri và một tình yêu không thể.',
  'Riley enters the storm of teenage years and meets a louder emotional control room.':
    'Riley bước vào tuổi teen và đối diện với một bảng điều khiển cảm xúc ồn ào hơn bao giờ hết.',
};

const featuredNoteMap: Record<string, string> = {
  'Best tested with family flow and quick seat selection.':
    'Phù hợp để test flow gia đình và thao tác chọn ghế nhanh.',
  'Epic scale, premium sound, sold fast after 18:00.':
    'Quy mô hoành tráng, âm thanh cao cấp, thường hết chỗ rất nhanh sau 18:00.',
  'Family sessions are strongest on weekend mornings.':
    'Các suất gia đình thường đông nhất vào buổi sáng cuối tuần.',
  'Evening sessions are dense enough to test booked-seat states.':
    'Các suất tối đủ dày để test trạng thái ghế đã đặt.',
  'Large rooms and IMAX sessions are useful for seat-map stress tests.':
    'Phòng lớn và suất IMAX rất phù hợp để stress test sơ đồ ghế.',
  'Late-night audience, premium rows nearly full.':
    'Khán giả chuộng suất đêm, các hàng ghế đẹp thường gần kín.',
  'Late sessions keep selling out in the last row first.':
    'Các suất muộn thường kín hàng cuối trước tiên.',
  'Open ticket alerts before pre-sale starts.':
    'Bật nhắc mở bán để không bỏ lỡ đợt pre-sale đầu tiên.',
};

const bookingStatusMap: Record<BookingStatus, string> = {
  cancelled: 'Đã hủy',
  held: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
};

const paymentMethodMap: Record<PaymentMethod, string> = {
  mock_gateway: 'Cổng thanh toán',
  momo_sandbox: 'MoMo Sandbox',
  vnpay_sandbox: 'VNPay Sandbox',
};

const weekdayMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const padDatePart = (value: number) => String(value).padStart(2, '0');

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

export const getCalendarDateKey = (value: string) => {
  const date = new Date(value);

  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
};

export const formatShowtimeDayLabel = (value: string) => {
  const date = new Date(value);

  return `${weekdayMap[date.getDay()]} - ${padDatePart(date.getDate())}/${padDatePart(date.getMonth() + 1)}`;
};

export const formatShowtimeTime = (value: string) => {
  const date = new Date(value);

  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
};

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
