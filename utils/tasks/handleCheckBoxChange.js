import useTaskStore from "@/store/tasksStore";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import tasksSocket from "@/utils/tasksSignalRHub";

export default function handleCheckBoxChange(event, projectId) {
  const taskId = parseInt(event.target.parentElement.id);
  if (event.target.checked) completeTask(projectId, taskId);
  else uncompleteTask(projectId, taskId);
}

const completeTask = async (projectId, taskId) => {
  try {
    await tasksSocket.invoke("CompleteTask", projectId, parseInt(taskId));
    useTaskStore.getState().complete(taskId);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error);
  }
};

const uncompleteTask = async (projectId, taskId) => {
  try {
    await tasksSocket.invoke("UncompleteTask", projectId, parseInt(taskId));
    useTaskStore.getState().uncomplete(taskId);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error);
  }
};
