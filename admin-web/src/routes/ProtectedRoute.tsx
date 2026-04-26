import { useEffect, useState } from 'react';
import { CSpinner } from '@coreui/react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { fetchCurrentAdminUser } from '../services/api';
import {
  clearAdminSession,
  getStoredAdminSession,
  isAdminRole,
  saveAdminSession,
} from '../utils/auth';

type GuardState = 'checking' | 'allowed' | 'blocked';

export function ProtectedRoute() {
  const location = useLocation();
  const session = getStoredAdminSession();
  const accessToken = session?.accessToken ?? null;
  const [guardState, setGuardState] = useState<GuardState>('checking');

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      setGuardState('checking');
      const currentSession = getStoredAdminSession();

      if (!currentSession) {
        setGuardState('blocked');
        return;
      }

      if (!isAdminRole(currentSession.user.role)) {
        clearAdminSession();
        setGuardState('blocked');
        return;
      }

      try {
        const user = await fetchCurrentAdminUser();

        if (!active) {
          return;
        }

        if (!isAdminRole(user.role)) {
          clearAdminSession();
          setGuardState('blocked');
          return;
        }

        saveAdminSession({
          accessToken: currentSession.accessToken,
          user,
        });
        setGuardState('allowed');
      } catch {
        if (!active) {
          return;
        }

        clearAdminSession();
        setGuardState('blocked');
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, [location.pathname, accessToken]);

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdminRole(session.user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (guardState === 'blocked') {
    return <Navigate to="/login" replace />;
  }

  if (guardState !== 'allowed') {
    return (
      <main className="route-loading">
        <CSpinner color="primary" />
      </main>
    );
  }

  return <Outlet />;
}
