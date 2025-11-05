import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@talkitout/ui';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, privacyAPI } from '../api/client';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const [pomodoro, setPomodoro] = useState(
    profile?.preferences?.pomodoro || {
      focusDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      cyclesBeforeLongBreak: 4,
    }
  );

  const handleUpdatePomodoro = async () => {
    try {
      await userAPI.updateProfile({ preferences: { pomodoro } });
      await refreshUser();
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pomodoro Settings</CardTitle>
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
            <Button onClick={handleUpdatePomodoro}>Save Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy & Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-ti-text-secondary mb-2">
                Export all your data in JSON format (PDPA/GDPR compliance)
              </p>
              <Button onClick={handleExportData} variant="secondary">
                Export My Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
