import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Fonts } from '@/constants/theme';

const SECTIONS = [
  {
    number: 1,
    title: 'Thu thập dữ liệu',
    body: 'CineMax thu thập các thông tin cần thiết để cung cấp dịch vụ tốt nhất cho bạn, bao gồm:\n\n• Thông tin cá nhân: Họ tên, địa chỉ email, số điện thoại, ngày sinh và giới tính khi bạn đăng ký tài khoản.\n\n• Lịch sử đặt vé: Các giao dịch đặt vé, phim đã xem, rạp thường đến và phương thức thanh toán đã sử dụng.\n\n• Thông tin thiết bị: Loại thiết bị, hệ điều hành, phiên bản ứng dụng và dữ liệu vị trí (khi bạn cho phép) để gợi ý rạp gần bạn nhất.',
  },
  {
    number: 2,
    title: 'Mục đích sử dụng',
    body: 'Chúng tôi sử dụng dữ liệu thu thập được cho các mục đích sau:\n\n• Quản lý tài khoản: Xác thực danh tính, duy trì và bảo mật tài khoản của bạn.\n\n• Xử lý đặt vé: Thực hiện giao dịch đặt vé, gửi vé điện tử và xác nhận thanh toán.\n\n• Gợi ý cá nhân hoá: Đề xuất phim, rạp chiếu và ưu đãi phù hợp dựa trên sở thích và lịch sử xem phim của bạn.\n\n• Cải thiện dịch vụ: Phân tích hành vi sử dụng để nâng cao trải nghiệm ứng dụng.',
  },
  {
    number: 3,
    title: 'Bảo mật dữ liệu',
    body: 'CineMax cam kết bảo vệ dữ liệu cá nhân của bạn bằng các biện pháp sau:\n\n• Mã hoá dữ liệu: Tất cả thông tin nhạy cảm được mã hoá bằng giao thức SSL/TLS trong quá trình truyền tải và mã hoá AES-256 khi lưu trữ.\n\n• Kiểm soát truy cập: Chỉ nhân viên được uỷ quyền mới có quyền truy cập vào dữ liệu người dùng, và mọi truy cập đều được ghi nhận và giám sát.\n\n• Sao lưu định kỳ: Dữ liệu được sao lưu thường xuyên để đảm bảo khả năng phục hồi trong trường hợp sự cố.',
  },
  {
    number: 4,
    title: 'Chia sẻ thông tin',
    body: 'CineMax cam kết không bán thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào. Chúng tôi chỉ chia sẻ dữ liệu trong các trường hợp sau:\n\n• Đối tác rạp chiếu: Chia sẻ thông tin đặt vé cần thiết để rạp phục vụ bạn (tên, mã vé).\n\n• Đối tác thanh toán: Cung cấp thông tin giao dịch cho cổng thanh toán để xử lý thanh toán an toàn.\n\n• Yêu cầu pháp lý: Cung cấp thông tin khi có yêu cầu từ cơ quan chức năng có thẩm quyền theo quy định pháp luật.',
  },
  {
    number: 5,
    title: 'Cookies & Tracking',
    body: 'Ứng dụng CineMax sử dụng các công nghệ theo dõi để cải thiện trải nghiệm người dùng:\n\n• Cookies phiên: Duy trì trạng thái đăng nhập và giỏ vé của bạn trong quá trình sử dụng ứng dụng.\n\n• Analytics: Sử dụng công cụ phân tích để hiểu cách người dùng tương tác với ứng dụng, từ đó cải thiện giao diện và tính năng.\n\n• Bạn có thể tắt một số cookie không cần thiết trong phần Cài đặt của ứng dụng. Tuy nhiên, việc này có thể ảnh hưởng đến một số tính năng.',
  },
  {
    number: 6,
    title: 'Quyền của người dùng',
    body: 'Bạn có các quyền sau đối với dữ liệu cá nhân của mình:\n\n• Quyền truy cập: Xem toàn bộ thông tin cá nhân mà CineMax đang lưu trữ về bạn bất kỳ lúc nào.\n\n• Quyền chỉnh sửa: Cập nhật, sửa đổi thông tin cá nhân khi thông tin không còn chính xác.\n\n• Quyền xoá: Yêu cầu xoá toàn bộ dữ liệu cá nhân và tài khoản. Lưu ý rằng một số dữ liệu giao dịch có thể được giữ lại theo yêu cầu pháp lý.\n\n• Quyền phản đối: Từ chối việc sử dụng dữ liệu cho mục đích marketing.',
  },
  {
    number: 7,
    title: 'Liên hệ',
    body: 'Nếu bạn có bất kỳ thắc mắc hoặc yêu cầu nào liên quan đến chính sách bảo mật, vui lòng liên hệ với chúng tôi qua:\n\n• Email: privacy@cinemax.vn\n• Hotline: 1900-0000 (Thứ 2 - Chủ nhật, 8:00 - 22:00)\n• Địa chỉ: Tầng 10, Toà nhà CineMax Tower, Quận 1, TP. Hồ Chí Minh\n\nChúng tôi cam kết phản hồi mọi yêu cầu liên quan đến bảo mật trong vòng 48 giờ làm việc.',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo & Header */}
      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={48} color="#E87A22" />
        </View>
        <Text style={styles.title}>Chính sách bảo mật</Text>
        <Text style={styles.subtitle}>CineMax - Ứng dụng đặt vé xem phim</Text>
        <Text style={styles.updatedText}>Cập nhật lần cuối: 01/01/2025</Text>
      </View>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <View key={section.number} style={styles.card}>
          <Text style={styles.sectionTitle}>
            {section.number}. {section.title}
          </Text>
          <Text style={styles.sectionBody}>{section.body}</Text>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons name="lock-closed-outline" size={16} color="#8A6A50" />
        <Text style={styles.footerText}>
          Dữ liệu của bạn được bảo vệ bởi CineMax theo tiêu chuẩn bảo mật cao nhất
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF7',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF2E0',
    borderWidth: 2,
    borderColor: '#F3E8DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.sansMedium,
    color: '#E87A22',
    textAlign: 'center',
    marginBottom: 4,
  },
  updatedText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
    marginBottom: 10,
  },
  sectionBody: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    textAlign: 'center',
    flex: 1,
  },
});
