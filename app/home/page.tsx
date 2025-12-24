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

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState<Task["type"]>("personal");

  async function loadTasks() {
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !deadline) return;

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
    }
  }

  async function markDone(id: number) {
    // Trigger animation
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, isRemoving: true } : task
      )
    );

    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });

    setTimeout(() => {
      setTasks(prev => prev.filter(task => task.id !== id));
    }, 300);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function deadlineStatus(date: string) {
    const today = new Date();
    const d = new Date(date);
    if (d < today) return "overdue";
    if (d.toDateString() === today.toDateString()) return "today";
    return "future";
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Task Manager
      </h1>

      {/* FORM */}
      <form
        onSubmit={addTask}
        className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <input
          className="border rounded px-3 py-2"
          placeholder="Task description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          type="date"
          className="border rounded px-3 py-2"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
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

        <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
          Add Task
        </button>
      </form>

      {/* TASK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 col-span-full">
            No tasks yet. Add your first task.
          </p>
        )}

        {tasks.map(task => {
          const status = deadlineStatus(task.deadline);

          return (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow p-4 transition-all duration-300
                ${task.isRemoving ? "opacity-0 scale-95" : "opacity-100"}
              `}
            >
              <h3 className="font-semibold text-lg mb-1">
                {task.description}
              </h3>

              <div className="text-sm text-gray-500 mb-3">
                {task.type.replace("_", " ")} •{" "}
                <span
                  className={
                    status === "overdue"
                      ? "text-red-600"
                      : status === "today"
                      ? "text-orange-600"
                      : "text-gray-600"
                  }
                >
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                  Pending
                </span>

                <button
                  onClick={() => markDone(task.id)}
                  disabled={task.isRemoving}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Mark Done
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
