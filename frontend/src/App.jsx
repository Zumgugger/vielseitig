import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css';

// Placeholder pages (we'll create these)
import HomePage from './pages/HomePage';
import StudentSortPage from './pages/StudentSortPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
      </div>
    </Router>
  );
}

export default App;
