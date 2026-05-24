import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Fonts } from '@/constants/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface ContactCard {
  icon: IoniconsName;
  color: string;
  bgColor: string;
  label: string;
  sublabel: string;
  onPress: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const CONTACT_CARDS: ContactCard[] = [
  {
    icon: 'mail-outline',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    label: 'support@cinemax.vn',
    sublabel: 'Phản hồi trong 24h',
    onPress: () => Linking.openURL('mailto:support@cinemax.vn'),
  },
  {
    icon: 'call-outline',
    color: '#10B981',
    bgColor: '#ECFDF5',
    label: '1900-0000',
    sublabel: 'Thứ 2 - CN, 8:00 - 22:00',
    onPress: () => Linking.openURL('tel:19000000'),
  },
  {
    icon: 'chatbubbles-outline',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    label: 'Live Chat',
    sublabel: 'Thời gian chờ ~5 phút',
    onPress: () =>
      Alert.alert('Thông báo', 'Tính năng sắp ra mắt. Vui lòng liên hệ qua email hoặc hotline.'),
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Làm sao để đặt vé?',
    answer:
      'Chọn phim → Chọn rạp → Chọn suất chiếu → Chọn ghế → Thanh toán. Vé điện tử sẽ được gửi qua email và hiển thị trong mục Vé của tôi.',
  },
  {
    question: 'Tôi có thể huỷ vé không?',
    answer:
      'Bạn có thể huỷ vé miễn phí trước giờ chiếu 2 tiếng. Sau thời gian này, vé không thể huỷ hoặc đổi.',
  },
  {
    question: 'Phương thức thanh toán nào được chấp nhận?',
    answer:
      'Chúng tôi chấp nhận MoMo, VNPay và các ví điện tử phổ biến. Thanh toán bằng thẻ ngân hàng sẽ sớm được hỗ trợ.',
  },
  {
    question: 'Quên mật khẩu thì làm sao?',
    answer:
      'Vui lòng liên hệ bộ phận hỗ trợ qua email hoặc hotline để được hỗ trợ đặt lại mật khẩu.',
  },
  {
    question: 'Ứng dụng có miễn phí không?',
    answer: 'Hoàn toàn miễn phí! Bạn chỉ cần trả tiền cho vé xem phim mà thôi.',
  },
];

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={styles.faqItem}
    >
      <View style={styles.faqQuestionRow}>
        <Ionicons
          name="help-circle-outline"
          size={20}
          color="#E87A22"
          style={styles.faqIcon}
        />
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#8A6A50"
        />
      </View>
      {expanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function SupportScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Illustration */}
      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Ionicons name="headset-outline" size={56} color="#E87A22" />
        </View>
        <Text style={styles.title}>Trung tâm hỗ trợ</Text>
        <Text style={styles.subtitle}>Chúng tôi luôn sẵn sàng giúp đỡ bạn</Text>
      </View>

      {/* Contact Cards */}
      <View style={styles.contactSection}>
        {CONTACT_CARDS.map((card, index) => (
          <TouchableOpacity
            key={index}
            onPress={card.onPress}
            activeOpacity={0.7}
            style={styles.contactCard}
          >
            <View style={[styles.contactIconCircle, { backgroundColor: card.bgColor }]}>
              <Ionicons name={card.icon} size={24} color={card.color} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>{card.label}</Text>
              <Text style={styles.contactSublabel}>{card.sublabel}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#C7B9AC" />
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.faqSectionTitle}>Câu hỏi thường gặp</Text>
        <View style={styles.faqCard}>
          {FAQ_ITEMS.map((item, index) => (
            <React.Fragment key={index}>
              <FAQAccordionItem item={item} />
              {index < FAQ_ITEMS.length - 1 && <View style={styles.faqDivider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* App Version Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>CineMax v1.0.0 • Với ❤️ từ Việt Nam</Text>
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
    marginBottom: 28,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    textAlign: 'center',
  },
  // Contact Cards
  contactSection: {
    marginBottom: 28,
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 15,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
    marginBottom: 2,
  },
  contactSublabel: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
  },
  // FAQ Section
  faqSection: {
    marginBottom: 24,
  },
  faqSectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.sansBold,
    color: '#5A3E2B',
    marginBottom: 14,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3E8DC',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#5A3E2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  faqItem: {
    padding: 16,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIcon: {
    marginRight: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.sansMedium,
    color: '#5A3E2B',
  },
  faqAnswerContainer: {
    marginTop: 10,
    marginLeft: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3E8DC',
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
    lineHeight: 22,
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#F3E8DC',
    marginHorizontal: 16,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    color: '#8A6A50',
  },
});
