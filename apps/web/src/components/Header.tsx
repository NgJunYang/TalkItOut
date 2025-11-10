import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { TalkBubbleLogo } from './TalkBubbleLogo';

const studentNav = [
  { to: '/app/chat', label: 'Talk' },
  { to: '/app/tasks', label: 'To-Do' },
  { to: '/app/focus', label: 'Focus' },
  { to: '/app/messages', label: 'Messages' },
];

const counselorNav = [
  { to: '/counselor', label: 'Overview' },
  { to: '/counselor/students', label: 'Students' },
  { to: '/counselor/flags', label: 'Risk Flags' },
];

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = (user?.role === 'counselor' || user?.role === 'admin') ? counselorNav : studentNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/90 backdrop-blur-xl shadow-soft/30">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link to="/" className="group flex items-center gap-3 text-lg font-semibold tracking-tight text-text">
          <TalkBubbleLogo className="h-12 w-12 drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-text">Talk.ItOut</span>
            <span className="text-xs font-medium text-muted">One Talk Away</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <motion.div key={item.to} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={item.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-beige1 text-black shadow-soft'
                      : 'text-muted hover:bg-beige2/60 hover:text-text'
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="rounded-full border border-border px-3 py-2 text-muted transition-colors duration-200 hover:text-text focus-visible:ring-2 focus-visible:ring-beige1"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="hidden text-sm text-muted sm:flex sm:flex-col">
            <span className="font-medium text-text">{user?.name}</span>
            <span>{user?.role}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full bg-beige1 px-4 py-2 text-sm font-semibold text-black shadow-soft transition duration-200 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-black/40"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};
