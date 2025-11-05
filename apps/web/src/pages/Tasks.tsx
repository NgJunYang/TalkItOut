import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Modal, Badge } from '@talkitout/ui';
import { taskAPI } from '../api/client';
import toast from 'react-hot-toast';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    priority: 'med',
    dueAt: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getAll();
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
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
    { status: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { status: 'doing', title: 'Doing', color: 'bg-blue-500' },
    { status: 'done', title: 'Done', color: 'bg-green-500' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-ti-ink-900">Tasks</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-ti-green-500 hover:bg-ti-green-600 text-white">+ Add Task</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.status);
          return (
            <div key={column.status} className="bg-white rounded-2xl border border-ti-beige-300 shadow-card p-4">
              <div className="flex items-center mb-4">
                <div className={`w-3 h-3 rounded-full ${column.color} mr-2`} />
                <h2 className="text-lg font-semibold text-ti-ink-900">{column.title}</h2>
                <span className="ml-auto text-black/50 text-sm">{columnTasks.length}</span>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-ti-beige-50 border border-ti-beige-200 rounded-xl p-3 hover:shadow-soft transition-shadow"
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
                    <div className="flex items-center justify-between">
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
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
