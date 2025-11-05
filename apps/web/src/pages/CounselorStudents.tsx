import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Badge, Input } from '@talkitout/ui';
import { userAPI, metricsAPI } from '../api/client';
import toast from 'react-hot-toast';

interface Student {
  _id: string;
  name: string;
  email: string;
  age?: number;
  school?: string;
  createdAt: string;
  profile?: {
    streaks?: Array<{ type: string; count: number }>;
  };
}

interface StudentMetrics {
  checkIns: {
    total: number;
    averageMood: number;
    lastCheckIn?: string;
  };
  tasks: {
    total: number;
    completed: number;
  };
  focus: {
    totalSessions: number;
    totalMinutes: number;
  };
}

export const CounselorStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentMetrics, setStudentMetrics] = useState<StudentMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await userAPI.getUsers({ role: 'student' });
      setStudents(response.data.users || []);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const loadStudentMetrics = async (studentId: string) => {
    setIsLoadingMetrics(true);
    try {
      const response = await metricsAPI.getUserMetrics(studentId, { days: 30 });
      setStudentMetrics(response.data);
    } catch (error) {
      toast.error('Failed to load student metrics');
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    loadStudentMetrics(student._id);
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.school?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-ti-green-600';
    if (mood >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 4.5) return '😄';
    if (mood >= 3.5) return '🙂';
    if (mood >= 2.5) return '😐';
    if (mood >= 1.5) return '😟';
    return '😢';
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-extrabold tracking-tight text-ti-ink-900 mb-6">Students</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-ti-ink-900">All Students ({filteredStudents.length})</CardTitle>
              <div className="mt-4">
                <Input
                  placeholder="Search by name, email, or school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <p className="text-black/60 text-center py-8">No students found</p>
                ) : (
                  filteredStudents.map((student) => (
                    <motion.div
                      key={student._id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleStudentClick(student)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedStudent?._id === student._id
                          ? 'bg-ti-green-50 border-ti-green-500 shadow-soft'
                          : 'bg-ti-beige-50 border-ti-beige-200 hover:border-ti-green-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-ti-ink-900">{student.name}</h3>
                          <p className="text-xs text-black/60 mt-0.5">{student.email}</p>
                          {student.school && (
                            <p className="text-xs text-black/50 mt-0.5">{student.school}</p>
                          )}
                        </div>
                        {student.age && (
                          <Badge variant="default" className="text-xs">
                            {student.age}y
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Details */}
        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-ti-ink-800">Select a student to view their details</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Student Info Card */}
              <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-ti-ink-900 text-2xl">{selectedStudent.name}</CardTitle>
                      <p className="text-sm text-black/60 mt-1">{selectedStudent.email}</p>
                    </div>
                    <Badge variant="info">Student</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {selectedStudent.age && (
                      <div>
                        <p className="text-xs text-black/60 mb-1">Age</p>
                        <p className="text-sm font-medium text-ti-ink-900">{selectedStudent.age} years old</p>
                      </div>
                    )}
                    {selectedStudent.school && (
                      <div>
                        <p className="text-xs text-black/60 mb-1">School</p>
                        <p className="text-sm font-medium text-ti-ink-900">{selectedStudent.school}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-black/60 mb-1">Joined</p>
                      <p className="text-sm font-medium text-ti-ink-900">
                        {new Date(selectedStudent.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Cards */}
              {isLoadingMetrics ? (
                <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
                  <CardContent className="py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ti-green-600 mx-auto mb-2" />
                      <p className="text-sm text-black/60">Loading metrics...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : studentMetrics ? (
                <>
                  {/* Check-ins Card */}
                  <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-ti-ink-900">Check-ins (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-ti-beige-50 rounded-xl">
                          <div className="text-3xl font-bold text-ti-ink-900">
                            {studentMetrics.checkIns.total}
                          </div>
                          <div className="text-xs text-black/60 mt-1">Total Check-ins</div>
                        </div>
                        <div className="text-center p-4 bg-ti-beige-50 rounded-xl">
                          <div className={`text-3xl font-bold ${getMoodColor(studentMetrics.checkIns.averageMood)}`}>
                            {getMoodEmoji(studentMetrics.checkIns.averageMood)}{' '}
                            {studentMetrics.checkIns.averageMood.toFixed(1)}
                          </div>
                          <div className="text-xs text-black/60 mt-1">Average Mood</div>
                        </div>
                        <div className="text-center p-4 bg-ti-beige-50 rounded-xl">
                          <div className="text-sm font-medium text-ti-ink-900">
                            {studentMetrics.checkIns.lastCheckIn
                              ? new Date(studentMetrics.checkIns.lastCheckIn).toLocaleDateString()
                              : 'Never'}
                          </div>
                          <div className="text-xs text-black/60 mt-1">Last Check-in</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tasks & Focus Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-ti-ink-900">Tasks</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-ti-ink-800">Total Tasks</span>
                          <Badge variant="neutral">{studentMetrics.tasks.total}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-ti-ink-800">Completed</span>
                          <Badge variant="positive">{studentMetrics.tasks.completed}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-ti-ink-800">Completion Rate</span>
                          <Badge variant="info">
                            {studentMetrics.tasks.total > 0
                              ? Math.round((studentMetrics.tasks.completed / studentMetrics.tasks.total) * 100)
                              : 0}
                            %
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-ti-ink-900">Focus Sessions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-ti-ink-800">Total Sessions</span>
                          <Badge variant="neutral">{studentMetrics.focus.totalSessions}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-ti-ink-800">Total Minutes</span>
                          <Badge variant="positive">{studentMetrics.focus.totalMinutes}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-ti-ink-800">Avg per Session</span>
                          <Badge variant="info">
                            {studentMetrics.focus.totalSessions > 0
                              ? Math.round(studentMetrics.focus.totalMinutes / studentMetrics.focus.totalSessions)
                              : 0}{' '}
                            min
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Streaks Card */}
                  {selectedStudent.profile?.streaks && selectedStudent.profile.streaks.length > 0 && (
                    <Card className="bg-white border-ti-beige-300 shadow-card rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-ti-ink-900">Current Streaks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                          {selectedStudent.profile.streaks.map((streak) => (
                            <div key={streak.type} className="text-center p-4 bg-ti-beige-50 rounded-xl">
                              <div className="text-2xl mb-1">
                                {streak.type === 'checkin' ? '🔥' : streak.type === 'focus' ? '⚡' : '🎯'}
                              </div>
                              <div className="text-2xl font-bold text-ti-ink-900">{streak.count}</div>
                              <div className="text-xs text-black/60 mt-1 capitalize">{streak.type} Streak</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
