import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Fonts } from '@/constants/theme';

const SECTIONS = [
  {
    number: 1,
    title: 'Giới thiệu',
    body: 'Chào mừng bạn đến với CineMax - ứng dụng đặt vé xem phim trực tuyến hàng đầu. Bằng việc sử dụng ứng dụng, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ của chúng tôi. CineMax cung cấp nền tảng kết nối người dùng với các rạp chiếu phim trên toàn quốc, giúp bạn dễ dàng tìm kiếm, đặt vé và tận hưởng trải nghiệm điện ảnh tuyệt vời nhất.',
  },
  {
    number: 2,
    title: 'Điều kiện sử dụng',
    body: 'Để sử dụng dịch vụ CineMax, bạn cần đáp ứng các điều kiện sau:\n\n• Bạn phải từ 16 tuổi trở lên để tạo tài khoản. Người dùng dưới 16 tuổi cần có sự đồng ý của phụ huynh hoặc người giám hộ hợp pháp.\n\n• Mỗi người chỉ được đăng ký một tài khoản duy nhất. Thông tin đăng ký phải chính xác và trung thực.\n\n• Bạn có trách nhiệm bảo mật thông tin đăng nhập của mình và chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của bạn.',
  },
  {
    number: 3,
    title: 'Đặt vé & Thanh toán',
    body: 'Khi đặt vé qua CineMax, bạn cần lưu ý:\n\n• Giá vé được hiển thị đã bao gồm thuế VAT và phí dịch vụ (nếu có). Giá vé có thể thay đổi tùy theo rạp, suất chiếu và loại ghế.\n\n• Sau khi thanh toán thành công, vé điện tử sẽ được gửi qua email đăng ký và hiển thị trong mục "Vé của tôi" trên ứng dụng.\n\n• Vui lòng kiểm tra kỹ thông tin phim, rạp, suất chiếu và ghế ngồi trước khi xác nhận thanh toán. Chúng tôi không chịu trách nhiệm cho các lỗi do người dùng chọn sai thông tin.',
  },
  {
    number: 4,
    title: 'Chính sách hoàn/huỷ vé',
    body: 'Chính sách hoàn và huỷ vé được quy định như sau:\n\n• Bạn có thể huỷ vé miễn phí nếu thực hiện trước giờ chiếu ít nhất 2 tiếng.\n\n• Huỷ vé trong khoảng 1-2 tiếng trước giờ chiếu sẽ bị tính phí 30% giá trị vé.\n\n• Không hỗ trợ huỷ vé trong vòng 1 tiếng trước giờ chiếu hoặc sau khi phim đã bắt đầu.\n\n• Tiền hoàn sẽ được trả về phương thức thanh toán ban đầu trong vòng 3-5 ngày làm việc.',
  },
  {
    number: 5,
    title: 'Quyền và trách nhiệm',
    body: 'Quyền của người dùng:\n• Được sử dụng đầy đủ các tính năng của ứng dụng sau khi đăng ký tài khoản.\n• Được bảo mật thông tin cá nhân theo chính sách bảo mật.\n• Được hỗ trợ giải quyết khiếu nại trong thời gian hợp lý.\n\nTrách nhiệm của người dùng:\n• Cung cấp thông tin chính xác, trung thực khi đăng ký và sử dụng dịch vụ.\n• Không sử dụng ứng dụng cho mục đích gian lận, phá hoại hoặc vi phạm pháp luật.\n• Tuân thủ nội quy của các rạp chiếu phim đối tác.',
  },
  {
    number: 6,
    title: 'Giới hạn trách nhiệm',
    body: 'CineMax không chịu trách nhiệm trong các trường hợp sau:\n\n• Sự cố kỹ thuật ngoài tầm kiểm soát như thiên tai, lỗi mạng Internet, hoặc lỗi từ nhà cung cấp dịch vụ bên thứ ba.\n\n• Thiệt hại phát sinh do người dùng cung cấp thông tin sai lệch hoặc không bảo mật tài khoản đúng cách.\n\n• Thay đổi lịch chiếu, huỷ suất chiếu từ phía rạp chiếu phim. Trong trường hợp này, chúng tôi sẽ hỗ trợ hoàn tiền đầy đủ cho người dùng.',
  },
  {
    number: 7,
    title: 'Điều khoản chung',
    body: 'CineMax có quyền cập nhật, sửa đổi các điều khoản sử dụng này bất kỳ lúc nào. Mọi thay đổi sẽ được thông báo qua ứng dụng hoặc email đăng ký.\n\nViệc bạn tiếp tục sử dụng dịch vụ sau khi các điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận các thay đổi đó.\n\nCác điều khoản này được điều chỉnh và giải thích theo pháp luật Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.',
  },
];

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo & Header */}
      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Ionicons name="film-outline" size={48} color="#E87A22" />
        </View>
        <Text style={styles.title}>Điều khoản sử dụng dịch vụ</Text>
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
        <Ionicons name="mail-outline" size={16} color="#8A6A50" />
        <Text style={styles.footerText}>
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ support@cinemax.vn
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
