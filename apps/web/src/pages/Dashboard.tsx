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
        className="bg-gradient-to-r from-ti-green-500 to-ti-green-600 rounded-2xl p-8 text-white shadow-card"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-white/90">Ready to make today productive?</p>
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
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-ti-ink-900">Mood Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {moodChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={moodChartData}>
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis domain={[1, 5]} stroke="#9ca3af" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={{ fill: '#22C55E', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-black/60 text-center py-8">
                No check-ins yet. Start tracking your mood!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Streaks & Stats */}
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-ti-ink-900">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-ti-ink-800">Check-in Streak</span>
              <Badge variant="positive">🔥 {checkInStreak} days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ti-ink-800">Focus Streak</span>
              <Badge variant="info">⚡ {focusStreak} days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ti-ink-800">Average Mood</span>
              <Badge variant="neutral">{stats?.averageMood || 0}/5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ti-ink-800">Total Check-ins</span>
              <Badge>{stats?.totalCheckIns || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-ti-ink-900">Today's Tasks</CardTitle>
          <Link to="/app/tasks">
            <Button size="sm" variant="ghost" className="text-ti-green-600 hover:bg-ti-green-50">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todayTasks.length > 0 ? (
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
          ) : (
            <p className="text-black/60 text-center py-8">No tasks due today. You're all set!</p>
          )}
        </CardContent>
      </Card>
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
