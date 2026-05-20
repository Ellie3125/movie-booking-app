import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Đăng ký | Cinema Manager"
        description="Tạo tài khoản quản trị mới"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
