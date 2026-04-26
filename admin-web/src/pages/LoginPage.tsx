import { type FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CForm, CFormInput } from '@coreui/react';

import { getApiErrorMessage, loginAdmin } from '../services/api';
import { clearAdminSession, isAdminRole, saveAdminSession } from '../utils/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await loginAdmin({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!isAdminRole(response.user.role)) {
        clearAdminSession();
        setErrorMessage('Bạn không có quyền truy cập trang quản trị');
        return;
      }

      saveAdminSession({
        accessToken: response.accessToken,
        user: response.user,
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      clearAdminSession();
      setErrorMessage(getApiErrorMessage(error, 'Không thể đăng nhập trang quản trị.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <CCard className="login-card shadow-sm">
        <CCardHeader className="bg-white">
          <h1 className="h4 mb-0">Admin Login</h1>
        </CCardHeader>
        <CCardBody>
          <CForm className="d-grid gap-3" onSubmit={handleSubmit}>
            <CFormInput
              autoComplete="email"
              disabled={isSubmitting}
              label="Email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
              type="email"
              value={email}
            />
            <CFormInput
              autoComplete="current-password"
              disabled={isSubmitting}
              label="Password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />

            {errorMessage ? <CAlert color="danger">{errorMessage}</CAlert> : null}

            <CButton color="primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </main>
  );
}
