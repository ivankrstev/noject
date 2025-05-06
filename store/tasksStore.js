import { create } from "zustand";

const getParentTaskIndex = (taskIndex) => {
  const tasks = useTaskStore.getState().tasks;
  let parentTaskIndex = taskIndex - 1;
  while (parentTaskIndex !== -1 && tasks[parentTaskIndex].level >= tasks[taskIndex].level)
    parentTaskIndex--;
  return parentTaskIndex;
};

const getTaskChildren = (parentTaskIndex, tasksState) => {
  const tasks = tasksState ? tasksState : useTaskStore.getState().tasks;
  if (parentTaskIndex === -1) return [];
  let children = [];
  let parentTaskLevel = tasks[parentTaskIndex].level;
  while (parentTaskIndex !== tasks.length - 1 && parentTaskLevel !== tasks[++parentTaskIndex].level)
    if (parentTaskLevel + 1 === tasks[parentTaskIndex].level) children.push(tasks[parentTaskIndex]);
  return children;
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
  setTaskToFocus: (taskId) => set(() => ({ taskToFocus: taskId })),
  delete: (targetTaskId) => {
    set((state) => {
      let targetTaskIndex = state.tasks.findIndex((item) => item.id === parseInt(targetTaskId));
      const prevTaskId = state.tasks[targetTaskIndex + 1]?.id ?? null;
      const targetTaskLevel = state.tasks[targetTaskIndex].level;
      while (
        targetTaskIndex !== state.tasks.length - 1 &&
        targetTaskLevel < state.tasks[++targetTaskIndex].level
      )
        state.tasks[targetTaskIndex].level--;
      state.tasks = state.tasks.filter((task) => task.id !== targetTaskId);
      return { tasks: [...state.tasks], taskToFocus: prevTaskId };
    });
  },
  complete: (targetTaskId) => {
    set((state) => {
      let tasks = state.tasks;
      const targetTaskIndex = tasks.findIndex((item) => item.id === parseInt(targetTaskId));
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
        const children = getTaskChildren(parentTaskIndex);
        // If all children of the parent task are completed, complete the parent task
        if (children.every((task) => task.completed)) tasks[parentTaskIndex].completed = true;
        else break;
        parentTaskIndex = getParentTaskIndex(parentTaskIndex);
      }
      return { tasks: [...tasks] };
    });
  },
  uncomplete: (targetTaskId) => {
    set((state) => {
      let tasks = state.tasks;
      const targetTaskIndex = tasks.findIndex((item) => item.id === parseInt(targetTaskId));
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
      return { tasks: [...tasks] };
    });
  },
  increaseLevel: (targetTaskId) => {
    set((state) => {
      const tasks = state.tasks;
      let targetTaskIndex = tasks.findIndex((item) => item.id === parseInt(targetTaskId));
      tasks[targetTaskIndex].level++;
      const newParentTaskIndex = getParentTaskIndex(targetTaskIndex);
      if (!tasks[targetTaskIndex].completed && tasks[newParentTaskIndex].completed)
        tasks[newParentTaskIndex].completed = false;
      else if (tasks[targetTaskIndex].completed && !tasks[newParentTaskIndex].completed) {
        let parentTaskIndex = newParentTaskIndex;
        while (parentTaskIndex !== -1) {
          const children = getTaskChildren(parentTaskIndex);
          // If all children of the parent task are completed, complete the parent task
          if (children.every((task) => task.completed)) tasks[parentTaskIndex].completed = true;
          else break;
          parentTaskIndex = getParentTaskIndex(parentTaskIndex);
        }
      }
      return { tasks: [...state.tasks] };
    });
  },
  canIncreaseLevel: (targetTaskId) => {
    const tasks = useTaskStore.getState().tasks;
    const targetTaskIndex = tasks.findIndex((item) => item.id === parseInt(targetTaskId));
    const prevTaskIndex = targetTaskIndex - 1;
    if (targetTaskIndex === 0) return false;
    return tasks[prevTaskIndex].level >= tasks[targetTaskIndex].level;
  },
  decreaseLevel: (targetTaskId) => {
    set((state) => {
      let targetTaskIndex = state.tasks.findIndex((item) => item.id === parseInt(targetTaskId));
      const targetTaskLevel = state.tasks[targetTaskIndex].level;
      if (targetTaskLevel === 0) return;
      const oldParentTaskIndex = getParentTaskIndex(targetTaskIndex);
      state.tasks[targetTaskIndex].level--;
      while (
        targetTaskIndex !== state.tasks.length - 1 &&
        targetTaskLevel < state.tasks[++targetTaskIndex].level
      )
        state.tasks[targetTaskIndex].level--;
      const children = getTaskChildren(oldParentTaskIndex, state.tasks);
      if (children.length !== 0 && children.every((task) => task.completed))
        state.tasks[oldParentTaskIndex].completed = true;
      return { tasks: [...state.tasks] };
    });
  },
  canDecreaseLevel: (targetTaskId) => {
    const tasks = useTaskStore.getState().tasks;
    const targetTaskIndex = tasks.findIndex((item) => item.id === parseInt(targetTaskId));
    return tasks[targetTaskIndex].level !== 0;
  },
}));

export default useTaskStore;
