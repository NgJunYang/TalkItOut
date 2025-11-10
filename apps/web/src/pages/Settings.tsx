import React, { useEffect, useState } from 'react';
import { Headphones, Palette, Shield, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI, privacyAPI } from '../api/client';
import { getUserPreferences, saveUserPreferences } from '../store/userPrefs';
import { getVoiceConfig, isVoiceEnabled } from '../lib/voiceClient';
import { Card } from '../components/Card';
import { Toggle } from '../components/Toggle';
import { ColorSwatch } from '../components/ColorSwatch';
import { Slider } from '../components/Slider';
import { SectionHeader } from '../components/SectionHeader';

interface PomodoroSettings {
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
}

const accentOptions = [
  { color: '#d4c4a8', label: 'Classic' },
  { color: '#c6b197', label: 'Warm Sand' },
  { color: '#deb998', label: 'Sunset' },
  { color: '#bba58f', label: 'Cocoa' },
];

const inputClass =
  'w-full bg-bg text-text border border-border dark:border-borderDark rounded-xl px-4 py-3 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--beige-1)] transition-shadow';

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-full bg-[var(--beige-1)] px-6 py-3 text-base font-semibold text-black shadow-soft transition duration-200 hover:brightness-110 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-black/40';

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-base font-semibold text-text bg-surface transition duration-200 hover:bg-beige2/60 focus-visible:ring-2 focus-visible:ring-beige1';

export const SettingsPage: React.FC = () => {
  const { profile, refreshUser } = useAuth();
  const { darkMode, toggleDarkMode, accentColor, setAccentColor } = useTheme();
  const [pomodoro, setPomodoro] = useState<PomodoroSettings>(
    profile?.preferences?.pomodoro || {
      focusDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      cyclesBeforeLongBreak: 4,
    }
  );
  const [voicePrefs, setVoicePrefs] = useState(getUserPreferences());
  const [voiceConfig, setVoiceConfig] = useState({
    enabled: false,
    defaultVoiceId: 'Rachel',
    maxRecordingSeconds: 60,
  });

  useEffect(() => {
    const config = getVoiceConfig();
    setVoiceConfig({
      enabled: isVoiceEnabled(),
      defaultVoiceId: config.defaultVoiceId || 'Rachel',
      maxRecordingSeconds: config.maxRecordingSeconds || 60,
    });
  }, []);

  const handleUpdatePomodoro = async () => {
    try {
      await userAPI.updateProfile({ preferences: { pomodoro } });
      await refreshUser();
      toast.success('Focus settings saved.');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleUpdateVoiceSettings = () => {
    try {
      saveUserPreferences(voicePrefs);
      toast.success('Voice settings saved.');
    } catch (error) {
      toast.error('Failed to save voice settings');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await privacyAPI.exportData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talkio-data-${Date.now()}.json`;
      a.click();
      toast.success('Data exported!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">Settings</p>
        <h1 className="text-3xl font-semibold text-text">Personalize Talk.IO</h1>
        <p className="text-base text-muted">
          Tune the assistant experience, focus flows, and voice controls so the app feels made for you.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="space-y-6">
          <SectionHeader
            icon={Palette}
            title="Theme & mood"
            description="Switch between cozy light and cinematic dark, then pick an accent that feels right."
          />
          <Toggle isOn={darkMode} onToggle={toggleDarkMode} label="Dark mode" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {accentOptions.map((option) => (
              <ColorSwatch
                key={option.color}
                color={option.color}
                label={option.label}
                isActive={accentColor === option.color}
                onSelect={setAccentColor}
              />
            ))}
          </div>
        </Card>

        <Card className="space-y-6">
          <SectionHeader
            icon={Timer}
            title="Focus timer"
            description="Adjust your Pomodoro cycle. Sliders update the durations instantly."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <Slider
                label={`Focus (${pomodoro.focusDuration} min)`}
                min={15}
                max={60}
                step={5}
                value={pomodoro.focusDuration}
                onChange={(e) =>
                  setPomodoro((prev) => ({ ...prev, focusDuration: Number(e.target.value) }))
                }
              />
              <Slider
                label={`Short break (${pomodoro.breakDuration} min)`}
                min={3}
                max={20}
                step={1}
                value={pomodoro.breakDuration}
                onChange={(e) =>
                  setPomodoro((prev) => ({ ...prev, breakDuration: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-4">
              <Slider
                label={`Long break (${pomodoro.longBreakDuration} min)`}
                min={10}
                max={40}
                step={5}
                value={pomodoro.longBreakDuration}
                onChange={(e) =>
                  setPomodoro((prev) => ({ ...prev, longBreakDuration: Number(e.target.value) }))
                }
              />
              <Slider
                label={`Cycles before long break (${pomodoro.cyclesBeforeLongBreak})`}
                min={2}
                max={8}
                step={1}
                value={pomodoro.cyclesBeforeLongBreak}
                onChange={(e) =>
                  setPomodoro((prev) => ({ ...prev, cyclesBeforeLongBreak: Number(e.target.value) }))
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleUpdatePomodoro} className={primaryButtonClass}>
              Save focus plan
            </button>
          </div>
        </Card>

        <Card className="space-y-6">
          <SectionHeader
            icon={Headphones}
            title="Voice & playback"
            description={
              voiceConfig.enabled
                ? 'Auto narrate responses or keep things quiet. Your accent preference is remembered per device.'
                : 'Voice replies are not available right now, but you can still manage your preference.'
            }
          />
          <Toggle
            isOn={voicePrefs.autoPlayVoice}
            onToggle={() => setVoicePrefs((prev) => ({ ...prev, autoPlayVoice: !prev.autoPlayVoice }))}
            label="Auto-play assistant replies"
            disabled={!voiceConfig.enabled}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-muted">Preferred voice ID</span>
              <input
                className={inputClass}
                value={voicePrefs.voiceId}
                onChange={(e) => setVoicePrefs((prev) => ({ ...prev, voiceId: e.target.value }))}
                placeholder="Rachel"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-muted">Max recording seconds</span>
              <input
                className={inputClass}
                disabled
                value={voiceConfig.maxRecordingSeconds}
                readOnly
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUpdateVoiceSettings}
              className={primaryButtonClass}
              disabled={!voiceConfig.enabled}
            >
              Save voice settings
            </button>
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader
            icon={Shield}
            title="Privacy & data"
            description="Export a full copy of your data anytime. Files are delivered in JSON format."
          />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleExportData} className={secondaryButtonClass}>
              Export my data
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
