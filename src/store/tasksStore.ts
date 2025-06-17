import { Task } from "@/types";
import { TasksState } from "@/types/store";
import { create } from "zustand";

const createStore = () =>
  create<TasksState>((set) => ({
    tasks: [],
    setTasks: (tasks: Task[]) => set(() => ({ tasks })),
    attachTaskOnPrev: (newTask: Task, prev: string | number) =>
      set((state) => {
        if (state.tasks.length === 0) return { tasks: [newTask], taskToFocus: newTask.id };
        const tasks = [...state.tasks];
        let indexToInsertAfter = tasks.findIndex((item) => item.id === parseInt(prev.toString()));
        while (tasks[indexToInsertAfter + 1] && tasks[indexToInsertAfter + 1].level > newTask.level)
          indexToInsertAfter++;
        if (indexToInsertAfter !== -1) tasks.splice(indexToInsertAfter + 1, 0, newTask);
        let parentTaskIndex = getParentTaskIndex(indexToInsertAfter + 1);
        while (parentTaskIndex !== -1) {
          if (!tasks[parentTaskIndex].completed) break;
          tasks[parentTaskIndex].completed = false;
          parentTaskIndex = getParentTaskIndex(parentTaskIndex);
        }
        return { tasks, taskToFocus: newTask.id };
      }),
    taskToFocus: null,
    setTaskToFocus: (taskId: number | null) => set(() => ({ taskToFocus: taskId })),
    delete: (targetTaskId: string | number) => {
      set((state) => {
        const parsedTaskId = parseInt(targetTaskId.toString());
        const targetTaskIndex = state.tasks.findIndex((item) => item.id === parsedTaskId);
        if (targetTaskIndex === -1) return state;

        const prevTaskId = state.tasks[targetTaskIndex + 1]?.id ?? null;
        const targetTaskLevel = state.tasks[targetTaskIndex].level;
        const newTasks = [...state.tasks];

        let currentIndex = targetTaskIndex;
        while (
          currentIndex !== newTasks.length - 1 &&
          targetTaskLevel < newTasks[++currentIndex].level
        )
          newTasks[currentIndex].level--;

        return {
          tasks: newTasks.filter((task) => task.id !== parsedTaskId),
          taskToFocus: prevTaskId,
        };
      });
    },
    complete: (targetTaskId: string | number) => {
      set((state) => {
        const parsedTaskId = parseInt(targetTaskId.toString());
        const tasks = [...state.tasks];
        const targetTaskIndex = tasks.findIndex((item) => item.id === parsedTaskId);
        if (targetTaskIndex === -1) return state;

        const targetTaskLevel = tasks[targetTaskIndex].level;
        tasks[targetTaskIndex].completed = true;

        let currentTaskIndex = targetTaskIndex;
        while (
          currentTaskIndex !== tasks.length - 1 &&
          targetTaskLevel < tasks[++currentTaskIndex].level
        )
          tasks[currentTaskIndex].completed = true; // Complete all subtasks

        // Check for the parent task and complete it if all its children are completed, and so on
        let parentTaskIndex = getParentTaskIndex(targetTaskIndex);
        while (parentTaskIndex !== -1) {
          const children = getTaskChildren(parentTaskIndex, tasks);
          // If all children of the parent task are completed, complete the parent task
          if (children.every((task) => task.completed)) tasks[parentTaskIndex].completed = true;
          else break;
          parentTaskIndex = getParentTaskIndex(parentTaskIndex);
        }

        return { tasks };
      });
    },
    uncomplete: (targetTaskId: string | number) => {
      set((state) => {
        const parsedTaskId = parseInt(targetTaskId.toString());
        const tasks = [...state.tasks];
        const targetTaskIndex = tasks.findIndex((item) => item.id === parsedTaskId);
        if (targetTaskIndex === -1) return state;

        const targetTaskLevel = tasks[targetTaskIndex].level;
        tasks[targetTaskIndex].completed = false;

        let currentTaskIndex = targetTaskIndex;
        while (
          currentTaskIndex !== tasks.length - 1 &&
          targetTaskLevel < tasks[++currentTaskIndex].level
        )
          tasks[currentTaskIndex].completed = false; // Uncomplete all subtasks

        // Uncomplete the parent task if it was completed
        let parentTaskIndex = getParentTaskIndex(targetTaskIndex);
        while (parentTaskIndex !== -1) {
          if (!tasks[parentTaskIndex].completed) break;
          tasks[parentTaskIndex].completed = false;
          parentTaskIndex = getParentTaskIndex(parentTaskIndex);
        }

        return { tasks };
      });
    },
    increaseLevel: (targetTaskId: string | number) => {
      set((state) => {
        const parsedTaskId = parseInt(targetTaskId.toString());
        const tasks = [...state.tasks];
        const targetTaskIndex = tasks.findIndex((item) => item.id === parsedTaskId);
        if (targetTaskIndex === -1) return state;

        tasks[targetTaskIndex].level++;
        const newParentTaskIndex = getParentTaskIndex(targetTaskIndex);

        if (newParentTaskIndex !== -1) {
          if (!tasks[targetTaskIndex].completed && tasks[newParentTaskIndex].completed)
            tasks[newParentTaskIndex].completed = false;
          else if (tasks[targetTaskIndex].completed && !tasks[newParentTaskIndex].completed) {
            let parentTaskIndex = newParentTaskIndex;
            while (parentTaskIndex !== -1) {
              const children = getTaskChildren(parentTaskIndex, tasks);
              // If all children of the parent task are completed, complete the parent task
              if (children.every((task) => task.completed)) tasks[parentTaskIndex].completed = true;
              else break;
              parentTaskIndex = getParentTaskIndex(parentTaskIndex);
            }
          }
        }

        return { tasks };
      });
    },
    canIncreaseLevel: (targetTaskId: string | number): boolean => {
      const parsedTaskId = parseInt(targetTaskId.toString());
      const tasks = useTaskStore.getState().tasks;
      const targetTaskIndex = tasks.findIndex((item: Task) => item.id === parsedTaskId);
      if (targetTaskIndex === -1 || targetTaskIndex === 0) return false;

      const prevTaskIndex = targetTaskIndex - 1;
      return tasks[prevTaskIndex].level >= tasks[targetTaskIndex].level;
    },
    decreaseLevel: (targetTaskId: string | number) => {
      set((state) => {
        const parsedTaskId = parseInt(targetTaskId.toString());
        const tasks = [...state.tasks];
        const targetTaskIndex = tasks.findIndex((item) => item.id === parsedTaskId);
        if (targetTaskIndex === -1) return state;

        const targetTaskLevel = tasks[targetTaskIndex].level;
        if (targetTaskLevel === 0) return state;

        const oldParentTaskIndex = getParentTaskIndex(targetTaskIndex);
        tasks[targetTaskIndex].level--;

        let currentIndex = targetTaskIndex;
        while (currentIndex !== tasks.length - 1 && targetTaskLevel < tasks[++currentIndex].level)
          tasks[currentIndex].level--;

        if (oldParentTaskIndex !== -1) {
          const children = getTaskChildren(oldParentTaskIndex, tasks);
          if (children.length !== 0 && children.every((task) => task.completed))
            tasks[oldParentTaskIndex].completed = true;
        }

        return { tasks };
      });
    },
    canDecreaseLevel: (targetTaskId: string | number): boolean => {
      const parsedTaskId = parseInt(targetTaskId.toString());
      const tasks = useTaskStore.getState().tasks;
      const targetTaskIndex = tasks.findIndex((item: Task) => item.id === parsedTaskId);
      if (targetTaskIndex === -1) return false;

      return tasks[targetTaskIndex].level !== 0;
    },
    updateContent: (targetTaskId: string | number, value: string) => {
      set((state) => {
        const parsedTaskId = parseInt(targetTaskId.toString());
        const tasks = [...state.tasks];
        const targetTaskIndex = tasks.findIndex((item) => item.id === parsedTaskId);
        if (targetTaskIndex === -1) return state;

        tasks[targetTaskIndex].value = value;
        return { tasks };
      });
    },
  }));

