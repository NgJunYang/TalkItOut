import { useState, useEffect, useCallback } from 'react';
import { checkInAPI } from '../api/client';

interface CheckinNudgeState {
  shouldNudge: boolean;
  dismissNudge: () => void;
  markCheckedIn: () => void;
  hasCheckedInToday: boolean;
}

const NUDGE_MESSAGE_COUNT = 3;
const NUDGE_TIME_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'checkin-nudge-dismissed';

/**
 * Hook to manage check-in nudges
 * Shows a non-blocking nudge after 3 user messages or 5 minutes, whichever comes first
 */
export function useCheckinNudge(userMessageCount: number): CheckinNudgeState {
  const [shouldNudge, setShouldNudge] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [chatStartTime] = useState(() => Date.now());

  // Check if user has already checked in today
  useEffect(() => {
    const checkTodayCheckin = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const response = await checkInAPI.getMine({
          startDate: today.toISOString(),
          limit: 1,
        });

        const hasCheckin = response.data.checkIns && response.data.checkIns.length > 0;
        setHasCheckedInToday(hasCheckin);

        // Also check session storage for dismissed state
        const dismissedToday = sessionStorage.getItem(STORAGE_KEY) === today.toDateString();
        setDismissed(dismissedToday);
      } catch (error) {
        console.error('Error checking today check-in:', error);
      }
    };

    checkTodayCheckin();
  }, []);

  // Timer-based nudge (5 minutes)
  useEffect(() => {
    if (hasCheckedInToday || dismissed) {
      return;
    }

    const timer = setTimeout(() => {
      setShouldNudge(true);
    }, NUDGE_TIME_MS);

    return () => clearTimeout(timer);
  }, [hasCheckedInToday, dismissed]);

  // Message count-based nudge (3 messages)
  useEffect(() => {
    if (hasCheckedInToday || dismissed) {
      return;
    }

    if (userMessageCount >= NUDGE_MESSAGE_COUNT) {
      setShouldNudge(true);
    }
  }, [userMessageCount, hasCheckedInToday, dismissed]);

  const dismissNudge = useCallback(() => {
    setShouldNudge(false);
    setDismissed(true);

    // Store dismissal in session storage (cleared when browser closes)
    const today = new Date().toDateString();
    sessionStorage.setItem(STORAGE_KEY, today);
  }, []);

  const markCheckedIn = useCallback(() => {
    setHasCheckedInToday(true);
    setShouldNudge(false);
    setDismissed(true);
  }, []);

  return {
    shouldNudge: shouldNudge && !hasCheckedInToday && !dismissed,
    dismissNudge,
    markCheckedIn,
    hasCheckedInToday,
  };
}
