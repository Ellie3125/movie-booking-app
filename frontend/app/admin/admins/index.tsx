import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  ActionButton,
  HeroCard,
  PageScroll,
  SectionCard,
  SectionTitle,
  getTonePalette,
} from '@/components/ui/experience';
import { Fonts } from '@/constants/theme';
import { formatRoleLabel } from '@/lib/user-display';
import { useAppStore } from '@/lib/app-store';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function AdminAccountsScreen() {
  const colors = getTonePalette('admin');
  const { currentUser, createAdminAccount } = useAppStore();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [createdAdmin, setCreatedAdmin] = useState<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
  } | null>(null);

  const handleCreateAdmin = async () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !form.password.trim()) {
      setFeedback('Cần nhập đủ tên, email và mật khẩu cho tài khoản admin mới.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFeedback('Mật khẩu xác nhận chưa khớp.');
      return;
    }

    setSubmitting(true);
    setFeedback('');

    const result = await createAdminAccount({
      name: trimmedName,
      email: trimmedEmail,
      password: form.password,
    });

    setSubmitting(false);

    if (!result.ok || !result.admin) {
      setCreatedAdmin(null);
      setFeedback(result.error ?? 'Không thể tạo tài khoản admin mới.');
      return;
    }

    setCreatedAdmin(result.admin);
    setFeedback(`Đã tạo admin mới: ${result.admin.email}`);
    setForm(emptyForm);
  };

  return (
    <PageScroll tone="admin">
      <HeroCard
        tone="admin"
        eyebrow="Admin / Accounts"
        title="Tạo tài khoản quản trị mới"
        description="Chỉ admin đang đăng nhập mới có thể tạo thêm một admin khác. Tài khoản mới được tạo trực tiếp trên backend nên có thể đăng nhập ngay sau khi tạo." />

      <SectionCard tone="admin">
        <Text style={[styles.currentTitle, { color: colors.text }]}>Admin đang thao tác</Text>
        <Text style={[styles.currentCopy, { color: colors.muted }]}>
          {currentUser?.name || 'Đang cập nhật'} • {currentUser?.email || 'Không có email'} •{' '}
          {formatRoleLabel(currentUser?.role || 'admin')}
        </Text>
      </SectionCard>

      <SectionTitle
        tone="admin"
        title="Tạo admin mới"
        description="Form này không mở cho user thường. Backend cũng kiểm tra quyền admin trước khi cho tạo tài khoản mới."
      />
      <SectionCard tone="admin">
        <TextInput
          placeholder="Tên admin"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.name}
          onChangeText={(name) => setForm((current) => ({ ...current, name }))}
        />
        <TextInput
          placeholder="Email admin"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.email}
          onChangeText={(email) => setForm((current) => ({ ...current, email }))}
        />
        <TextInput
          placeholder="Mật khẩu"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.password}
          onChangeText={(password) => setForm((current) => ({ ...current, password }))}
        />
        <TextInput
          placeholder="Xác nhận mật khẩu"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          value={form.confirmPassword}
          onChangeText={(confirmPassword) =>
            setForm((current) => ({ ...current, confirmPassword }))
          }
        />

        {feedback ? (
          <Text
            style={[
              styles.feedback,
              { color: createdAdmin ? colors.accent : '#FCA5A5' },
            ]}>
            {feedback}
          </Text>
        ) : null}

        <ActionButton
          tone="admin"
          label={submitting ? 'Đang tạo admin...' : 'Tạo tài khoản admin'}
          onPress={() => void handleCreateAdmin()}
          disabled={submitting}
        />
      </SectionCard>

      <SectionTitle
        tone="admin"
        title="Kết quả gần nhất"
        description="Hiển thị tài khoản admin vừa được tạo thành công trong phiên hiện tại."
      />
      <SectionCard tone="admin">
        {createdAdmin ? (
          <View style={styles.resultCard}>
            <Text style={[styles.resultTitle, { color: colors.text }]}>{createdAdmin.name}</Text>
            <Text style={[styles.resultCopy, { color: colors.muted }]}>
              {createdAdmin.email}
            </Text>
            <Text style={[styles.resultCopy, { color: colors.muted }]}>
              Vai trò: {formatRoleLabel(createdAdmin.role)}
            </Text>
          </View>
        ) : (
          <Text style={[styles.resultCopy, { color: colors.muted }]}>
            Chưa có admin mới nào được tạo trong phiên này.
          </Text>
        )}
      </SectionCard>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  currentTitle: {
    fontSize: 18,
    fontFamily: Fonts.sansBold,
  },
  currentCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  feedback: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sansBold,
  },
  resultCard: {
    gap: 4,
  },
  resultTitle: {
    fontSize: 19,
    fontFamily: Fonts.rounded,
  },
  resultCopy: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
});
