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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Daily Check-ins</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 mb-6">
            {moods.map((m) => (
              <motion.button
                key={m.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-colors ${
                  mood === m.value
                    ? 'border-ti-primary-600 bg-ti-primary-600/10'
                    : 'border-ti-border hover:border-ti-primary-600/50'
                }`}
              >
                <div className="text-4xl mb-2">{m.emoji}</div>
                <span className="text-xs text-ti-text-secondary">{m.label}</span>
              </motion.button>
            ))}
          </div>

          <TextArea
            label="What's on your mind? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Share how your day is going..."
            rows={3}
          />

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!mood}>
              Save Check-in
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {checkIns.length === 0 ? (
            <p className="text-ti-text-tertiary text-center py-8">
              No check-ins yet. Log your first one above!
            </p>
          ) : (
            <div className="space-y-3">
              {checkIns.map((checkIn) => (
                <motion.div
                  key={checkIn._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-4 p-4 bg-ti-surface-hover rounded-lg"
                >
                  <div className="text-3xl">
                    {moods.find((m) => m.value === checkIn.mood)?.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {moods.find((m) => m.value === checkIn.mood)?.label}
                      </span>
                      <span className="text-xs text-ti-text-tertiary">
                        {formatRelativeTime(checkIn.createdAt)}
                      </span>
                    </div>
                    {checkIn.note && (
                      <p className="text-sm text-ti-text-secondary">{checkIn.note}</p>
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
