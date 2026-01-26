import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css';

// Context providers
import { ThemeProvider } from './store/ThemeContext';
import { AuthProvider } from './store/AuthContext';

// Layout components
import { AppHeader, AppFooter } from './components';

// Pages
import HomePage from './pages/HomePage';
import StudentSortPage from './pages/StudentSortPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';

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
          
          {/* Auth routes */}
          <Route path="/user/login" element={<UserLoginPage />} />
          <Route path="/user/register" element={<UserRegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
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
