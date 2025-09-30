// src/App.tsx
import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Products from './components/Products';
import Testimonials from './components/Testimonials';
import Settings from './components/Settings';
import Achievements from './components/Achievement';

const App: React.FC = () => {
  const { currentView, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="absolute w-screen h-screen flex justify-center items-center text-4xl">
          <span className="loading loading-infinity loading-xl"></span>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'testimonials':
        return <Testimonials />;
      case 'achievements':
        return <Achievements />;
      case 'settings':
        return <Settings />;
      default:
        return <Login />;
    }
  };

  return (
    <div className="app">
      {renderView()}
    </div>
  );
};

export default App;