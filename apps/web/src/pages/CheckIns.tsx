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
    <div className="w-full">
      <h1 className="text-3xl font-extrabold tracking-tight text-ti-ink-900 mb-6">Daily Check-ins</h1>

      <Card className="mb-6 bg-white border-ti-beige-300 shadow-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-ti-ink-900">How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 mb-6">
            {moods.map((m) => (
              <motion.button
                key={m.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  mood === m.value
                    ? 'border-ti-green-500 bg-ti-green-50 shadow-soft'
                    : 'border-ti-beige-300 hover:border-ti-green-300 bg-white'
                }`}
              >
                <div className="text-4xl mb-2">{m.emoji}</div>
                <span className="text-xs text-ti-ink-800">{m.label}</span>
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
            <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!mood} className="bg-ti-green-500 hover:bg-ti-green-600 text-white">
              Save Check-in
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-ti-ink-900">Recent Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {checkIns.length === 0 ? (
            <p className="text-black/60 text-center py-8">
              No check-ins yet. Log your first one above!
            </p>
          ) : (
            <div className="space-y-3">
              {checkIns.map((checkIn) => (
                <motion.div
                  key={checkIn._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-4 p-4 bg-ti-beige-50 rounded-xl border border-ti-beige-200 hover:shadow-soft transition-shadow"
                >
                  <div className="text-3xl">
                    {moods.find((m) => m.value === checkIn.mood)?.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-ti-ink-900">
                        {moods.find((m) => m.value === checkIn.mood)?.label}
                      </span>
                      <span className="text-xs text-black/50">
                        {formatRelativeTime(checkIn.createdAt)}
                      </span>
                    </div>
                    {checkIn.note && (
                      <p className="text-sm text-ti-ink-800">{checkIn.note}</p>
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
