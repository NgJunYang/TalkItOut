import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@talkitout/ui';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, privacyAPI } from '../api/client';
import { getUserPreferences, saveUserPreferences } from '../store/userPrefs';
import { getVoiceConfig, isVoiceEnabled } from '../lib/voiceClient';
import toast from 'react-hot-toast';

interface PomodoroSettings {
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
}

export const SettingsPage: React.FC = () => {
  const { profile, refreshUser } = useAuth();
  const [pomodoro, setPomodoro] = useState<PomodoroSettings>(
    profile?.preferences?.pomodoro || {
      focusDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      cyclesBeforeLongBreak: 4,
    }
  );

  // Voice settings
  const [voicePrefs, setVoicePrefs] = useState(getUserPreferences());
  const [voiceConfig, setVoiceConfig] = useState({
    enabled: false,
    defaultVoiceId: 'Rachel',
    maxRecordingSeconds: 60,
  });

  useEffect(() => {
    // Load voice config
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
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleUpdateVoiceSettings = () => {
    try {
      saveUserPreferences(voicePrefs);
      toast.success('Voice settings saved!');
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
      a.download = `talkitout-data-${Date.now()}.json`;
      a.click();
      toast.success('Data exported!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-extrabold tracking-tight text-ti-ink-900 mb-6">Settings</h1>

      <div className="space-y-6">
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-ti-ink-900">Pomodoro Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Focus Duration (minutes)"
              type="number"
              value={pomodoro.focusDuration}
              onChange={(e) =>
                setPomodoro((p) => ({ ...p, focusDuration: parseInt(e.target.value) }))
              }
              min="5"
              max="60"
            />
            <Input
              label="Break Duration (minutes)"
              type="number"
              value={pomodoro.breakDuration}
              onChange={(e) =>
                setPomodoro((p) => ({ ...p, breakDuration: parseInt(e.target.value) }))
              }
              min="1"
              max="30"
            />
            <Input
              label="Long Break Duration (minutes)"
              type="number"
              value={pomodoro.longBreakDuration}
              onChange={(e) =>
                setPomodoro((p) => ({ ...p, longBreakDuration: parseInt(e.target.value) }))
              }
              min="5"
              max="60"
            />
            <Input
              label="Cycles Before Long Break"
              type="number"
              value={pomodoro.cyclesBeforeLongBreak}
              onChange={(e) =>
                setPomodoro((p) => ({ ...p, cyclesBeforeLongBreak: parseInt(e.target.value) }))
              }
              min="2"
              max="10"
            />
            <Button onClick={handleUpdatePomodoro} className="bg-ti-green-500 hover:bg-ti-green-600 text-white">Save Settings</Button>
          </CardContent>
        </Card>

        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-ti-ink-900 flex items-center gap-2">
              <span>🎤</span> Voice Settings
            </CardTitle>
            {!voiceConfig.enabled && (
              <p className="text-sm text-amber-600 mt-2">
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-ti-beige-50 rounded-xl">
                <div>
                  <h4 className="font-medium text-ti-ink-900">Auto-play assistant voice</h4>
                  <p className="text-sm text-ti-ink-700">
                    Automatically play audio for assistant responses
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voicePrefs.autoPlayVoice}
                    onChange={(e) =>
                      setVoicePrefs((p) => ({ ...p, autoPlayVoice: e.target.checked }))
                    }
                    disabled={!voiceConfig.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-ti-beige-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ti-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ti-beige-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ti-green-500"></div>
                </label>
              </div>

              <Button
                onClick={handleUpdateVoiceSettings}
                disabled={!voiceConfig.enabled}
                className="bg-ti-green-500 hover:bg-ti-green-600 text-white"
              >
                Save Voice Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-ti-ink-900">Privacy & Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-ti-ink-800 mb-2">
                Export all your data in JSON format (PDPA/GDPR compliance)
              </p>
              <Button onClick={handleExportData} variant="secondary" className="border-ti-beige-300 hover:bg-ti-beige-100">
                Export My Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
