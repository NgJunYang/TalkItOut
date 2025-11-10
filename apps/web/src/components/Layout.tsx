import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text transition-colors duration-300">
      <Header />
      <main className="flex-1 px-4 py-8 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="mx-auto w-full max-w-6xl space-y-8"
        >
          <Outlet />
        </motion.div>
      </main>
      <footer className="border-t border-border/70 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-medium text-text">
            Crisis Support: Emergency 999 · Samaritans of Singapore 1767 · SOS CareText 9151 1767
          </p>
          <p>Talk.IO is a support tool, not a crisis service or medical provider.</p>
        </div>
      </footer>
    </div>
  );
};

