import { faker } from "@faker-js/faker";
import { DateTime } from "luxon";
import type { Task, Priority, TaskStatus, Tag } from "../../types";

/**
 * Task builder factory for creating Task mock data
 * Uses Faker for realistic random data generation
 */
export const taskBuilder = {
  /**
   * Base task with default/random values
   */
  base: (overrides?: Partial<Task>): Task => {
    const id = faker.string.uuid();
    return {
      id,
      title: faker.lorem.sentence({ min: 3, max: 8 }),
      description: faker.lorem.paragraph(),
      status: "todo" as TaskStatus,
      priority: "medium" as Priority,
      createdAt: DateTime.now().toISO()!,
      dueAt: undefined,
      startAt: undefined,
      completedAt: undefined,
      tags: [],
      category: "General",
      isRecurring: false,
      recurringInterval: undefined,
      ...overrides,
    };
  },

  /**
   * Overdue task (high priority, past due date)
   */
  overdue: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      status: "overdue",
      dueAt: DateTime.now().minus({ days: faker.number.int({ min: 1, max: 7 }) }).toISO(),
      priority: "high",
      title: "Overdue: " + faker.lorem.sentence({ min: 3, max: 6 }),
      ...overrides,
    }),

  /**
   * Completed task
   */
  completed: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      status: "done",
      completedAt: DateTime.now()
        .minus({ hours: faker.number.int({ min: 1, max: 48 }) })
        .toISO(),
      title: "✓ " + faker.lorem.sentence({ min: 3, max: 6 }),
      ...overrides,
    }),

  /**
   * Task due today
   */
  dueToday: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      status: "due",
      dueAt: DateTime.now().plus({ hours: faker.number.int({ min: 1, max: 23 }) }).toISO(),
      priority: "high",
      ...overrides,
    }),

  /**
   * Task due tomorrow
   */
  dueTomorrow: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      dueAt: DateTime.now().plus({ days: 1 }).toISO(),
      ...overrides,
    }),

  /**
   * Scheduled task (future start date)
   */
  scheduled: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      status: "scheduled",
      startAt: DateTime.now().plus({ days: faker.number.int({ min: 1, max: 14 }) }).toISO(),
      ...overrides,
    }),

  /**
   * Task currently in progress (doing)
   */
  doing: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      status: "doing",
      startAt: DateTime.now().minus({ hours: faker.number.int({ min: 1, max: 5 }) }).toISO(),
      ...overrides,
    }),

  /**
   * Cancelled task
   */
  cancelled: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      status: "cancelled",
      title: "✗ " + faker.lorem.sentence({ min: 3, max: 6 }),
      ...overrides,
    }),

  /**
   * Recurring task
   */
  withRecurrence: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      isRecurring: true,
      recurringInterval: "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO",
      title: "🔁 " + faker.lorem.sentence({ min: 3, max: 6 }),
      ...overrides,
    }),

  /**
   * Daily recurring task
   */
  dailyRecurring: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      isRecurring: true,
      recurringInterval: "FREQ=DAILY;INTERVAL=1",
      title: "🔁 Daily: " + faker.lorem.sentence({ min: 2, max: 4 }),
      ...overrides,
    }),

  /**
   * Weekly recurring task
   */
  weeklyRecurring: (weekday: string = "MO", overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      isRecurring: true,
      recurringInterval: `FREQ=WEEKLY;INTERVAL=1;BYDAY=${weekday}`,
      title: "🔁 Weekly: " + faker.lorem.sentence({ min: 2, max: 4 }),
      ...overrides,
    }),

  /**
   * Monthly recurring task
   */
  monthlyRecurring: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      isRecurring: true,
      recurringInterval: "FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=1",
      title: "🔁 Monthly: " + faker.lorem.sentence({ min: 2, max: 4 }),
      ...overrides,
    }),

  /**
   * Task with tags
   */
  withTags: (count: number, overrides?: Partial<Task>): Task => {
    const tags: Tag[] = Array.from({ length: count }, () => ({
      id: `tag-${faker.string.uuid()}`,
      name: faker.word.noun(),
    }));
    return taskBuilder.base({
      tags,
      ...overrides,
    });
  },

  /**
   * High priority task
   */
  highPriority: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      priority: "high",
      title: "❗ " + faker.lorem.sentence({ min: 3, max: 6 }),
      ...overrides,
    }),

  /**
   * Low priority task
   */
  lowPriority: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      priority: "low",
      ...overrides,
    }),

  /**
   * Task with full description
   */
  withFullDescription: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      description: faker.lorem.paragraphs(3),
      ...overrides,
    }),

  /**
   * Undated task (backlog)
   */
  undated: (overrides?: Partial<Task>): Task =>
    taskBuilder.base({
      dueAt: undefined,
      startAt: undefined,
      completedAt: undefined,
      status: "todo",
      ...overrides,
    }),

  /**
   * Create many tasks
   */
  many: (count: number, template?: Partial<Task>): Task[] =>
    Array.from({ length: count }, (_, i) =>
      taskBuilder.base({
        id: `task-${i}-${faker.string.uuid()}`,
        ...template,
      })
    ),

  /**
   * Create tasks with varied dates across days
   */
  manyAcrossDays: (
    count: number,
    startDate: DateTime = DateTime.now().minus({ days: 30 }),
    endDate: DateTime = DateTime.now().plus({ days: 30 })
  ): Task[] => {
    return Array.from({ length: count }, (_, i) => {
      const randomDate = DateTime.fromMillis(
        faker.date
          .between({ from: startDate.toJSDate(), to: endDate.toJSDate() })
          .getTime()
      );

      const statuses: TaskStatus[] = [
        "todo",
        "doing",
        "done",
        "scheduled",
        "overdue",
        "due",
      ];
      const priorities: Priority[] = ["low", "medium", "high"];

      return taskBuilder.base({
        id: `task-${i}`,
        dueAt: randomDate.toISO() ?? undefined,
        status: faker.helpers.arrayElement(statuses),
        priority: faker.helpers.arrayElement(priorities),
        completedAt:
          faker.datatype.boolean() && faker.datatype.boolean()
            ? randomDate.toISO() ?? undefined
            : undefined,
      });
    });
  },

  /**
   * Create tasks for specific categories
   */
  withCategory: (category: string, count: number = 5): Task[] =>
    taskBuilder.many(count, { category }),

  /**
   * Work category tasks
   */
  work: (count: number = 5): Task[] =>
    taskBuilder.many(count, {
      category: "Work",
      title: "Work: " + faker.lorem.sentence({ min: 3, max: 6 }),
    }),

  /**
   * Personal category tasks
   */
  personal: (count: number = 5): Task[] =>
    taskBuilder.many(count, {
      category: "Personal",
      title: "Personal: " + faker.lorem.sentence({ min: 3, max: 6 }),
    }),

  /**
   * Mix of completed and incomplete tasks
   */
  mixed: (count: number = 10): Task[] => {
    const tasks: Task[] = [];
    for (let i = 0; i < count; i++) {
      if (i % 3 === 0) {
        tasks.push(taskBuilder.completed());
      } else if (i % 4 === 0) {
        tasks.push(taskBuilder.overdue());
      } else if (i % 5 === 0) {
        tasks.push(taskBuilder.scheduled());
      } else {
        tasks.push(taskBuilder.base());
      }
    }
    return tasks;
  },
};
