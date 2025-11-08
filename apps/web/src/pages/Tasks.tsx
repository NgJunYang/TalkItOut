import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Modal, Badge } from '@talkitout/ui';
import { taskAPI } from '../api/client';
import toast from 'react-hot-toast';

interface StudySuggestion {
  method: string;
  description: string;
  timeEstimate: string;
}

interface TaskSummary {
  overview: string;
  totalTasks: number;
  completionRate: number;
  suggestions: string[];
  motivationalMessage: string;
}

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    priority: 'med',
    dueAt: '',
  });
  const [selectedTaskForTips, setSelectedTaskForTips] = useState<any | null>(null);
  const [studySuggestions, setStudySuggestions] = useState<StudySuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getAll();
      setTasks(response.data.tasks);
      loadSummary();
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const loadSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const response = await taskAPI.getSummary();
      setTaskSummary(response.data);
    } catch (error) {
      console.error('Failed to load task summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const loadStudyTips = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    setSelectedTaskForTips(task);
    setIsLoadingSuggestions(true);
    setStudySuggestions([]);

    try {
      const response = await taskAPI.getStudySuggestions(taskId);
      setStudySuggestions(response.data.suggestions);
    } catch (error) {
      toast.error('Failed to load study tips');
      console.error('Failed to load study suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleCreate = async () => {
    try {
      // Clean up the task data - remove empty strings
      const taskData: any = {
        title: newTask.title,
        priority: newTask.priority,
      };

      // Only add optional fields if they have values
      if (newTask.subject && newTask.subject.trim() !== '') {
        taskData.subject = newTask.subject;
      }
      if (newTask.dueAt && newTask.dueAt.trim() !== '') {
        taskData.dueAt = newTask.dueAt;
      }

      console.log('Task data being sent:', taskData);
      await taskAPI.create(taskData);
      toast.success('Task created!');
      setIsModalOpen(false);
      setNewTask({ title: '', subject: '', priority: 'med', dueAt: '' });
      loadTasks();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to create task';
      toast.error(errorMessage);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await taskAPI.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      toast.success('Task updated!');
      loadSummary(); // Reload summary after status change
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const columns = [
    { status: 'todo', title: 'To Do', emoji: '⚪', color: 'bg-gray-500' },
    { status: 'doing', title: 'Doing', emoji: '🔵', color: 'bg-blue-500' },
    { status: 'done', title: 'Done', emoji: '🟢', color: 'bg-ti-green-500' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Supportive Intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 bg-gradient-to-r from-purple-100 to-ti-beige-100 rounded-2xl"
      >
        <h2 className="text-xl font-bold text-ti-ink-900 mb-2 flex items-center">
          <span className="mr-2">📝</span> Need help organizing things?
        </h2>
        <p className="text-ti-ink/70">
          I know life can feel overwhelming sometimes. Let's break things down together—
          one small step at a time.
        </p>
      </motion.div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ti-ink-900">Your To-Do List</h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white shadow-md hover:shadow-lg"
          >
            + Add Task
          </Button>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.status);
          return (
            <motion.div
              key={column.status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border-2 border-ti-beige-300 shadow-card p-4"
            >
              <div className="flex items-center mb-4 pb-3 border-b-2 border-ti-beige-200">
                <span className="text-2xl mr-2">{column.emoji}</span>
                <h2 className="text-lg font-bold text-ti-ink-900">{column.title}</h2>
                <span className="ml-auto text-ti-ink/60 text-sm font-semibold">{columnTasks.length}</span>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)' }}
                    className="bg-ti-beige-50 border-2 border-ti-beige-200 rounded-xl p-3 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm text-ti-ink-900">{task.title}</h3>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-black/50 hover:text-red-500 text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                    {task.subject && (
                      <p className="text-xs text-black/60 mb-2">{task.subject}</p>
                    )}
                    {task.dueAt && (
                      <p className="text-xs text-black/60 mb-2">
                        Due: {new Date(task.dueAt).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant={
                          task.priority === 'high'
                            ? 'warning'
                            : task.priority === 'med'
                            ? 'info'
                            : 'default'
                        }
                      >
                        {task.priority}
                      </Badge>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="text-xs bg-white border border-ti-beige-300 rounded-lg px-2 py-1 text-ti-ink-900"
                      >
                        <option value="todo">To Do</option>
                        <option value="doing">Doing</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadStudyTips(task._id);
                      }}
                      className="w-full mt-2 text-xs bg-gradient-to-r from-ti-green-500 to-ti-teal-500 text-white py-1.5 rounded-lg hover:shadow-md transition-all"
                    >
                      💡 Get Study Tips
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Task Summary Section */}
      {taskSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-gradient-to-br from-ti-green-50 to-ti-teal-50 rounded-2xl border-2 border-ti-green-200"
        >
          <h2 className="text-xl font-bold text-ti-ink-900 mb-4 flex items-center">
            <span className="mr-2">📊</span> Your Progress Summary
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/80 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-ti-green-500">{taskSummary.totalTasks}</p>
              <p className="text-sm text-ti-ink/70">Total Tasks</p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-ti-teal-500">{taskSummary.completionRate}%</p>
              <p className="text-sm text-ti-ink/70">Completed</p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 text-center flex items-center justify-center">
              <p className="text-sm text-ti-ink-900 font-medium">{taskSummary.motivationalMessage}</p>
            </div>
          </div>

          <div className="bg-white/60 rounded-xl p-5 mb-4">
            <h3 className="font-semibold text-ti-ink-900 mb-2">Overview</h3>
            <p className="text-ti-ink/80 text-sm leading-relaxed">{taskSummary.overview}</p>
          </div>

          {taskSummary.suggestions && taskSummary.suggestions.length > 0 && (
            <div className="bg-white/60 rounded-xl p-5">
              <h3 className="font-semibold text-ti-ink-900 mb-3">Suggestions for You</h3>
              <ul className="space-y-2">
                {taskSummary.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-ti-green-500 mr-2 mt-0.5">✓</span>
                    <span className="text-sm text-ti-ink/80 leading-relaxed">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Study Suggestions Modal */}
      <Modal
        isOpen={selectedTaskForTips !== null}
        onClose={() => {
          setSelectedTaskForTips(null);
          setStudySuggestions([]);
        }}
        title={`Study Tips: ${selectedTaskForTips?.title || ''}`}
      >
        <div className="space-y-4">
          {isLoadingSuggestions ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ti-green-500"></div>
              <p className="text-ti-ink/60 mt-4">Generating study tips for you...</p>
            </div>
          ) : studySuggestions.length > 0 ? (
            <>
              <p className="text-sm text-ti-ink/70 mb-4">
                Here are some study methods that might help you with this task:
              </p>
              {studySuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-ti-beige-50 to-white border-2 border-ti-beige-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-ti-ink-900">{suggestion.method}</h3>
                    <Badge variant="info">{suggestion.timeEstimate}</Badge>
                  </div>
                  <p className="text-sm text-ti-ink/80 leading-relaxed">{suggestion.description}</p>
                </div>
              ))}
            </>
          ) : (
            <p className="text-center text-ti-ink/60 py-8">No suggestions available</p>
          )}
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Task">
        <div className="space-y-4">
          <Input
            label="Title"
            value={newTask.title}
            onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
            placeholder="Complete Math homework"
          />
          <Input
            label="Subject (optional)"
            value={newTask.subject}
            onChange={(e) => setNewTask((p) => ({ ...p, subject: e.target.value }))}
            placeholder="Mathematics"
          />
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ti-ink-900">Priority</label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg border border-ti-beige-300 bg-white text-ti-ink-900"
            >
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Input
            label="Due Date (optional)"
            type="datetime-local"
            value={newTask.dueAt}
            onChange={(e) => setNewTask((p) => ({ ...p, dueAt: e.target.value }))}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newTask.title}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
