import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './shared/hooks/useStore';
import { Layout } from './shared/components/Layout';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { Onboarding } from './app/auth/Onboarding';
import { Dashboard } from './app/dashboard/Dashboard';
import { History } from './app/history/History';
import { Insights } from './app/insights/Insights';
import { Settings } from './app/settings/Settings';

export default function App() {
  const { isOnboarded, loadData } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    setLoading(false);
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-accent mb-2">GRAVIT</div>
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {!isOnboarded ? (
            <>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <Route element={<Layout />}>
              <Route path="/" element={
                <ErrorBoundary><Dashboard /></ErrorBoundary>
              } />
              <Route path="/history" element={
                <ErrorBoundary><History /></ErrorBoundary>
              } />
              <Route path="/insights" element={
                <ErrorBoundary><Insights /></ErrorBoundary>
              } />
              <Route path="/settings" element={
                <ErrorBoundary><Settings /></ErrorBoundary>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
