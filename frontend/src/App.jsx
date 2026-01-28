import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/index.css';

// Context providers
import { ThemeProvider } from './store/ThemeContext';
import { AuthProvider, useAuth } from './store/AuthContext';

// Layout components
import { AppHeader, AppFooter, Loading } from './components';

// Pages
import HomePage from './pages/HomePage';
import StudentSortPage from './pages/StudentSortPage';
import StudentResultsPage from './pages/StudentResultsPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import UserListsPage from './pages/UserListsPage';
import UserListEditorPage from './pages/UserListEditorPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminPendingPage from './pages/AdminPendingPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSchoolsPage from './pages/AdminSchoolsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import ImpressumPage from './pages/ImpressumPage';
import DatenschutzPage from './pages/DatenschutzPage';

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
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          
          {/* Auth routes */}
          <Route path="/user/login" element={<UserLoginPage />} />
          <Route path="/user/register" element={<UserRegisterPage />} />
          <Route
            path="/user/profile"
            element={(
              <RequireUser>
                <UserProfilePage />
              </RequireUser>
            )}
          />
          <Route
            path="/user/lists"
            element={(
              <RequireUser>
                <UserListsPage />
              </RequireUser>
            )}
          />
          <Route
            path="/user/lists/:listId"
            element={(
              <RequireUser>
                <UserListEditorPage />
              </RequireUser>
            )}
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/pending"
            element={(
              <RequireAdmin>
                <AdminPendingPage />
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/users"
            element={(
              <RequireAdmin>
                <AdminUsersPage />
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/schools"
            element={(
              <RequireAdmin>
                <AdminSchoolsPage />
              </RequireAdmin>
            )}
          />
          <Route
            path="/admin/analytics"
            element={(
              <RequireAdmin>
                <AdminAnalyticsPage />
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
