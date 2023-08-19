import tasksProgressHandler, { getAllSubTasks } from "@/utils/tasks/tasksProgressHandler";
import api from "../api";

export default function decreaseLevel(taskRef) {
  const taskElement = taskRef.current;
  decreaseLevelApiRequest(taskElement.id);
  const currentLevel = parseInt(taskElement.getAttribute("level"));
  const subtasks = getAllSubTasks(taskElement);
  subtasks.forEach((subtask) => {
    const subtaskLevel = parseInt(subtask.getAttribute("level"));
    subtask.setAttribute("level", subtaskLevel - 1);
    subtask.style.marginLeft = ((subtaskLevel - 1) * 1.1).toFixed(1) + "em";
    subtask.childNodes[0].innerText = subtask.childNodes[1].checked ? "100%" : "0%";
  });
  taskElement.setAttribute("level", currentLevel - 1);
  taskElement.style.marginLeft = ((currentLevel - 1) * 1.1).toFixed(1) + "em";
  tasksProgressHandler();
}

export const decreaseLevelApiRequest = async (t_id) => {
  try {
    const response = await api.put(`/tasks/${t_id}/decrease-level`);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};
