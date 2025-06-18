import useTaskStore from "@/store/tasksStore";
import { AuthReloginError } from "@/types";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import tasksSocket from "@/utils/tasksSignalRHub";

export default function handleCheckBoxChange(
  event: React.ChangeEvent<HTMLInputElement>,
  projectId: string
): void {
  const taskId = parseInt(event.target.parentElement!.id);
  if (event.target.checked) completeTask(projectId, taskId);
  else uncompleteTask(projectId, taskId);
}

const completeTask = async (projectId: string, taskId: number): Promise<void> => {
  try {
    await tasksSocket.invoke("CompleteTask", projectId, taskId);
    useTaskStore.getState().complete(taskId);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error as AuthReloginError);
  }
};

const uncompleteTask = async (projectId: string, taskId: number): Promise<void> => {
  try {
    await tasksSocket.invoke("UncompleteTask", projectId, taskId);
    useTaskStore.getState().uncomplete(taskId);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error as AuthReloginError);
  }
};
