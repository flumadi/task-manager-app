/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState, useEffect } from "https://esm.sh/react@18.2.0?deps=react@18.2.0";
import type { User, Task, TaskRequest } from "../../shared/types.ts";

interface TaskManagerProps {
  user: User;
  onLogout: () => void;
}

export default function TaskManager({ user, onLogout }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high"
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data || []);
      } else {
        setError(data.message || "Failed to fetch tasks");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Fetch tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      const requestData: TaskRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success && data.data) {
        setTasks(prev => [data.data, ...prev]);
        setFormData({ title: "", description: "", priority: "medium" });
        setShowForm(false);
        setSuccess("Task created successfully! 🎉");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to create task");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Create task error:", err);
    }
  };

  const toggleTaskCompletion = async (taskId: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ completed })
      });

      const data = await response.json();

      if (data.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, completed } : task
        ));
      } else {
        setError(data.message || "Failed to update task");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Update task error:", err);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        setSuccess("Task deleted successfully! 🗑️");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to delete task");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Delete task error:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "🔴";
      case "medium": return "🟡";
      case "low": return "🟢";
      default: return "⚪";
    }
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">✅</div>
            TaskFlow
          </div>
          <div className="user-info">
            <span className="username">👋 Hello, {user.username}!</span>
            <button onClick={onLogout} className="btn btn-outline btn-sm">
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="task-container">
        {/* Messages */}
        {error && (
          <div className="error slide-in">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
              <button 
                onClick={() => setError("")}
                className="ml-auto text-red-800 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="success slide-in">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>{success}</span>
              <button 
                onClick={() => setSuccess("")}
                className="ml-auto text-green-800 hover:text-green-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Task Form */}
        <div className="task-form fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="task-form-title">
              ✨ {showForm ? "Create New Task" : "Your Tasks"}
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`btn ${showForm ? "btn-secondary" : "btn-primary"}`}
            >
              {showForm ? "📋 View Tasks" : "➕ Add Task"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 slide-in">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  📝 Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  📄 Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Add more details about this task..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority" className="form-label">
                  🎯 Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">
                  ✨ Create Task
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Task Statistics */}
        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏳</span>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        {!showForm && (
          <div className="task-list">
            {loading ? (
              <div className="loading">
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  gap: "1rem", 
                  padding: "2rem" 
                }}>
                  <div style={{ 
                    width: "2rem", 
                    height: "2rem", 
                    border: "2px solid #e2e8f0", 
                    borderTop: "2px solid #2563eb", 
                    borderRadius: "50%", 
                    animation: "spin 1s linear infinite" 
                  }}></div>
                  <p>Loading your tasks...</p>
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3 className="empty-state-title">No tasks yet!</h3>
                <p className="empty-state-description">
                  Create your first task to get started with TaskFlow.
                  <br />
                  Click the "Add Task" button above to begin.
                </p>
              </div>
            ) : (
              <>
                {/* Pending Tasks */}
                {pendingTasks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      ⏳ Pending Tasks ({pendingTasks.length})
                    </h3>
                    {pendingTasks.map(task => (
                      <div key={task.id} className="task-item fade-in">
                        <div className="task-header">
                          <div className="task-content">
                            <h3 className="task-title">{task.title}</h3>
                            {task.description && (
                              <p className="task-description">{task.description}</p>
                            )}
                            <div className="task-meta">
                              <div className="flex items-center gap-2">
                                <span className={`task-priority priority-${task.priority}`}>
                                  {getPriorityIcon(task.priority)} {task.priority}
                                </span>
                                <span className="task-date">
                                  📅 {formatDate(task.created_at)}
                                </span>
                              </div>
                              <div className="task-actions">
                                <button
                                  onClick={() => toggleTaskCompletion(task.id, true)}
                                  className="btn btn-primary btn-sm"
                                  title="Mark as completed"
                                >
                                  ✅ Complete
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="btn btn-danger btn-sm"
                                  title="Delete task"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      ✅ Completed Tasks ({completedTasks.length})
                    </h3>
                    {completedTasks.map(task => (
                      <div key={task.id} className="task-item completed fade-in">
                        <div className="task-header">
                          <div className="task-content">
                            <h3 className="task-title completed">{task.title}</h3>
                            {task.description && (
                              <p className="task-description">{task.description}</p>
                            )}
                            <div className="task-meta">
                              <div className="flex items-center gap-2">
                                <span className={`task-priority priority-${task.priority}`}>
                                  {getPriorityIcon(task.priority)} {task.priority}
                                </span>
                                <span className="task-date">
                                  📅 {formatDate(task.created_at)}
                                </span>
                              </div>
                              <div className="task-actions">
                                <button
                                  onClick={() => toggleTaskCompletion(task.id, false)}
                                  className="btn btn-secondary btn-sm"
                                  title="Mark as pending"
                                >
                                  ↩️ Undo
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="btn btn-danger btn-sm"
                                  title="Delete task"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}