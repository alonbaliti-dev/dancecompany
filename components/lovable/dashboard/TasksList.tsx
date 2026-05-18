"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { TaskItem } from "@/lib/lovable/types";

export function TasksList({
  items,
  title = "משימות",
}: {
  items: TaskItem[];
  title?: string;
}) {
  const [tasks, setTasks] = useState(items);
  const remaining = tasks.filter((t) => !t.done).length;

  const toggle = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <span className="text-xs text-muted-foreground">
          {remaining} פתוחות
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {tasks.map((t) => (
          <motion.li
            key={t.id}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggle(t.id)}
            className={`glass flex cursor-pointer items-center gap-3 rounded-2xl p-3.5 text-right transition-opacity ${
              t.done ? "opacity-55" : ""
            }`}
          >
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                t.done
                  ? "border-success bg-success text-background"
                  : t.tone === "urgent"
                    ? "border-rose/60"
                    : "border-hairline"
              }`}
            >
              {t.done && <Check size={14} strokeWidth={3} />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className={`truncate text-sm font-medium text-foreground ${
                  t.done ? "line-through" : ""
                }`}
              >
                {t.title}
              </span>
              <span
                className={`text-[11px] ${
                  t.tone === "urgent" && !t.done
                    ? "text-rose"
                    : "text-muted-foreground"
                }`}
              >
                {t.due}
              </span>
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
