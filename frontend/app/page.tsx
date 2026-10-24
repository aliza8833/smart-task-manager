'use client';

import { useState, useEffect } from 'react';

interface Subtask {
  id: number;
  title: string;
  is_completed: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  category?: Category;
  priority: string;
  dueDate?: string;
  is_completed: boolean;
  subtasks?: Subtask[];
}

const API_BASE = 'http://localhost:4000';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Dark Mode state
  const [darkMode, setDarkMode] = useState(false);

  // Task states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  // Subtask input state tracking per task ID
  const [subtaskInputs, setSubtaskInputs] = useState<{ [key: number]: string }>({});

  // Initialize Dark Mode & Token from localStorage on load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);

    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token, search, filter]);

  const fetchTasks = async () => {
    try {
      let url = `${API_BASE}/tasks?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (filter === 'Active') url += `status=active&`;
      if (filter === 'Completed') url += `status=completed&`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (isRegistering) {
        setIsRegistering(false);
        setAuthError('Registration successful! Please log in.');
      } else {
        localStorage.setItem('token', data.accessToken);
        setToken(data.accessToken);
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTasks([]);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, category, priority, dueDate }),
    });

    if (res.ok) {
      setTitle('');
      setDueDate('');
      fetchTasks();
    }
  };

  const toggleTask = async (id: number) => {
    await fetch(`${API_BASE}/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  const deleteTask = async (id: number) => {
    await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  // Subtask handlers
  const handleAddSubtask = async (e: React.FormEvent, taskId: number) => {
    e.preventDefault();
    const subtaskTitle = subtaskInputs[taskId];
    if (!subtaskTitle || !subtaskTitle.trim()) return;

    const res = await fetch(`${API_BASE}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: subtaskTitle }),
    });

    if (res.ok) {
      setSubtaskInputs({ ...subtaskInputs, [taskId]: '' });
      fetchTasks();
    }
  };

  const toggleSubtaskItem = async (subtaskId: number) => {
    await fetch(`${API_BASE}/tasks/subtasks/${subtaskId}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  const deleteSubtaskItem = async (subtaskId: number) => {
    await fetch(`${API_BASE}/tasks/subtasks/${subtaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'High':
        return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900';
      case 'Medium':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
  };

  // 1. AUTH SCREEN UI
  if (!token) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950 flex items-center justify-center p-4 transition-colors">
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-medium flex items-center gap-2"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-800 p-8 transition-colors">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold text-xl mb-3 shadow-lg shadow-indigo-200 dark:shadow-none">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Smart Task Manager</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isRegistering ? 'Create your secure account' : 'Welcome back! Please enter your details'}
            </p>
          </div>

          {authError && (
            <div className={`p-3 mb-5 text-sm rounded-xl font-medium ${authError.includes('successful') ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'}`}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-indigo-200 dark:shadow-none text-sm mt-2"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError('');
              }}
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 2. DASHBOARD UI
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 transition-colors">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 transition-colors">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-100 dark:shadow-none">
              ✓
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Task Dashboard</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">Manage your daily workflow securely</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-sm font-medium flex items-center gap-1.5"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              onClick={handleLogout}
              className="text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search tasks by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
          </div>
        </div>

        {/* Create Form */}
        <form onSubmit={handleAddTask} className="bg-indigo-50/40 dark:bg-indigo-950/30 p-4 md:p-5 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/50 mb-6 space-y-3 transition-colors">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
          />
          <div className="flex flex-wrap gap-2.5 items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none"
            >
              <option value="Work">📁 Work</option>
              <option value="Personal">📁 Personal</option>
              <option value="Study">📁 Study</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none"
            >
              <option value="Low">🟢 Low Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="High">🔴 High Priority</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm focus:outline-none"
            />

            <button
              type="submit"
              className="ml-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-md shadow-indigo-100 dark:shadow-none text-xs"
            >
              + Add Task
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 transition-colors">
          {['All', 'Active', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                filter === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">No tasks found.</p>
              <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Add a task above to get started!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 border rounded-xl transition hover:shadow-md ${
                  task.is_completed ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 opacity-75' : 'border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-5 h-5 accent-indigo-600 dark:accent-indigo-500 rounded-md cursor-pointer"
                    />
                    <span
                      className={`text-sm font-medium truncate ${
                        task.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.dueDate && (
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-300 border border-orange-100 dark:border-orange-900">
                        📅 {task.dueDate}
                      </span>
                    )}
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {task.category?.name || 'General'}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition font-bold text-sm"
                      title="Delete task"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Subtasks Section */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 pl-4 space-y-2">
                  {task.subtasks?.map((subtask) => (
                    <div key={subtask.id} className="flex items-center justify-between text-xs group">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={subtask.is_completed}
                          onChange={() => toggleSubtaskItem(subtask.id)}
                          className="w-4 h-4 accent-indigo-600 dark:accent-indigo-500 rounded cursor-pointer"
                        />
                        <span className={subtask.is_completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}>
                          {subtask.title}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteSubtaskItem(subtask.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition px-1"
                        title="Delete subtask"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <form onSubmit={(e) => handleAddSubtask(e, task.id)} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="+ Add subtask..."
                      value={subtaskInputs[task.id] || ''}
                      onChange={(e) => setSubtaskInputs({ ...subtaskInputs, [task.id]: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
