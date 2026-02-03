import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './styles/index.css';

// Context providers
import { ThemeProvider } from './store/ThemeContext';
import { AuthProvider, useAuth } from './store/AuthContext';

// Layout components
import { AppHeader, AppFooter, Loading } from './components';

// Core pages (always loaded)
import HomePage from './pages/HomePage';
import StudentSortPage from './pages/StudentSortPage';
import StudentResultsPage from './pages/StudentResultsPage';

// Auth pages (small, load eagerly)
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';

// Legal pages (rarely accessed, lazy load)
const ImpressumPage = lazy(() => import('./pages/ImpressumPage'));
const DatenschutzPage = lazy(() => import('./pages/DatenschutzPage'));

// User pages (lazy load for better initial load)
const UserListsPage = lazy(() => import('./pages/UserListsPage'));
const UserListEditorPage = lazy(() => import('./pages/UserListEditorPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));

// Admin pages (lazy load - not needed for students)
const AdminPendingPage = lazy(() => import('./pages/AdminPendingPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminSchoolsPage = lazy(() => import('./pages/AdminSchoolsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'));
const AdminStandardListPage = lazy(() => import('./pages/AdminStandardListPage'));
const AdminProfilePage = lazy(() => import('./pages/AdminProfilePage'));

// Loading skeleton for lazy-loaded pages
function PageSkeleton() {
  return (
    <div className="min-h-[60vh] animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
      <div className="card">
        <div className="h-4 bg-gray-200 rounded w-full mb-3" />
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-4/6 mb-3" />
        <div className="h-10 bg-gray-200 rounded w-32 mt-6" />
      </div>
    </div>
  );
}

function RequireUser({ children }) {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <Loading fullscreen />;
  if (!user) return <Navigate to="/user/login" replace state={{ from: location }} />;
  return children;
}

function RequireAdmin({ children }) {
  const { admin, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <Loading fullscreen />;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  return children;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/sort" element={<StudentSortPage />} />
          <Route path="/l/:token" element={<StudentSortPage />} />
          <Route path="/results" element={<StudentResultsPage />} />
          <Route path="/results/:token" element={<StudentResultsPage />} />
          <Route path="/impressum" element={<Suspense fallback={<PageSkeleton />}><ImpressumPage /></Suspense>} />
          <Route path="/datenschutz" element={<Suspense fallback={<PageSkeleton />}><DatenschutzPage /></Suspense>} />
          
          {/* Auth routes */}
          <Route path="/user/login" element={<UserLoginPage />} />
          <Route path="/user/register" element={<UserRegisterPage />} />
          <Route
            path="/user/profile"
            element={(
              <RequireUser>
                <Suspense fallback={<PageSkeleton />}>
                  <UserProfilePage />
                </Suspense>
              </RequireUser>
            )}
          />
          <Route
            path="/user/lists"
            element={(
              <RequireUser>
                <Suspense fallback={<PageSkeleton />}>
                  <UserListsPage />
                </Suspense>
              </RequireUser>
            )}
          />
          <Route
            path="/user/lists/:listId"
            element={(
              <RequireUser>
                <Suspense fallback={<PageSkeleton />}>
                  <UserListEditorPage />
                </Suspense>
              </RequireUser>
            )}
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/pending"
            element={(
              <RequireAdmin>
                <Suspense fallback={<PageSkeleton />}>
                  <AdminPendingPage />
                </Suspense>
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/users"
            element={(
              <RequireAdmin>
                <Suspense fallback={<PageSkeleton />}>
                  <AdminUsersPage />
                </Suspense>
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/schools"
            element={(
              <RequireAdmin>
                <Suspense fallback={<PageSkeleton />}>
                  <AdminSchoolsPage />
                </Suspense>
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/analytics"
            element={(
              <RequireAdmin>
                <Suspense fallback={<PageSkeleton />}>
                  <AdminAnalyticsPage />
                </Suspense>
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/standard-list"
            element={(
              <RequireAdmin>
                <Suspense fallback={<PageSkeleton />}>
                  <AdminStandardListPage />
                </Suspense>
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/profile"
            element={(
              <RequireAdmin>
                <Suspense fallback={<PageSkeleton />}>
                  <AdminProfilePage />
                </Suspense>
              </RequireAdmin>
            )}
          />
          
          {/* Protected routes (we'll add these later) */}
          {/* <Route path="/user/*" element={<UserArea />} /> */}
          {/* <Route path="/admin/*" element={<AdminArea />} /> */}
        </Routes>
      </main>
      <AppFooter />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
