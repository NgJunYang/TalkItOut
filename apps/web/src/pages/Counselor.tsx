import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
            <div className="text-3xl font-extrabold text-brand-teal">{metrics?.users.total || 0}</div>
            <div className="text-sm text-ti-text-secondary font-medium">Total Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold text-brand-green">{metrics?.users.active || 0}</div>
            <div className="text-sm text-ti-text-secondary font-medium">Active (7 days)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-extrabold text-blue-600">{metrics?.mood.average || 0}</div>
            <div className="text-sm text-ti-text-secondary font-medium">Avg Mood</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 bg-gradient-to-br from-red-50 to-white">
            <div className="text-3xl font-extrabold text-red-600">{metrics?.risk.openFlags || 0}</div>
            <div className="text-sm text-ti-text-secondary font-medium">Open Risk Flags</div>
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
                <motion.div
                  key={flag._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start justify-between p-4 bg-gradient-to-r from-red-50/50 to-white border-l-4 border-red-500 rounded-xl shadow-soft hover:shadow-soft-lg transition-all"
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
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
