'use client';

import { useState, useEffect } from 'react';

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
}

const API_BASE = 'http://localhost:4000';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Task states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }, []);

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

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  // 1. AUTH SCREEN UI
  if (!token) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-xl font-bold text-xl mb-3 shadow-lg shadow-indigo-200">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Smart Task Manager</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isRegistering ? 'Create your secure account' : 'Welcome back! Please enter your details'}
            </p>
          </div>

          {authError && (
            <div className={`p-3 mb-5 text-sm rounded-xl font-medium ${authError.includes('successful') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50/50 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 text-sm mt-2"
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
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
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
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl border border-slate-100 p-6 md:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-100">
              ✓
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Task Dashboard</h1>
              <p className="text-xs text-slate-400">Manage your daily workflow securely</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl transition"
          >
            Sign Out
          </button>
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
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
          </div>
        </div>

        {/* Create Form */}
        <form onSubmit={handleAddTask} className="bg-indigo-50/40 p-4 md:p-5 rounded-2xl border border-indigo-100/60 mb-6 space-y-3">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
          />
          <div className="flex flex-wrap gap-2.5 items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="Work">📁 Work</option>
              <option value="Personal">📁 Personal</option>
              <option value="Study">📁 Study</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm focus:outline-none"
            >
              <option value="Low">🟢 Low Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="High">🔴 High Priority</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 shadow-sm focus:outline-none"
            />

            <button
              type="submit"
              className="ml-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 text-xs"
            >
              + Add Task
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6">
          {['All', 'Active', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                filter === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-slate-400 text-sm font-medium">No tasks found.</p>
              <p className="text-slate-300 text-xs mt-1">Add a task above to get started!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-4 bg-white border rounded-xl transition hover:shadow-md ${
                  task.is_completed ? 'border-slate-100 bg-slate-50/50 opacity-75' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 accent-indigo-600 rounded-md cursor-pointer"
                  />
                  <span
                    className={`text-sm font-medium truncate ${
                      task.is_completed ? 'line-through text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.dueDate && (
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                      📅 {task.dueDate}
                    </span>
                  )}
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                    {task.category?.name || 'General'}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition font-bold text-sm"
                    title="Delete task"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
