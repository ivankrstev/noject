import useTaskStore from "@/store/tasksStore";
import { AuthReloginError, Task } from "@/types";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import tasksSocket from "@/utils/tasksSignalRHub";

interface AddTaskResponse {
  task: Task;
}

export const addTask = async (projectId: string, prev: number | string | null): Promise<void> => {
  try {
    const response = await tasksSocket.invoke<AddTaskResponse>("AddTask", projectId, prev);
    useTaskStore.getState().attachTaskOnPrev(response.task, prev || 0);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error as AuthReloginError, null);
  }
};

export const deleteTask = async (projectId: string, taskId: number): Promise<void> => {
  try {
    await tasksSocket.invoke("DeleteTask", projectId, taskId);
    useTaskStore.getState().delete(taskId);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error as AuthReloginError);
  }
};

export const increaseTaskLevel = async (projectId: string, taskId: number): Promise<void> => {
  try {
    if (!useTaskStore.getState().canIncreaseLevel(taskId)) return;
    await tasksSocket.invoke("IncreaseLevel", projectId, taskId);
    useTaskStore.getState().increaseLevel(taskId);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error as AuthReloginError);
  }
};

export const decreaseTaskLevel = async (projectId: string, taskId: number): Promise<void> => {
  try {
    if (!useTaskStore.getState().canDecreaseLevel(taskId)) return;
    await tasksSocket.invoke("DecreaseLevel", projectId, taskId);
    useTaskStore.getState().decreaseLevel(taskId);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error as AuthReloginError);
  }
};
