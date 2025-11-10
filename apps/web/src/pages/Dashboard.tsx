import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Sparkles, Target } from 'lucide-react';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
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

  const todayTasks = tasks.filter((t) => {
    if (!t.dueAt) return false;
    const due = new Date(t.dueAt);
    const today = new Date();
    return due.toDateString() === today.toDateString();
  });

  const streaks = profile?.streaks || [];
  const checkInStreak = streaks.find((s: any) => s.type === 'checkin')?.count || 0;
  const focusStreak = streaks.find((s: any) => s.type === 'focus')?.count || 0;

  const statCards = [
    { label: 'Conversations', value: stats?.totalMessages || 0 },
    { label: 'Check-ins', value: stats?.totalCheckIns || 0 },
    { label: 'Average mood', value: `${stats?.averageMood?.toFixed(1) || 0}/5` },
    { label: 'Check-in streak', value: `${checkInStreak} days` },
    { label: 'Focus streak', value: `${focusStreak} days` },
  ];

  const primaryBtn =
    'inline-flex items-center gap-2 rounded-full bg-[var(--beige-1)] px-6 py-3 font-semibold text-black shadow-soft transition duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-black/30';
  const subtleChip =
    'inline-flex items-center rounded-full bg-beige2/60 px-3 py-1 text-xs font-medium text-muted';

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="rounded-3xl border border-border bg-gradient-to-r from-beige2/80 to-beige3/40 p-8 shadow-soft"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Your journey</p>
        <h1 className="mt-3 text-4xl font-semibold text-text">Hey {user?.name}, let's keep the momentum.</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted">
          Check in with your AI guide, review goals, or take a breath. This space adapts to what you need.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link to="/app/chat" className={primaryBtn}>
            Start chatting
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/app/checkins"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-semibold text-text transition hover:bg-beige2/40 focus-visible:ring-2 focus-visible:ring-beige1"
          >
            Log a mood
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-6">
        <Card className="space-y-4">
          <SectionHeader
            icon={Sparkles}
            title="Growth metrics"
            description="Quick glance at the last week."
          />
          <div className="grid gap-3">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface px-4 py-3"
              >
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="text-lg font-semibold text-text">{stat.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5">
          <SectionHeader
            icon={Target}
            title="Today's priorities"
            description={
              todayTasks.length > 0 ? "Let's clear a few items together." : 'No tasks scheduled today. Take a breather.'
            }
          />
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={task.status === 'done'} readOnly />
                    <span className={task.status === 'done' ? 'text-muted line-through' : 'font-medium text-text'}>
                      {task.title}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-muted">{task.priority}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-muted">
              Nothing urgent right now. Maybe revisit your goals or check in with yourself.
            </p>
          )}
          <Link
            to="/app/tasks"
            className="inline-flex items-center text-sm font-semibold text-muted transition hover:text-text"
          >
            View all tasks <ArrowRight size={16} className="ml-1" />
          </Link>
        </Card>

        <Card className="space-y-5">
          <SectionHeader
            icon={CalendarDays}
            title="Recent check-ins"
            description="Track how your week has been feeling."
          />
          <div className="space-y-3">
            {checkIns.slice(0, 4).map((entry) => (
              <div
                key={entry._id}
                className="rounded-2xl border border-border/80 bg-surface px-4 py-3"
              >
                <p className="text-sm font-semibold text-text">
                  {new Date(entry.createdAt).toLocaleDateString('en-SG', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <p className="text-muted">{entry.moodLabel || `Mood score ${entry.mood}`}</p>
              </div>
            ))}
            {checkIns.length === 0 && (
              <p className="text-muted">No recent check-ins. Logging feelings helps spot trends.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
