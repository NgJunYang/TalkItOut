import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@talkitout/ui';
import { riskAPI, metricsAPI } from '../api/client';
import toast from 'react-hot-toast';

export const CounselorDashboard: React.FC = () => {
  const [flags, setFlags] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [flagsRes, metricsRes] = await Promise.all([
        riskAPI.getFlags({ status: 'open' }),
        metricsAPI.getAggregate({ days: 7 }),
      ]);
      setFlags(flagsRes.data.flags || []);
      setMetrics(metricsRes.data || {});
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error?.response?.data?.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-ti-ink-900 mb-6">Counselor Dashboard</h1>
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ti-green-600 mx-auto mb-4" />
              <p className="text-ti-ink-800">Loading dashboard data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-extrabold tracking-tight text-ti-ink-900 mb-6">Counselor Dashboard</h1>
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-ti-ink-900 font-medium mb-2">Failed to load dashboard data</p>
              <p className="text-black/60 text-sm mb-4">{error}</p>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-ti-green-500 hover:bg-ti-green-600 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-extrabold tracking-tight text-ti-ink-900 mb-6">Counselor Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-ti-ink-900">{metrics?.users.total || 0}</div>
            <div className="text-sm text-black/60">Total Students</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-ti-ink-900">{metrics?.users.active || 0}</div>
            <div className="text-sm text-black/60">Active (7 days)</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-ti-ink-900">{metrics?.mood.average || 0}</div>
            <div className="text-sm text-black/60">Avg Mood</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{metrics?.risk.openFlags || 0}</div>
            <div className="text-sm text-black/60">Open Risk Flags</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-ti-ink-900">Risk Flags - Requires Attention</CardTitle>
        </CardHeader>
        <CardContent>
          {flags.length === 0 ? (
            <p className="text-black/60 text-center py-8">No open risk flags</p>
          ) : (
            <div className="space-y-3">
              {flags.map((flag) => (
                <div
                  key={flag._id}
                  className="flex items-start justify-between p-4 bg-ti-beige-50 rounded-xl border border-ti-beige-200 hover:shadow-soft transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-ti-ink-900">{flag.userId.name}</span>
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
                    <p className="text-sm text-ti-ink-800">
                      {flag.messageId?.text?.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-black/50 mt-1">
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
