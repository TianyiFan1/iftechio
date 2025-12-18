import { useEffect, useMemo, useState } from "react";
import "./App.css";

export default function App() {
  const STORAGE_KEY = "todo_list_v2"; // category/priority/dueDate/sort

  // ======= UI State (controls) =======
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("created_desc"); // created_desc | due_asc | priority_desc

  // ======= Form State =======
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Life"); // Work | Study | Life
  const [priority, setPriority] = useState("Medium"); // Low | Medium | High
  const [dueDate, setDueDate] = useState(""); // YYYY-MM-DD or ""

  // ======= Data State =======
  const [todos, setTodos] = useState([]);

  const CATEGORIES = ["Work", "Study", "Life"];
  const PRIORITIES = ["High", "Medium", "Low"];

  function priorityRank(p) {
    if (p === "High") return 3;
    if (p === "Medium") return 2;
    return 1;
  }

  function normalizeTodo(raw) {
    return {
      id: String(raw?.id ?? crypto.randomUUID()),
      title: String(raw?.title ?? "").trim(),
      description: String(raw?.description ?? "").trim(),
      completed: Boolean(raw?.completed ?? false),
      category: CATEGORIES.includes(raw?.category) ? raw.category : "Life",
      priority: PRIORITIES.includes(raw?.priority) ? raw.priority : "Medium",
      dueDate: typeof raw?.dueDate === "string" ? raw.dueDate : "",
      createdAt: typeof raw?.createdAt === "number" ? raw.createdAt : Date.now(),
    };
  }

  // ======= Persistence: load =======
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return;
      setTodos(data.map(normalizeTodo));
    } catch {
      // ignore corrupted storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======= Persistence: save =======
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // ======= Actions =======
  function handleAddTodo(e) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    if (!trimmedTitle) return;

    const newTodo = normalizeTodo({
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: trimmedDesc,
      completed: false,
      category,
      priority,
      dueDate,
      createdAt: Date.now(),
    });

    setTodos((prev) => [newTodo, ...prev]);

    setTitle("");
    setDescription("");
    setCategory("Life");
    setPriority("Medium");
    setDueDate("");
  }

  function handleToggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function handleDeleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  // ======= Derived list (Filter + Sort) =======
  const visibleTodos = useMemo(() => {
    let list = todos;

    if (categoryFilter !== "All") {
      list = list.filter((t) => t.category === categoryFilter);
    }

    const sorted = [...list];

    if (sortBy === "created_desc") {
      sorted.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    } else if (sortBy === "due_asc") {
      sorted.sort((a, b) => {
        const aHas = Boolean(a.dueDate);
        const bHas = Boolean(b.dueDate);

        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        if (!aHas && !bHas) return (b.createdAt ?? 0) - (a.createdAt ?? 0);

        const diff = a.dueDate.localeCompare(b.dueDate);
        if (diff !== 0) return diff;

        return priorityRank(b.priority) - priorityRank(a.priority);
      });
    } else if (sortBy === "priority_desc") {
      sorted.sort((a, b) => {
        const diff = priorityRank(b.priority) - priorityRank(a.priority);
        if (diff !== 0) return diff;
        return (b.createdAt ?? 0) - (a.createdAt ?? 0);
      });
    }

    return sorted;
  }, [todos, categoryFilter, sortBy]);

  function formatDate(yyyyMMdd) {
    // keep simple; input is already YYYY-MM-DD
    return yyyyMMdd || "—";
  }

  return (
    <div className="page">
      <div className="shell">
        <header className="header">
          <div>
            <h1 className="title">TODO List</h1>
            <p className="subtitle">
              Add tasks, organize by category, set priority & due date. Data is saved locally.
            </p>
          </div>

          <div className="stats">
            <div className="statCard">
              <div className="statNum">{visibleTodos.length}</div>
              <div className="statLabel">In view</div>
            </div>
            <div className="statCard">
              <div className="statNum">{todos.length}</div>
              <div className="statLabel">Total</div>
            </div>
          </div>
        </header>

        <section className="grid">
          {/* Left: Add form */}
          <div className="card">
            <div className="cardHeader">
              <h2 className="cardTitle">Create a task</h2>
              <span className="pill">Title required</span>
            </div>

            <form onSubmit={handleAddTodo} className="form">
              <div className="field">
                <label className="label">Title</label>
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Finish assignment report"
                />
              </div>

              <div className="field">
                <label className="label">Description</label>
                <input
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="row3">
                <div className="field">
                  <label className="label">Category</label>
                  <select
                    className="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Life">Life</option>
                  </select>
                </div>

                <div className="field">
                  <label className="label">Priority</label>
                  <select
                    className="select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="field">
                  <label className="label">Due date</label>
                  <input
                    className="input"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <button className="btnPrimary" type="submit" disabled={!title.trim()}>
                Add task
              </button>
              <p className="hint">Tip: click the checkbox to mark complete.</p>
            </form>
          </div>

          {/* Right: List + Controls */}
          <div className="card">
            <div className="cardHeader">
              <h2 className="cardTitle">Your tasks</h2>
              <div className="controls">
                <select
                  className="select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter by category"
                >
                  <option value="All">All</option>
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Life">Life</option>
                </select>

                <select
                  className="select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort"
                >
                  <option value="created_desc">Created (newest)</option>
                  <option value="due_asc">Due date (earliest)</option>
                  <option value="priority_desc">Priority (high → low)</option>
                </select>
              </div>
            </div>

            {visibleTodos.length === 0 ? (
              <div className="empty">
                <div className="emptyIcon">✓</div>
                <div className="emptyTitle">No tasks here</div>
                <div className="emptyText">
                  Create a task on the left, or switch your category filter.
                </div>
              </div>
            ) : (
              <ul className="list">
                {visibleTodos.map((t) => (
                  <li key={t.id} className={`item ${t.completed ? "done" : ""}`}>
                    <label className="itemLeft">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => handleToggleTodo(t.id)}
                        className="checkbox"
                      />
                      <div className="itemBody">
                        <div className="itemTop">
                          <div className="itemTitle">{t.title}</div>

                          <div className="badges">
                            <span className={`badge cat`}>{t.category}</span>
                            <span className={`badge pri pri-${t.priority.toLowerCase()}`}>
                              {t.priority}
                            </span>
                            <span className="badge due">Due: {formatDate(t.dueDate)}</span>
                          </div>
                        </div>

                        {t.description ? (
                          <div className="itemDesc">{t.description}</div>
                        ) : null}
                      </div>
                    </label>

                    <button
                      type="button"
                      className="btnGhost"
                      onClick={() => handleDeleteTodo(t.id)}
                      aria-label="Delete"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <footer className="footer">
          <span>Saved locally via localStorage.</span>
        </footer>
      </div>
    </div>
  );
}
