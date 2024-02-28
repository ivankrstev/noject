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
  delete: (targetTaskId) => {
    set((state) => {
      let targetTaskIndex = state.tasks.findIndex((item) => item.id === parseInt(targetTaskId));
      const targetTaskLevel = state.tasks[targetTaskIndex].level;
      while (
        targetTaskIndex !== state.tasks.length - 1 &&
        targetTaskLevel < state.tasks[++targetTaskIndex].level
      )
        state.tasks[targetTaskIndex].level--;
      state.tasks = state.tasks.filter((task) => task.id !== targetTaskId);
      return { tasks: [...state.tasks] };
    });
  },
}));

export default useTaskStore;
