import { create } from "zustand";

const getParentTaskIndex = (taskIndex) => {
  const tasks = useTaskStore.getState().tasks;
  let parentTaskIndex = taskIndex - 1;
  while (parentTaskIndex !== -1 && tasks[parentTaskIndex].level >= tasks[taskIndex].level)
    parentTaskIndex--;
  return parentTaskIndex;
};

const useTaskStore = create((set) => ({
  tasks: [],
  setTasks: (tasks) => set(() => ({ tasks })),
  attachTaskOnPrev: (newTask, prev) =>
    set((state) => {
      if (state.tasks.length === 0) return { tasks: [newTask], taskToFocus: newTask.id };
      let tasks = state.tasks;
      let indexToInsertAfter = tasks.findIndex((item) => item.id === parseInt(prev));
      while (tasks[indexToInsertAfter + 1] && tasks[indexToInsertAfter + 1].level > newTask.level)
        indexToInsertAfter++;
      if (indexToInsertAfter !== -1) tasks.splice(indexToInsertAfter + 1, 0, newTask);
      let parentTaskIndex = getParentTaskIndex(indexToInsertAfter + 1);
      while (parentTaskIndex !== -1) {
        if (!tasks[parentTaskIndex].completed) break;
        tasks[parentTaskIndex].completed = false;
        parentTaskIndex = getParentTaskIndex(parentTaskIndex);
      }
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
