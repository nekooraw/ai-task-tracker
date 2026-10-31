import { useEffect, useState } from "react";
import "./App.css";
import Auth from "./Auth";
import api from "./api";

function formatDueDate(value) {
    if (!value) return "No deadline";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function toDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("access_token")
    );
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPriority, setNewPriority] = useState("medium");
    const [newDueDate, setNewDueDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        async function loadTasks() {
            try {
                const response = await api.get("/tasks/");
                setTasks(response.data);
            } catch (error) {
                console.error("Failed to load tasks:", error);
            }
        }

        loadTasks();
    }, [isAuthenticated]);

    async function addTask() {
        if (!newTask.trim()) return;

        try {
            const response = await api.post("/tasks/", {
                title: newTask.trim(),
                description: newDescription.trim() || null,
                priority: newPriority,
                due_date: newDueDate
                    ? new Date(newDueDate).toISOString()
                    : null,
            });

            setTasks((currentTasks) => [...currentTasks, response.data]);

            setNewTask("");
            setNewDescription("");
            setNewPriority("medium");
            setNewDueDate("");
        } catch (error) {
            console.error("Failed to create task:", error);
            alert(
                error.response?.data?.detail || "Failed to create task."
            );
        }
    }

    async function toggleTask(id) {
        const task = tasks.find((item) => item.id === id);
        if (!task) return;

        try {
            const response = await api.patch(`/tasks/${id}`, {
                is_completed: !task.is_completed,
            });

            setTasks((currentTasks) =>
                currentTasks.map((item) =>
                    item.id === id ? response.data : item
                )
            );
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    }

    async function changePriority(id, priority) {
        try {
            const response = await api.patch(`/tasks/${id}`, { priority });

            setTasks((currentTasks) =>
                currentTasks.map((item) =>
                    item.id === id ? response.data : item
                )
            );
        } catch (error) {
            console.error("Failed to change priority:", error);
        }
    }

    async function editTask(task) {
        const newTitle = window.prompt("Enter a new task title:", task.title);
        if (newTitle === null || !newTitle.trim()) return;

        const newDescriptionValue = window.prompt(
            "Enter a task description:",
            task.description || ""
        );
        if (newDescriptionValue === null) return;

        const newDueDateValue = window.prompt(
            "Enter deadline (YYYY-MM-DDTHH:mm), or leave empty:",
            toDateTimeLocal(task.due_date)
        );
        if (newDueDateValue === null) return;

        let dueDate = null;

        if (newDueDateValue.trim()) {
            const parsedDate = new Date(newDueDateValue);

            if (Number.isNaN(parsedDate.getTime())) {
                alert("Invalid deadline date.");
                return;
            }

            dueDate = parsedDate.toISOString();
        }

        try {
            const response = await api.patch(`/tasks/${task.id}`, {
                title: newTitle.trim(),
                description: newDescriptionValue.trim() || null,
                due_date: dueDate,
            });

            setTasks((currentTasks) =>
                currentTasks.map((item) =>
                    item.id === task.id ? response.data : item
                )
            );
        } catch (error) {
            console.error("Failed to edit task:", error);
            alert(error.response?.data?.detail || "Failed to edit task.");
        }
    }

    async function deleteTask(id) {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks((currentTasks) =>
                currentTasks.filter((task) => task.id !== id)
            );
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    }

    async function askAI() {
        if (!aiPrompt.trim() || aiLoading) return;

        setAiLoading(true);
        setAiResponse("");

        try {
            const response = await api.post("/ai/ask", {
                prompt: aiPrompt.trim(),
            });

            setAiResponse(response.data.response);
            setAiPrompt("");
        } catch (error) {
            setAiResponse(
                error.response?.data?.detail || "Failed to connect to AI."
            );
            console.error("AI request failed:", error);
        } finally {
            setAiLoading(false);
        }
    }

    function logout() {
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
        setTasks([]);
        setAiResponse("");
        setAiPrompt("");
        setSearchQuery("");
        setFilter("all");
    }

    const completedTasks = tasks.filter(
        (task) => task.is_completed
    ).length;

    const progress = tasks.length
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;

    const filteredTasks = tasks.filter((task) => {
        const matchesFilter =
            filter === "all" ||
            (filter === "active" && !task.is_completed) ||
            (filter === "completed" && task.is_completed);

        const searchText = searchQuery.trim().toLowerCase();

        const matchesSearch =
            task.title.toLowerCase().includes(searchText) ||
            (task.description || "").toLowerCase().includes(searchText);

        return matchesFilter && matchesSearch;
    });

    if (!isAuthenticated) {
        return <Auth onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="brand">
                    <span className="brand-icon">✦</span> TaskFlow
                </div>

                <p className="nav-label">WORKSPACE</p>

                <nav>
                    <a className="nav-item active" href="#overview">
                        ▦ <span>Overview</span>
                    </a>
                    <a className="nav-item" href="#tasks">
                        ☷ <span>My tasks</span>
                    </a>
                    <a className="nav-item" href="#assistant">
                        ✧ <span>AI Assistant</span>
                    </a>
                </nav>

                <div className="sidebar-bottom">
                    <div className="profile-avatar">N</div>
                    <div>
                        <strong>My workspace</strong>
                        <small>Personal account</small>
                    </div>
                    <button className="logout-button" onClick={logout}>
                        ↪ Log out
                    </button>
                </div>
            </aside>

            <main className="main" id="overview">
                <header className="topbar">
                    <span>Workspace / Overview</span>
                    <div className="topbar-right">
                        <span className="status-dot"></span>
                        All changes saved
                    </div>
                </header>

                <section className="welcome">
                    <div>
                        <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
                        <h1>Good day, nekooraw <span>✦</span></h1>
                        <p className="subtitle">
                            A little progress every day adds up.
                        </p>
                    </div>

                    <div className="date-card">
                        <span>YOUR PROGRESS</span>
                        <strong>{progress}%</strong>
                    </div>
                </section>

                <section className="stats">
                    <article className="stat-card">
                        <span className="stat-icon purple">☷</span>
                        <p>Total tasks</p>
                        <strong>{tasks.length}</strong>
                        <small>Tasks in your workspace</small>
                    </article>

                    <article className="stat-card">
                        <span className="stat-icon green">✓</span>
                        <p>Completed</p>
                        <strong>{completedTasks}</strong>
                        <small>Successfully finished</small>
                    </article>

                    <article className="stat-card">
                        <span className="stat-icon orange">◷</span>
                        <p>Remaining</p>
                        <strong>{tasks.length - completedTasks}</strong>
                        <small>Still on your list</small>
                    </article>
                </section>

                <section className="content-grid">
                    <div className="task-section" id="tasks">
                        <div className="section-heading">
                            <div>
                                <h2>My tasks</h2>
                                <p>Keep track of what matters.</p>
                            </div>

                            <div className="task-filters">
                                <button
                                    className={filter === "all" ? "selected" : ""}
                                    onClick={() => setFilter("all")}
                                >
                                    All
                                </button>
                                <button
                                    className={filter === "active" ? "selected" : ""}
                                    onClick={() => setFilter("active")}
                                >
                                    Active
                                </button>
                                <button
                                    className={filter === "completed" ? "selected" : ""}
                                    onClick={() => setFilter("completed")}
                                >
                                    Completed
                                </button>
                            </div>
                        </div>

                        <div className="task-search">
                            <span>⌕</span>
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                placeholder="Search your tasks..."
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")}>
                                    ×
                                </button>
                            )}
                        </div>

                        <div className="task-input task-input-group">
                            <input
                                value={newTask}
                                onChange={(event) =>
                                    setNewTask(event.target.value)
                                }
                                onKeyDown={(event) =>
                                    event.key === "Enter" && addTask()
                                }
                                placeholder="Task title..."
                            />

                            <textarea
                                value={newDescription}
                                onChange={(event) =>
                                    setNewDescription(event.target.value)
                                }
                                placeholder="Description (optional)..."
                                rows={2}
                            />

                            <label className="priority-label">
                                Priority
                                <select
                                    value={newPriority}
                                    onChange={(event) =>
                                        setNewPriority(event.target.value)
                                    }
                                >
                                    <option value="low">🟢 Low</option>
                                    <option value="medium">🟡 Medium</option>
                                    <option value="high">🔴 High</option>
                                </select>
                            </label>

                            <label className="deadline-label">
                                Deadline
                                <input
                                    type="datetime-local"
                                    value={newDueDate}
                                    onChange={(event) =>
                                        setNewDueDate(event.target.value)
                                    }
                                />
                            </label>

                            <button onClick={addTask}>＋ Add task</button>
                        </div>

                        <div className="task-list">
                            {filteredTasks.map((task) => (
                                <div
                                    className={`task ${task.is_completed ? "completed" : ""}`}
                                    key={task.id}
                                >
                                    <button
                                        className="task-check"
                                        onClick={() => toggleTask(task.id)}
                                    >
                                        {task.is_completed ? "✓" : ""}
                                    </button>

                                    <div className="task-details">
                                        <span>{task.title}</span>

                                        {task.description && (
                                            <p>{task.description}</p>
                                        )}

                                        {task.due_date && (
                                            <p className="task-deadline">
                                                ◷ {formatDueDate(task.due_date)}
                                            </p>
                                        )}
                                    </div>

                                    <select
                                        className={`priority-select priority-${task.priority}`}
                                        value={task.priority}
                                        onChange={(event) =>
                                            changePriority(
                                                task.id,
                                                event.target.value
                                            )
                                        }
                                        aria-label="Task priority"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>

                                    <small>
                                        {task.is_completed
                                            ? "Completed"
                                            : "In progress"}
                                    </small>

                                    <button
                                        className="task-edit"
                                        onClick={() => editTask(task)}
                                        title="Edit task"
                                    >
                                        ✎
                                    </button>

                                    <button
                                        className="task-delete"
                                        onClick={() => deleteTask(task.id)}
                                        title="Delete task"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}

                            {filteredTasks.length === 0 && (
                                <div className="empty">
                                    <span>✧</span>
                                    <strong>
                                        {tasks.length === 0
                                            ? "Your workspace is clear"
                                            : "No tasks found"}
                                    </strong>
                                    <p>
                                        {tasks.length === 0
                                            ? "Add a task above to get started."
                                            : "Try another search or filter."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="ai-card" id="assistant">
                        <div className="ai-icon">✦</div>
                        <p className="eyebrow">YOUR AI COMPANION</p>
                        <h2>Make room for what matters.</h2>

                        <p className="ai-description">
                            Get help organizing your tasks, planning your day
                            and finding your next step.
                        </p>

                        <textarea
                            className="ai-input"
                            value={aiPrompt}
                            onChange={(event) =>
                                setAiPrompt(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    askAI();
                                }
                            }}
                            placeholder="Ask AI about your tasks..."
                            rows={3}
                        />

                        <button
                            className="ai-button"
                            onClick={askAI}
                            disabled={aiLoading}
                        >
                            {aiLoading ? "Thinking..." : "Ask AI ↗"}
                        </button>

                        {aiResponse && (
                            <div className="ai-response">
                                <strong>AI Assistant</strong>
                                <p>{aiResponse}</p>
                            </div>
                        )}

                        <div className="ai-decoration">✳</div>
                    </aside>
                </section>
            </main>
        </div>
    );
}

export default App;