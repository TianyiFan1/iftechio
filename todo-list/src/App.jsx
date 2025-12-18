import { useEffect, useMemo, useState } from "react";

export default function App() {
  const STORAGE_KEY = "todo_list_v2"; // v2: add category/priority/dueDate/sort

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

  // ======= Helpers =======
  function normalizeTodo(raw) {
    // Backward compatible defaults if older stored data exists
    return {
      id: String(raw.id ?? crypto.randomUUID()),
      title: String(raw.title ?? "").trim(),
      description: String(raw.description ?? "").trim(),
      completed: Boolean(raw.completed ?? false),
      category:
        raw.category === "Work" || raw.category === "Study" || raw.category === "Life"
          ? raw.category
          : "Life",
      priority:
        raw.priority === "Low" || raw.priority === "Medium" || raw.priority === "High"
          ? raw.priority
          : "Medium",
      dueDate: typeof raw.dueDate === "string" ? raw.dueDate : "",
      createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
    };
  }

  function priorityRank(p) {
    if (p === "High") return 3;
    if (p === "Medium") return 2;
    return 1; // Low
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
      // corrupted storage -> ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======= Persistence: save =======
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // ======= Core actions =======
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
      dueDate, // can be ""
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

    // Filter by category
    if (categoryFilter !== "All") {
      list = list.filter((t) => t.category === categoryFilter);
    }

    // Sort
    const sorted = [...list];
    if (sortBy === "created_desc") {
      sorted.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    } else if (sortBy === "due_asc") {
      sorted.sort((a, b) => {
        const aHas = Boolean(a.dueDate);
        const bHas = Boolean(b.dueDate);
        if (aHas && !bHas) return -1; // due dates first
        if (!aHas && bHas) return 1;
        if (!aHas && !bHas) return (b.createdAt ?? 0) - (a.createdAt ?? 0); // fallback
        // both have dueDate
        const diff = a.dueDate.localeCompare(b.dueDate);
        if (diff !== 0) return diff;
        // tie-breaker: higher priority first
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

  // ======= UI =======
  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 820 }}>
      <h1 style={{ marginBottom: 10 }}>TODO List</h1>

      {/* Controls: Filter + Sort */}
      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "200px 260px",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Work">Work</option>
          <option value="Study">Study</option>
          <option value="Life">Life</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created_desc">Sort: Created (newest)</option>
          <option value="due_asc">Sort: Due date (earliest)</option>
          <option value="priority_desc">Sort: Priority (high → low)</option>
        </select>
      </div>

      {/* Add Form */}
      <form
        onSubmit={handleAddTodo}
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: "1fr 1fr",
          marginBottom: 18,
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (required)"
        />

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Work">Category: Work</option>
          <option value="Study">Category: Study</option>
          <option value="Life">Category: Life</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="High">Priority: High</option>
          <option value="Medium">Priority: Medium</option>
          <option value="Low">Priority: Low</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ gridColumn: "1 / span 1" }}
        />

        <button type="submit" style={{ gridColumn: "2 / span 1" }}>
          Add
        </button>
      </form>

      {/* List */}
      <div>
        <h2 style={{ marginBottom: 8 }}>
          Tasks ({visibleTodos.length}
          {visibleTodos.length !== todos.length ? ` / total ${todos.length}` : ""})
        </h2>

        {visibleTodos.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No tasks in this view.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {visibleTodos.map((t) => (
              <li key={t.id} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      flex: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggleTodo(t.id)}
                      style={{ marginTop: 4 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          textDecoration: t.completed ? "line-through" : "none",
                          opacity: t.completed ? 0.6 : 1,
                        }}
                      >
                        {t.title}
                      </div>

                      {t.description ? (
                        <div style={{ opacity: t.completed ? 0.5 : 0.8 }}>
                          {t.description}
                        </div>
                      ) : null}

                      <div style={{ marginTop: 4, opacity: 0.75, fontSize: 13 }}>
                        <span style={{ marginRight: 12 }}>
                          Category: <b>{t.category}</b>
                        </span>
                        <span style={{ marginRight: 12 }}>
                          Priority: <b>{t.priority}</b>
                        </span>
                        <span>
                          Due: <b>{t.dueDate ? t.dueDate : "—"}</b>
                        </span>
                      </div>
                    </div>
                  </label>

                  <button type="button" onClick={() => handleDeleteTodo(t.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
