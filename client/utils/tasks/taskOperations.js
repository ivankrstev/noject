import useTaskStore from "@/store/tasksStore";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import tasksSocket from "@/utils/tasksSignalRHub";

export const addTask = async (projectId, prev) => {
  try {
    const { task } = await tasksSocket.invoke("AddTask", projectId, prev);
    useTaskStore.getState().attachTaskOnPrev(task, prev);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error);
  }
};

export const deleteTask = async (projectId, taskId) => {
  try {
    await tasksSocket.invoke("DeleteTask", projectId, taskId);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error);
  }
};
