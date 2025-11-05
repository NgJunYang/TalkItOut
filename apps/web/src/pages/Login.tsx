import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input } from '@talkitout/ui';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (error) {
      // Error handled by context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-ti-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ti-primary-600 mb-2">TalkItOut</h1>
          <p className="text-ti-text-secondary">Your study companion</p>
        </div>

        <div className="bg-ti-surface border border-ti-border rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Log in
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ti-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-ti-primary-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-ti-primary-100 dark:bg-ti-primary-600/10 rounded-lg">
            <p className="text-xs text-ti-text-secondary">
              <strong>Demo accounts:</strong><br />
              Student: weijie@student.sg / password123<br />
              Counselor: counselor@talkitout.sg / password123
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
