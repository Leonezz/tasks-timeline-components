import React, { useState } from "react";
import { TasksTimelineApp } from "@tasks-timeline/components";
import type { Task } from "@tasks-timeline/components";
import "@tasks-timeline/components/index.css";

const initialTasks: Task[] = [
  {
    id: "example-task-1",
    title: "Review the agentic chat processing UI",
    status: "todo",
    createdAt: "2026-07-08",
    dueAt: "2026-07-08",
    priority: "high",
    category: "Product",
    tags: [{ id: "agent-ui", name: "agent-ui" }],
  },
  {
    id: "example-task-2",
    title: "Validate task timeline grouping",
    status: "doing",
    createdAt: "2026-07-07",
    startAt: "2026-07-08T10:00:00",
    priority: "medium",
    category: "Engineering",
    tags: [{ id: "qa", name: "qa" }],
  },
  {
    id: "example-task-3",
    title: "Publish component package after review",
    status: "todo",
    createdAt: "2026-07-07",
    dueAt: "2026-07-10",
    priority: "medium",
    category: "Release",
    tags: [{ id: "release", name: "release" }],
  },
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  return (
    <TasksTimelineApp
      tasks={tasks}
      onTaskAdded={(task) => {
        setTasks((current) => [...current, task]);
      }}
      onTaskUpdated={(task) => {
        setTasks((current) =>
          current.map((item) => (item.id === task.id ? task : item)),
        );
      }}
      onTaskDeleted={(taskId) => {
        setTasks((current) => current.filter((task) => task.id !== taskId));
      }}
    />
  );
};

export default App;
