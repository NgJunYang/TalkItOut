import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardHeader, CardTitle, CardContent, Progress } from '@talkitout/ui';
import { pomodoroAPI } from '../api/client';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const FocusPage: React.FC = () => {
  const { profile } = useAuth();
  const { socket } = useSocket();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentCycle, setCurrentCycle] = useState(0);
  const [sessionType, setSessionType] = useState<'focus' | 'break' | 'longBreak'>('focus');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const preferences = profile?.preferences?.pomodoro || {
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });

        // Emit tick event
        if (socket) {
          socket.emit('pomodoro:tick', { timeLeft: timeLeft - 1 });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, socket]);

  const handleStart = async () => {
    try {
      const response = await pomodoroAPI.start();
      setSessionId(response.data._id);
      setIsActive(true);
      setIsPaused(false);
      setSessionType('focus');
      setTimeLeft(preferences.focusDuration * 60);
      setCurrentCycle(0);

      if (socket) {
        socket.emit('pomodoro:start', { sessionId: response.data._id });
      }

      toast.success('Focus session started!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start session');
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (socket) {
      socket.emit(isPaused ? 'pomodoro:resume' : 'pomodoro:pause', {});
    }
  };

  const handleStop = async () => {
    if (!sessionId) return;

    try {
      await pomodoroAPI.stop(currentCycle);
      setIsActive(false);
      setIsPaused(false);
      setSessionId(null);
      setTimeLeft(preferences.focusDuration * 60);
      setCurrentCycle(0);
      setSessionType('focus');

      if (socket) {
        socket.emit('pomodoro:stop', { cyclesCompleted: currentCycle });
      }

      toast.success(`Great work! You completed ${currentCycle} cycle(s)`);
    } catch (error) {
      toast.error('Failed to stop session');
    }
  };

  const handlePhaseComplete = () => {
    if (sessionType === 'focus') {
      const newCycle = currentCycle + 1;
      setCurrentCycle(newCycle);

      if (newCycle >= preferences.cyclesBeforeLongBreak) {
        // Long break
        setSessionType('longBreak');
        setTimeLeft(preferences.longBreakDuration * 60);
        toast.success('🎉 Time for a long break!');
      } else {
        // Short break
        setSessionType('break');
        setTimeLeft(preferences.breakDuration * 60);
        toast.success('Take a short break!');
      }
    } else {
      // Back to focus
      setSessionType('focus');
      setTimeLeft(preferences.focusDuration * 60);
      if (sessionType === 'longBreak') {
        setCurrentCycle(0); // Reset after long break
      }
      toast.success('Ready for the next focus session?');
    }

    // Play notification sound (browser API)
    new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBiV8yO/Xjj0KF2i76+2OPQ').play().catch(() => {});
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = sessionType === 'focus'
    ? preferences.focusDuration * 60
    : sessionType === 'break'
    ? preferences.breakDuration * 60
    : preferences.longBreakDuration * 60;

  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2 capitalize">
                  {sessionType === 'focus' ? '🎯 Focus Time' : sessionType === 'break' ? '☕ Short Break' : '🌟 Long Break'}
                </h2>
                <p className="text-ti-text-tertiary mb-8">
                  Cycle {currentCycle + 1} of {preferences.cyclesBeforeLongBreak}
                </p>

                {/* Breathing Circle */}
                <motion.div
                  animate={{
                    scale: isActive && !isPaused && sessionType === 'focus' ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="mx-auto mb-8 relative"
                  style={{ width: 280, height: 280 }}
                >
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="140"
                      cy="140"
                      r="130"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-ti-border"
                    />
                    <circle
                      cx="140"
                      cy="140"
                      r="130"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 130}`}
                      strokeDashoffset={`${2 * Math.PI * 130 * (1 - progressPercent / 100)}`}
                      strokeLinecap="round"
                      className="text-ti-primary-600 transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</div>
                      {isPaused && <div className="text-ti-text-tertiary">Paused</div>}
                    </div>
                  </div>
                </motion.div>

                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  {!isActive ? (
                    <Button onClick={handleStart} size="lg">
                      Start Focus Session
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handlePause} variant="secondary">
                        {isPaused ? 'Resume' : 'Pause'}
                      </Button>
                      <Button onClick={handleStop} variant="danger">
                        End Session
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info & Activities */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ti-text-secondary">Focus:</span>
                <span>{preferences.focusDuration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ti-text-secondary">Break:</span>
                <span>{preferences.breakDuration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ti-text-secondary">Long Break:</span>
                <span>{preferences.longBreakDuration} min</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full justify-start">
                🧘 Box Breathing (4-4-4-4)
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start">
                🖐️ 5-4-3-2-1 Grounding
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start">
                📝 Capture a Thought
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
