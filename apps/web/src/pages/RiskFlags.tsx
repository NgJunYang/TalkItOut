import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@talkitout/ui';
import { riskAPI } from '../api/client';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Clock, ChevronRight } from 'lucide-react';

interface RiskFlag {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  messageId: string;
  tags: string[];
  severity: number;
  status: 'open' | 'in_review' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

interface GroupedStudent {
  userId: string;
  userName: string;
  userEmail: string;
  flags: RiskFlag[];
  highestSeverity: number;
  openCount: number;
  inReviewCount: number;
  resolvedCount: number;
}

export const RiskFlagsPage: React.FC = () => {
  const [flags, setFlags] = useState<RiskFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_review' | 'resolved'>('all');
  const [selectedStudent, setSelectedStudent] = useState<GroupedStudent | null>(null);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    setIsLoading(true);
    try {
      const response = await riskAPI.getFlags();
      setFlags(response.data.flags || []);
    } catch (error) {
      toast.error('Failed to load risk flags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (flagId: string, newStatus: 'open' | 'in_review' | 'resolved') => {
    try {
      await riskAPI.updateFlag(flagId, { status: newStatus });
      toast.success('Flag status updated');
      loadFlags();
    } catch (error) {
      toast.error('Failed to update flag status');
    }
  };

  // Group flags by student
  const groupedStudents: GroupedStudent[] = React.useMemo(() => {
    const studentMap = new Map<string, GroupedStudent>();

    flags.forEach((flag) => {
      if (!flag.userId) return; // Skip if userId is null/undefined

      const userId = flag.userId._id;
      if (!studentMap.has(userId)) {
        studentMap.set(userId, {
          userId,
          userName: flag.userId.name,
          userEmail: flag.userId.email,
          flags: [],
          highestSeverity: 0,
          openCount: 0,
          inReviewCount: 0,
          resolvedCount: 0,
        });
      }

      const student = studentMap.get(userId)!;
      student.flags.push(flag);
      student.highestSeverity = Math.max(student.highestSeverity, flag.severity);

      if (flag.status === 'open') student.openCount++;
      else if (flag.status === 'in_review') student.inReviewCount++;
      else if (flag.status === 'resolved') student.resolvedCount++;
    });

    return Array.from(studentMap.values()).sort((a, b) => {
      // Sort by highest severity first, then by open count
      if (b.highestSeverity !== a.highestSeverity) {
        return b.highestSeverity - a.highestSeverity;
      }
      return b.openCount - a.openCount;
    });
  }, [flags]);

  // Filter students based on selected filter
  const filteredStudents = React.useMemo(() => {
    if (filter === 'all') return groupedStudents;
    return groupedStudents.filter((student) => {
      if (filter === 'open') return student.openCount > 0;
      if (filter === 'in_review') return student.inReviewCount > 0;
      if (filter === 'resolved') return student.resolvedCount > 0 && student.openCount === 0 && student.inReviewCount === 0;
      return true;
    });
  }, [groupedStudents, filter]);

  const getSeverityColor = (severity: number) => {
    if (severity >= 3) return 'text-red-600 bg-red-50 border-red-200';
    if (severity >= 2) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 3) return 'High';
    if (severity >= 2) return 'Medium';
    return 'Low';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'resolved') return <CheckCircle className="w-4 h-4" />;
    if (status === 'in_review') return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getStatusVariant = (status: string): 'positive' | 'info' | 'negative' => {
    if (status === 'resolved') return 'positive';
    if (status === 'in_review') return 'info';
    return 'negative';
  };

  const studentCounts = {
    all: groupedStudents.length,
    open: groupedStudents.filter((s) => s.openCount > 0).length,
    in_review: groupedStudents.filter((s) => s.inReviewCount > 0).length,
    resolved: groupedStudents.filter((s) => s.resolvedCount > 0 && s.openCount === 0 && s.inReviewCount === 0).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ti-green-600 mx-auto mb-4" />
          <p className="text-ti-ink/70">Loading risk flags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ti-ink-900 mb-2">Risk Flags</h1>
        <p className="text-ti-ink/70">Monitor and manage student risk indicators</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-ti-ink-900">Students with Flags</CardTitle>
              {/* Filter Tabs */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {(['all', 'open', 'in_review', 'resolved'] as const).map((status) => (
                  <motion.button
                    key={status}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                      filter === status
                        ? 'bg-ti-green-500 text-white shadow-md'
                        : 'bg-ti-beige-100 border border-ti-beige-300 text-ti-ink-700 hover:border-ti-green-300'
                    }`}
                  >
                    {status === 'all' ? 'All' : status === 'in_review' ? 'In Review' : status.charAt(0).toUpperCase() + status.slice(1)}{' '}
                    ({studentCounts[status]})
                  </motion.button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <p className="text-black/60 text-center py-8">
                    {filter === 'all' ? 'No students with flags' : `No students with ${filter} flags`}
                  </p>
                ) : (
                  filteredStudents.map((student) => (
                    <motion.div
                      key={student.userId}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedStudent(student)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedStudent?.userId === student.userId
                          ? 'bg-ti-green-50 border-ti-green-500 shadow-soft'
                          : 'bg-ti-beige-50 border-ti-beige-200 hover:border-ti-green-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-ti-ink-900 truncate">{student.userName}</h3>
                          <p className="text-xs text-black/60 mt-0.5 truncate">{student.userEmail}</p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {student.openCount > 0 && (
                              <Badge variant="negative" className="text-xs">
                                {student.openCount} Open
                              </Badge>
                            )}
                            {student.inReviewCount > 0 && (
                              <Badge variant="info" className="text-xs">
                                {student.inReviewCount} Review
                              </Badge>
                            )}
                            {student.resolvedCount > 0 && (
                              <Badge variant="positive" className="text-xs">
                                {student.resolvedCount} Resolved
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div
                            className={`px-2 py-0.5 rounded border text-xs font-bold ${getSeverityColor(student.highestSeverity)}`}
                          >
                            {getSeverityLabel(student.highestSeverity)}
                          </div>
                          <ChevronRight className="w-4 h-4 text-ti-ink/40" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flag Details */}
        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="text-ti-ink-800">Select a student to view their risk flags</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Student Header */}
              <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-ti-ink-900 text-xl">{selectedStudent.userName}</CardTitle>
                      <p className="text-sm text-ti-ink/60 mt-1">{selectedStudent.userEmail}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg border-2 font-bold text-sm ${getSeverityColor(selectedStudent.highestSeverity)}`}>
                      Highest: {getSeverityLabel(selectedStudent.highestSeverity)} Risk
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-red-50 rounded-xl">
                      <div className="text-2xl font-bold text-red-600">{selectedStudent.openCount}</div>
                      <div className="text-xs text-black/60 mt-1">Open</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{selectedStudent.inReviewCount}</div>
                      <div className="text-xs text-black/60 mt-1">In Review</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{selectedStudent.resolvedCount}</div>
                      <div className="text-xs text-black/60 mt-1">Resolved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Flags */}
              <AnimatePresence>
                {selectedStudent.flags.map((flag) => (
                  <motion.div
                    key={flag._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: Tags & Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant={getStatusVariant(flag.status)} className="flex items-center gap-1">
                                {getStatusIcon(flag.status)}
                                {flag.status === 'in_review' ? 'In Review' : flag.status.charAt(0).toUpperCase() + flag.status.slice(1)}
                              </Badge>
                              <div className={`px-2 py-1 rounded border text-xs font-bold ${getSeverityColor(flag.severity)}`}>
                                {getSeverityLabel(flag.severity)} Risk
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {flag.tags.map((tag) => (
                                <Badge key={tag} variant="neutral" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <p className="text-xs text-ti-ink/50">
                              Flagged {new Date(flag.createdAt).toLocaleString()}
                            </p>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex gap-2">
                            {flag.status !== 'in_review' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusUpdate(flag._id, 'in_review')}
                                className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Review
                              </motion.button>
                            )}
                            {flag.status !== 'resolved' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusUpdate(flag._id, 'resolved')}
                                className="px-3 py-1.5 bg-ti-green-500 text-white text-xs rounded-lg hover:bg-ti-green-600 transition-colors"
                              >
                                Resolve
                              </motion.button>
                            )}
                            {flag.status !== 'open' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleStatusUpdate(flag._id, 'open')}
                                className="px-3 py-1.5 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                Reopen
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
