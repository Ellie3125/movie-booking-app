import { useEffect, useState } from 'react';
import { fetchDashboardStats, DashboardStats } from '../services/dashboardService';

interface UseDashboardStatsResult {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const stats = await fetchDashboardStats();
        if (!cancelled) setData(stats);
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Không thể tải dữ liệu Dashboard.';
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
