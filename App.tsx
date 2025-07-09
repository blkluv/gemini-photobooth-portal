import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import AboutUs from './components/AboutUs';
import Services from './components/Services';
import Clients from './components/Clients';
import ContactUs from './components/ContactUs';
import PhotoboothApp from './components/PhotoboothApp';
import NavBar from './components/NavBar';
import PinGate from './components/PinGate';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isUnlocked = localStorage.getItem('photoboothPin') === '1';
  return isUnlocked ? <>{children}</> : <PinGate onUnlock={() => window.location.reload()} />;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Hide NavBar on /app route
  const hideNav = location.pathname.startsWith('/app');
        return (
    <>
      {!hideNav && <NavBar />}
      {children}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/contact" element={<ContactUs />} />
          {/* Private/locked route */}
          <Route path="/app" element={
            <PrivateRoute>
              <PhotoboothApp />
            </PrivateRoute>
          } />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
