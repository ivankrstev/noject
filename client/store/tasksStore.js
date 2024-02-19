import { create } from "zustand";

const useTaskStore = create((set) => ({
  tasks: [],
  setTasks: (tasks) => set(() => ({ tasks })),
  attachTaskOnPrev: (newTask, prev) =>
    set((state) => {
      let tasks = state.tasks;
      let indexToInsertAfter = tasks.findIndex((item) => item.id === parseInt(prev));
      if (indexToInsertAfter !== -1) tasks.splice(indexToInsertAfter + 1, 0, newTask);
      return { tasks: [...tasks], taskToFocus: newTask.id };
    }),
  taskToFocus: null,
}));

export default useTaskStore;
