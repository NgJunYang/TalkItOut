import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@talkitout/ui';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isStudent = user?.role === 'student';
  const isCounselor = user?.role === 'counselor' || user?.role === 'admin';

  const studentNav = [
    { to: '/app/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/app/chat', label: 'Chat', icon: '💬' },
    { to: '/app/focus', label: 'Focus', icon: '🎯' },
    { to: '/app/tasks', label: 'Tasks', icon: '✓' },
    { to: '/app/checkins', label: 'Check-ins', icon: '❤️' },
    { to: '/app/settings', label: 'Settings', icon: '⚙️' },
  ];

  const counselorNav = [
    { to: '/counselor', label: 'Dashboard', icon: '📊' },
    { to: '/counselor/students', label: 'Students', icon: '👥' },
    { to: '/counselor/flags', label: 'Risk Flags', icon: '⚠️' },
  ];

  const navItems = isCounselor ? counselorNav : studentNav;

  return (
    <div className="min-h-screen bg-hero-soft">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-ti-border sticky top-0 z-10 shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold bg-gradient-green bg-clip-text text-transparent">
                TalkItOut
              </Link>

              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative group ${
                      location.pathname === item.to
                        ? 'bg-gradient-green text-white shadow-soft'
                        : 'text-ti-text-secondary hover:bg-accent-mint hover:text-brand-green'
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.label}
                    {location.pathname === item.to && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-ti-text-secondary hidden sm:inline font-medium">
                {user?.name}
              </span>
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-ti-border mt-auto py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-ti-text-secondary">
            <p className="mb-2 font-medium">
              <span className="text-brand-green">✦</span> <strong>Crisis Support:</strong> Emergency 999 • Samaritans of Singapore 1767 • SOS CareText 9151 1767
            </p>
            <p className="text-ti-text-tertiary">TalkItOut is a support tool, not a crisis service or medical provider</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
