import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@talkitout/ui';
import { useAuth } from '../contexts/AuthContext';
import { checkInAPI, taskAPI } from '../api/client';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [checkInsRes, tasksRes, statsRes] = await Promise.all([
        checkInAPI.getMine({ days: 7 }),
        taskAPI.getAll(),
        checkInAPI.getStats(),
      ]);

      setCheckIns(checkInsRes.data.checkIns);
      setTasks(tasksRes.data.tasks);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const moodChartData = checkIns
    .slice(0, 7)
    .reverse()
    .map((c) => ({
      date: new Date(c.createdAt).toLocaleDateString('en-SG', { weekday: 'short' }),
      mood: c.mood,
    }));

  const todayTasks = tasks.filter((t) => {
    if (!t.dueAt) return false;
    const due = new Date(t.dueAt);
    const today = new Date();
    return due.toDateString() === today.toDateString();
  });

  const streaks = profile?.streaks || [];
  const checkInStreak = streaks.find((s: any) => s.type === 'checkin')?.count || 0;
  const focusStreak = streaks.find((s: any) => s.type === 'focus')?.count || 0;

  return (
    <div className="w-full space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-ti-green-500 to-ti-teal-500 rounded-3xl p-8 text-white shadow-card"
      >
        <h1 className="text-3xl font-extrabold mb-2">Hey {user?.name}! 🌱</h1>
        <p className="text-white/90 text-lg">Your journey and growth</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Chat with Bot */}
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💬</span>
              <CardTitle className="text-ti-ink-900">Chat with the Bot Now</CardTitle>
            </div>
            <p className="text-sm text-ti-ink/60 mt-1">Get support anytime you need</p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-ti-ink/70 mb-4">
                Talk to our AI assistant about anything on your mind. Get support, advice, or just someone to listen.
              </p>
              <Link to="/app/chat">
                <Button size="lg" variant="primary" className="bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white rounded-xl px-8 shadow-md hover:shadow-lg">
                  Start Chatting
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Growth Journey */}
        <Card className="bg-gradient-to-br from-ti-green-500/10 to-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌱</span>
              <CardTitle className="text-ti-ink-900">Your Growth Journey</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-ti-ink-800 flex items-center">
                <span className="mr-2">💬</span> Conversations
              </span>
              <Badge variant="positive">{stats?.totalMessages || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ti-ink-800 flex items-center">
                <span className="mr-2">❤️</span> Check-ins
              </span>
              <Badge variant="info">{stats?.totalCheckIns || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ti-ink-800 flex items-center">
                <span className="mr-2">😊</span> Average Mood
              </span>
              <Badge variant="neutral">{stats?.averageMood?.toFixed(1) || 0}/5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ti-ink-800 flex items-center">
                <span className="mr-2">🔥</span> Check-in Streak
              </span>
              <Badge variant="positive">{checkInStreak} days</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks - Helper Tool */}
      {todayTasks.length > 0 && (
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-ti-ink-900 flex items-center">
                <span className="mr-2">📝</span> Things on your mind
              </CardTitle>
              <p className="text-sm text-ti-ink/60 mt-1">
                Let's tackle these together, one step at a time
              </p>
            </div>
            <Link to="/app/tasks">
              <Button size="sm" variant="ghost" className="text-ti-green-600 hover:bg-ti-green-50">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 bg-ti-beige-50 rounded-xl border border-ti-beige-200 hover:shadow-soft transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" checked={task.status === 'done'} readOnly />
                    <span className={task.status === 'done' ? 'line-through text-black/50' : 'text-ti-ink-900'}>
                      {task.title}
                    </span>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'warning' : 'default'}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const QuickActionCard: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white border border-ti-beige-300 rounded-xl p-4 text-center hover:shadow-card transition-all"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm font-medium text-ti-ink-900">{label}</p>
    </motion.div>
  </Link>
);
