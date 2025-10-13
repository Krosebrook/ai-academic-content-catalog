
import React, { Suspense, lazy } from 'react';
import { useAuth, AuthGuard } from './utils/auth-protection';

const EducationPage = lazy(() => import('./components/pages/EducationPage'));

const App: React.FC = () => {
  const { isAuthenticated, login, logout, startDemoSession } = useAuth();

  return (
    <div className="min-h-screen bg-ff-bg-dark text-ff-text-primary">
      <header className="p-4 border-b border-ff-surface flex justify-between items-center">
        <div className="flex items-center gap-3">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-ff-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 12 2.5zm5.72 6.55-4.22 3.12 1.34 4.88a.5.5 0 0 1-.73.55l-4.11-2.16-4.11 2.16a.5.5 0 0 1-.73-.55l1.34-4.88-4.22-3.12a.5.5 0 0 1 .28-.85l4.9-.71 2.19-4.44a.5.5 0 0 1 .9 0l2.19 4.44 4.9.71a.5.5 0 0 1 .28.85z"/></svg>
           <h1 style={{ fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-xl)', fontWeight: 'var(--ff-weight-bold)' }}>
              FlashFusion AI Content
           </h1>
        </div>
        <div>
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="bg-ff-accent text-white py-2 px-4 rounded-lg"
              style={{ fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-sm)', fontWeight: 'var(--ff-weight-semibold)' }}
            >
              Sign Out
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={login}
                className="bg-ff-primary text-white py-2 px-4 rounded-lg"
                style={{ fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-sm)', fontWeight: 'var(--ff-weight-semibold)' }}
              >
                Sign In
              </button>
              <button
                onClick={startDemoSession}
                className="bg-ff-secondary text-white py-2 px-4 rounded-lg"
                style={{ fontFamily: 'var(--ff-font-secondary)', fontSize: 'var(--ff-text-sm)', fontWeight: 'var(--ff-weight-semibold)' }}
              >
                Start Demo
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="p-4 md:p-8">
        <AuthGuard>
          <Suspense fallback={<div>Loading Page...</div>}>
            <EducationPage />
          </Suspense>
        </AuthGuard>
      </main>
    </div>
  );
};

export default App;
