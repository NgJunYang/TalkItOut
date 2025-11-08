import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, TextArea } from '@talkitout/ui';
import { checkInAPI } from '../api/client';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods = [
    { value: 1, emoji: '😢', label: 'Very Bad' },
    { value: 2, emoji: '😟', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Great' },
  ];

  const handleSubmit = async () => {
    if (!mood) {
      toast.error('Please select a mood');
      return;
    }

    setIsSubmitting(true);
    try {
      await checkInAPI.create({ mood, note: note || undefined });
      toast.success('Check-in saved!');
      setMood(null);
      setNote('');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to save check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMood(null);
    setNote('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border-2 border-ti-beige-300 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-ti-beige-200">
                <div>
                  <h2 className="text-2xl font-bold text-ti-ink-900 flex items-center">
                    <span className="mr-2">❤️</span> How are you feeling?
                  </h2>
                  <p className="text-sm text-ti-ink-700 mt-1">
                    Take a moment to check in with yourself
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-ti-beige-100 rounded-xl transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-ti-ink-700" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Mood Selection */}
                <div>
                  <label className="block text-sm font-medium text-ti-ink-900 mb-3">
                    Select your mood
                  </label>
                  <div className="flex justify-between gap-2">
                    {moods.map((m) => (
                      <motion.button
                        key={m.value}
                        whileHover={{ scale: 1.1, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMood(m.value)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                          mood === m.value
                            ? 'border-ti-green-500 bg-ti-green-50 shadow-md'
                            : 'border-ti-beige-300 hover:border-ti-green-300 bg-white'
                        }`}
                      >
                        <div className="text-3xl mb-1">{m.emoji}</div>
                        <span className="text-xs font-medium text-ti-ink-900">{m.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <TextArea
                    label="What's on your mind? (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Share how you're feeling..."
                    rows={3}
                    className="bg-ti-beige-50 border-2 border-ti-beige-300 rounded-xl"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    disabled={!mood}
                    className="flex-1 bg-ti-green-500 hover:bg-ti-green-600 text-white"
                  >
                    Save Check-in
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
