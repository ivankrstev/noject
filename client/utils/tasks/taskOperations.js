import useTaskStore from "@/store/tasksStore";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import tasksSocket from "@/utils/tasksSignalRHub";

export const addTask = async (projectId, prev) => {
  try {
    const { task } = await tasksSocket.invoke("AddTask", projectId, prev);
    useTaskStore.getState().attachTaskOnPrev(task, prev);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error, null);
  }
};

export const deleteTask = async (projectId, taskId) => {
  try {
    await tasksSocket.invoke("DeleteTask", projectId, taskId);
    useTaskStore.getState().delete(taskId);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error);
  }
};

export const increaseTaskLevel = async (projectId, taskId) => {
  try {
    if (!useTaskStore.getState().canIncreaseLevel(taskId)) return;
    await tasksSocket.invoke("IncreaseLevel", projectId, taskId);
    useTaskStore.getState().increaseLevel(taskId);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error);
  }
};
