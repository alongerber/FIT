import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './shared/hooks/useStore';
import { Layout } from './shared/components/Layout';
import { Onboarding } from './app/auth/Onboarding';
import { Dashboard } from './app/dashboard/Dashboard';
import { History } from './app/history/History';
import { Insights } from './app/insights/Insights';
import { Settings } from './app/settings/Settings';

export default function App() {
  const { isOnboarded, loadData } = useStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <BrowserRouter>
      <Routes>
        {!isOnboarded ? (
          <>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
