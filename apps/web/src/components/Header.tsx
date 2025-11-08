import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@talkitout/ui';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isCounselor = user?.role === 'counselor' || user?.role === 'admin';

  const studentNav = [
    { to: '/app/dashboard', label: 'Me', icon: '🌱' },
    { to: '/app/chat', label: 'Talk', icon: '💬' },
    { to: '/app/tasks', label: 'To-Do', icon: '📝' },
    { to: '/app/focus', label: 'Focus Timer', icon: '⏱️' },
    { to: '/app/messages', label: 'Messages', icon: '📬' },
  ];

  const counselorNav = [
    { to: '/counselor', label: 'Dashboard', icon: '📊' },
    { to: '/counselor/students', label: 'Students', icon: '👥' },
    { to: '/counselor/flags', label: 'Risk Flags', icon: '⚠️' },
  ];

  const navItems = isCounselor ? counselorNav : studentNav;

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-ti-beige-300 sticky top-0 z-10 shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-extrabold gradient-text">
                TalkItOut
              </Link>

              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => (
                  <motion.div key={item.to} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to={item.to}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === item.to
                          ? 'bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white shadow-md'
                          : 'text-ti-ink-800 hover:bg-ti-beige-100'
                      }`}
                    >
                      <span className="mr-1">{item.icon}</span>
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-ti-ink-800 hidden sm:inline font-medium">
                {user?.name}
              </span>
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