// Forward declaration to resolve circular dependency
const useTaskStore = createStore();

// Function to get the parent task index based on the current task index
// This function assumes that tasks are stored in a flat array and that the level property indicates the hierarchy
// It finds the closest parent task that has a lower level than the current task
const getParentTaskIndex = (taskIndex: number): number => {
  const tasks = useTaskStore.getState().tasks;
  let parentTaskIndex = taskIndex - 1;
  while (parentTaskIndex !== -1 && tasks[parentTaskIndex].level >= tasks[taskIndex].level)
    parentTaskIndex--;
  return parentTaskIndex;
};

// Function to get the children of a task based on its index
// It returns all tasks that are direct children of the specified task
// It assumes that tasks are stored in a flat array and that the level property indicates the hierarchy
const getTaskChildren = (parentTaskIndex: number, tasksState?: Task[]): Task[] => {
  const tasks = tasksState ? tasksState : useTaskStore.getState().tasks;
  if (parentTaskIndex === -1) return [];
  const children: Task[] = [];
  const parentTaskLevel = tasks[parentTaskIndex].level;
  while (parentTaskIndex !== tasks.length - 1 && parentTaskLevel !== tasks[++parentTaskIndex].level)
    if (parentTaskLevel + 1 === tasks[parentTaskIndex].level) children.push(tasks[parentTaskIndex]);
  return children;
};

export default useTaskStore;
