import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import { FilterProvider } from './contexts/FilterContext.js';
import Navbar from './components/layout/Navbar.js';
import Dashboard from './pages/Dashboard.js';
import Purchases from './pages/Purchases.js';
import Transfers from './pages/Transfers.js';
import Assignments from './pages/Assignments.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';

// Tailwind utility classes
import './index.css';

// Add to tailwind.config.js
import './styles/customStyles.css';

// Layout component for protected routes including Navbar
const ProtectedLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // You could return a full-page loading spinner here if needed
    return null; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-4">
        <Outlet /> {/* This is where the matched child route component will render */}
      </main>
    </div>
  );
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <FilterProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected routes using the layout */}
            <Route path="/" element={<ProtectedLayout />}>
              <Route index element={<Dashboard />} /> {/* Default route for / */}
              <Route path="purchases" element={<Purchases />} />
              <Route path="transfers" element={<Transfers />} />
              <Route path="assignments" element={<Assignments />} />
            </Route>

            {/* Catch all route - redirect to home or login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FilterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;