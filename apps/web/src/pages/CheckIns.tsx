import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, TextArea, Card, CardHeader, CardTitle, CardContent } from '@talkitout/ui';
import { checkInAPI } from '../api/client';
import toast from 'react-hot-toast';
import { formatRelativeTime } from '@talkitout/ui';

export const CheckInsPage: React.FC = () => {
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCheckIns();
  }, []);

  const loadCheckIns = async () => {
    try {
      const response = await checkInAPI.getMine({ days: 30 });
      setCheckIns(response.data.checkIns);
    } catch (error) {
      toast.error('Failed to load check-ins');
    }
  };

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
      loadCheckIns();
    } catch (error) {
      toast.error('Failed to save check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moods = [
    { value: 1, emoji: '😢', label: 'Very Bad' },
    { value: 2, emoji: '😟', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Great' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Warm Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-ti-ink-900 mb-3 flex items-center justify-center">
          <span className="mr-2">❤️</span> How are you feeling?
        </h1>
        <p className="text-lg text-ti-ink/70 max-w-2xl mx-auto">
          Taking a moment to check in with yourself is important. I'm here to listen.
        </p>
      </motion.div>

      <Card className="mb-6 bg-gradient-to-br from-ti-green-500/5 to-white border-2 border-ti-beige-300 shadow-card rounded-3xl">
        <CardContent className="pt-8">
          <div className="flex justify-center gap-4 mb-8">
            {moods.map((m) => (
              <motion.button
                key={m.value}
                whileHover={{ scale: 1.15, y: -8 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center p-6 rounded-2xl border-3 transition-all ${
                  mood === m.value
                    ? 'border-ti-green-500 bg-gradient-to-br from-ti-green-500/20 to-ti-teal-500/20 shadow-lg ring-2 ring-ti-green-500/50'
                    : 'border-ti-beige-300 hover:border-ti-green-300 bg-white shadow-md'
                }`}
              >
                <div className="text-6xl mb-3">{m.emoji}</div>
                <span className="text-sm font-semibold text-ti-ink-900">{m.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            <TextArea
              label="What's on your mind? (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Share how your day is going..."
              rows={4}
              className="bg-ti-beige-50 border-2 border-ti-beige-300 rounded-xl focus:ring-2 focus:ring-ti-green-500"
            />
          </div>

          <div className="mt-6 flex justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!mood}
                size="lg"
                className="bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white shadow-md hover:shadow-lg px-8"
              >
                {mood ? '✓ Save Check-in' : 'Select your mood first'}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-2 border-ti-beige-300 shadow-card rounded-2xl">
        <CardHeader>
          <div className="flex items-center">
            <span className="text-2xl mr-2">📊</span>
            <CardTitle className="text-ti-ink-900">Your Journey</CardTitle>
          </div>
          <p className="text-sm text-ti-ink/60 mt-1">
            Track how you've been feeling over time
          </p>
        </CardHeader>
        <CardContent>
          {checkIns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-ti-ink/60 mb-4">
                No check-ins yet. Log your first one above!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkIns.map((checkIn, idx) => (
                <motion.div
                  key={checkIn._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start space-x-4 p-4 bg-ti-beige-50 rounded-xl border-2 border-ti-beige-200 hover:shadow-md hover:border-ti-green-300 transition-all"
                >
                  <div className="text-4xl">
                    {moods.find((m) => m.value === checkIn.mood)?.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-ti-ink-900">
                        {moods.find((m) => m.value === checkIn.mood)?.label}
                      </span>
                      <span className="text-xs text-ti-ink/60 font-medium">
                        {formatRelativeTime(checkIn.createdAt)}
                      </span>
                    </div>
                    {checkIn.note && (
                      <p className="text-sm text-ti-ink-800 leading-relaxed italic">"{checkIn.note}"</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
