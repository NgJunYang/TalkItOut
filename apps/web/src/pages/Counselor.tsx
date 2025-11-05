import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@talkitout/ui';
import { riskAPI, metricsAPI } from '../api/client';
import toast from 'react-hot-toast';

export const CounselorDashboard: React.FC = () => {
  const [flags, setFlags] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [flagsRes, metricsRes] = await Promise.all([
        riskAPI.getFlags({ status: 'open' }),
        metricsAPI.getAggregate({ days: 7 }),
      ]);
      setFlags(flagsRes.data.flags);
      setMetrics(metricsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Counselor Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics?.users.total || 0}</div>
            <div className="text-sm text-ti-text-tertiary">Total Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics?.users.active || 0}</div>
            <div className="text-sm text-ti-text-tertiary">Active (7 days)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics?.mood.average || 0}</div>
            <div className="text-sm text-ti-text-tertiary">Avg Mood</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{metrics?.risk.openFlags || 0}</div>
            <div className="text-sm text-ti-text-tertiary">Open Risk Flags</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Flags - Requires Attention</CardTitle>
        </CardHeader>
        <CardContent>
          {flags.length === 0 ? (
            <p className="text-ti-text-tertiary text-center py-8">No open risk flags</p>
          ) : (
            <div className="space-y-3">
              {flags.map((flag) => (
                <div
                  key={flag._id}
                  className="flex items-start justify-between p-4 bg-ti-surface-hover rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{flag.userId.name}</span>
                      <Badge
                        variant={
                          flag.severity === 3 ? 'negative' : flag.severity === 2 ? 'warning' : 'default'
                        }
                      >
                        Severity {flag.severity}
                      </Badge>
                      {flag.tags.map((tag: string) => (
                        <Badge key={tag} variant="info">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-ti-text-secondary">
                      {flag.messageId?.text?.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-ti-text-tertiary mt-1">
                      {new Date(flag.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
