import { useState } from "react";

export default function App() {
  // todos: { id, title, description, completed }
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleAddTodo(e) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle) return;

    const newTodo = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: trimmedDesc,
      completed: false,
    };

    setTodos((prev) => [newTodo, ...prev]);
    setTitle("");
    setDescription("");
  }

  function handleToggleTodo(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function handleDeleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 720 }}>
      <h1>TODO List</h1>

      <form onSubmit={handleAddTodo} style={{ display: "grid", gap: 8 }}>
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
        <button type="submit">Add</button>
      </form>

      <div style={{ marginTop: 20 }}>
        <h2 style={{ marginBottom: 8 }}>Tasks ({todos.length})</h2>

        {todos.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No tasks yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {todos.map((t) => (
              <li key={t.id} style={{ marginBottom: 10 }}>
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
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggleTodo(t.id)}
                      style={{ marginTop: 4 }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          textDecoration: t.completed
                            ? "line-through"
                            : "none",
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
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleDeleteTodo(t.id)}
                  >
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
