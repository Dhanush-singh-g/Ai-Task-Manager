"use client";

import { useEffect, useState } from "react";

interface Task {
  id: number;
  description: string;
  deadline: string;
  type: "personal" | "academics" | "self_improvement";
  completed: boolean;
  isRemoving?: boolean;
}

type Filter = "all" | "pending" | "completed";

type RoadmapItem = {
  day: string;
  plan: TaskWithReason[];
};

type TaskWithReason = {
  task: string;
  reason: string;
};

type AiRoadmap = {
  today_focus: TaskWithReason[];
  upcoming: TaskWithReason[];
  warnings: string[];
  roadmap: RoadmapItem[];
};

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState<Task["type"]>("personal");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [aiRoadmap, setAiRoadmap] = useState<AiRoadmap | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  async function loadTasks() {
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
  }

  async function loadAiRoadmap() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAiRoadmap(data);
      }
    } catch (err) {
      console.error("AI Roadmap error:", err);
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    loadAiRoadmap();
  }, []);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, deadline, type }),
    });

    if (res.ok) {
      const newTask = await res.json();
      setTasks(prev => [newTask, ...prev]);
      setDescription("");
      setDeadline("");
      setType("personal");
      loadAiRoadmap(); // refresh AI roadmap after adding
    }
  }

  async function markDone(id: number) {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, isRemoving: true } : t))
    );
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== id));
      loadTasks();
      loadAiRoadmap(); // refresh AI roadmap after marking done
    }, 300);
  }

  async function saveEdit() {
    if (!editingTask) return;

    await fetch(`/api/tasks/${editingTask.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: editingTask.description,
        deadline: editingTask.deadline,
        type: editingTask.type,
      }),
    });

    setTasks(prev =>
      prev.map(t => (t.id === editingTask.id ? editingTask : t))
    );
    setEditingTask(null);
    loadAiRoadmap(); // refresh AI roadmap after editing
  }

  const filteredTasks = tasks
    .filter(t =>
      filter === "all" ? true : filter === "completed" ? t.completed : !t.completed
    )
    .filter(t => t.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <h1 className="text-3xl font-bold text-center mb-6">AI Task Manager</h1>

      {/* ADD TASK */}
      <form
        onSubmit={addTask}
        className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <input
          placeholder="Task description"
          className="border rounded px-3 py-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />

        <input
          type="date"
          className="border rounded px-3 py-2"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          required
        />

        <select
          className="border rounded px-3 py-2"
          value={type}
          onChange={e => setType(e.target.value as Task["type"])}
        >
          <option value="personal">Personal</option>
          <option value="academics">Academics</option>
          <option value="self_improvement">Self Improvement</option>
        </select>

        <button className="bg-blue-600 text-white rounded px-4 py-2">
          Add Task
        </button>
      </form>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          placeholder="Search tasks..."
          className="border rounded px-4 py-2 w-full"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="flex gap-2">
          {["all", "pending", "completed"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as Filter)}
              className={`px-4 py-2 rounded border ${filter === f ? "bg-black text-white" : "bg-white"
                }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* TASK LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            className={`bg-white p-4 rounded-lg shadow transition-all duration-300
              ${task.isRemoving ? "opacity-0 translate-x-4" : ""}`}
          >
            <h3 className="font-semibold text-lg mb-1">{task.description}</h3>

            <p className="text-sm mb-1">
              Deadline: {new Date(task.deadline).toLocaleDateString()}
            </p>

            <p className="text-sm mb-3">
              Type: {task.type.replace("_", " ")}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-xs border px-2 py-1 rounded">
                {task.completed ? "Completed" : "Pending"}
              </span>

              <div className="flex gap-2">
                {!task.completed && (
                  <button
                    onClick={() => markDone(task.id)}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    Done
                  </button>
                )}

                <button
                  onClick={() => setEditingTask(task)}
                  className="bg-gray-700 text-white px-2 py-1 rounded text-xs"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI ROADMAP */}
      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-semibold">AI Suggested Plan</h2>
        {aiLoading && <p>Loading AI roadmap...</p>}
        {aiRoadmap && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Today Focus */}
            <div className="bg-green-100 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Today Focus</h3>
              <ul className="list-disc pl-5 space-y-2">
                {aiRoadmap.today_focus.map((item, idx) => (
                  <li key={idx}>
                    <p className="font-medium">{item.task}</p>
                    <p className="text-sm text-gray-600">{item.reason}</p>
                  </li>
                ))}
              </ul>

            </div>

            {/* Upcoming */}
            <div className="bg-blue-100 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">Upcoming</h3>
              <ul className="list-disc pl-5 space-y-2">
                {aiRoadmap.upcoming.map((item, idx) => (
                  <li key={idx}>
                    <p className="font-medium">{item.task}</p>
                    <p className="text-sm text-gray-600">{item.reason}</p>
                  </li>
                ))}
              </ul>

            </div>

            {/* Warnings */}
            {aiRoadmap.warnings.length > 0 && (
              <div className="bg-red-100 p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Warnings</h3>
                <ul className="list-disc pl-5">
                  {aiRoadmap.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Roadmap */}
            <div className="bg-yellow-100 p-4 rounded-lg shadow col-span-1 md:col-span-2">
              <h3 className="font-semibold mb-2">Full Roadmap</h3>
              <ul className="list-disc pl-5">
                {aiRoadmap.roadmap.map((section, idx) => (
                  <div key={idx} className="mb-4">
                    <h4 className="font-semibold mb-2">{section.day}</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {section.plan.map((item, i) => (
                        <li key={i}>
                          <span className="font-medium">{item.task}</span>
                          <div className="text-sm text-gray-600">{item.reason}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 text-black">
            <h2 className="font-bold mb-4">Edit Task</h2>

            <input
              className="border w-full mb-2 px-3 py-2 rounded"
              value={editingTask.description}
              onChange={e =>
                setEditingTask({ ...editingTask, description: e.target.value })
              }
            />

            <input
              type="date"
              className="border w-full mb-2 px-3 py-2 rounded"
              value={editingTask.deadline.slice(0, 10)}
              onChange={e =>
                setEditingTask({ ...editingTask, deadline: e.target.value })
              }
            />

            <select
              className="border w-full mb-4 px-3 py-2 rounded"
              value={editingTask.type}
              onChange={e =>
                setEditingTask({
                  ...editingTask,
                  type: e.target.value as Task["type"],
                })
              }
            >
              <option value="personal">Personal</option>
              <option value="academics">Academics</option>
              <option value="self_improvement">Self Improvement</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingTask(null)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
