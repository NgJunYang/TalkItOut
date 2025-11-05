import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input } from '@talkitout/ui';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    school: '',
    guardianConsent: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register({
        ...formData,
        age: parseInt(formData.age),
        role: 'student',
      });
      navigate('/app/dashboard');
    } catch (error) {
      // Error handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-ti-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ti-primary-600 mb-2">TalkItOut</h1>
          <p className="text-ti-text-secondary">Join your study companion</p>
        </div>

        <div className="bg-ti-surface border border-ti-border rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Wei Jie"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              helperText="At least 8 characters"
              required
            />

            <Input
              label="Age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="15"
              min="10"
              max="19"
              required
            />

            <Input
              label="School (optional)"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="River Valley High School"
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                name="guardianConsent"
                checked={formData.guardianConsent}
                onChange={handleChange}
                className="mt-1 mr-2 h-4 w-4 text-ti-primary-600 rounded"
                required
              />
              <label className="text-sm text-ti-text-secondary">
                I confirm that I have guardian consent to use this service (required for users under 18)
              </label>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ti-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-ti-primary-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
