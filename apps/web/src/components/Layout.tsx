import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-hero-soft">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-ti-beige-300 mt-auto py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-ti-ink/70">
            <p className="mb-2">
              <strong className="text-ti-ink">Crisis Support:</strong> Emergency 999 • Samaritans of Singapore 1767 • SOS CareText 9151 1767
            </p>
            <p>TalkItOut is a support tool, not a crisis service or medical provider</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
