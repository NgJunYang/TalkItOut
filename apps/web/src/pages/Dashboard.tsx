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
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-green rounded-2xl p-8 text-white shadow-glow-green relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-white/90 text-lg">Ready to make today productive? Let's grow together 🌱</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard to="/app/focus" icon="🎯" label="Start Focus Session" />
        <QuickActionCard to="/app/checkins" icon="❤️" label="Log Check-in" />
        <QuickActionCard to="/app/chat" icon="💬" label="Chat with AI" />
        <QuickActionCard to="/app/tasks" icon="✓" label="Add Task" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Mood Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {moodChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={moodChartData}>
                  <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <YAxis domain={[1, 5]} stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #F0E6D2',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{ fill: '#22C55E', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-ti-text-tertiary text-center py-8">
                No check-ins yet. Start tracking your mood!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Streaks & Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-ti-text-secondary">Check-in Streak</span>
              <Badge variant="positive">🔥 {checkInStreak} days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ti-text-secondary">Focus Streak</span>
              <Badge variant="info">⚡ {focusStreak} days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ti-text-secondary">Average Mood</span>
              <Badge variant="neutral">{stats?.averageMood || 0}/5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ti-text-secondary">Total Check-ins</span>
              <Badge>{stats?.totalCheckIns || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Today's Tasks</CardTitle>
          <Link to="/app/tasks">
            <Button size="sm" variant="ghost">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todayTasks.length > 0 ? (
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map((task) => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-accent-mint/30 to-white border border-brand-green/10 rounded-xl hover:shadow-soft transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      readOnly
                      className="w-5 h-5 text-brand-green border-brand-green/30 rounded focus:ring-brand-green"
                    />
                    <span className={task.status === 'done' ? 'line-through text-ti-text-tertiary' : 'font-medium text-ink'}>
                      {task.title}
                    </span>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'warning' : 'default'}>
                    {task.priority}
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-ti-text-tertiary text-center py-8">No tasks due today. You're all set!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const QuickActionCard: React.FC<{ to: string; icon: string; label: string }> = ({ to, icon, label }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white border-2 border-brand-green/20 rounded-2xl p-6 text-center hover:shadow-soft-lg hover:border-brand-green/40 transition-all group"
    >
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="text-sm font-semibold text-ink">{label}</p>
    </motion.div>
  </Link>
);
