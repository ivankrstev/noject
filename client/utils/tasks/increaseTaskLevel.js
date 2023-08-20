import tasksProgressHandler from "@/utils/tasks/tasksProgressHandler";
import api from "../api";
import AxiosErrorHandler from "../AxiosErrorHandler";

export default function increaseTaskLevel(taskRef) {
  const taskElement = taskRef.current;
  increaseLevelApiRequest(taskElement.id);
  const currentLevel = parseInt(taskElement.getAttribute("level"));
  const prevLevel = parseInt(taskElement.previousSibling?.getAttribute("level"));
  if (currentLevel <= prevLevel) {
    taskElement.setAttribute("level", currentLevel + 1);
    taskElement.style.marginLeft = ((currentLevel + 1) * 1.1).toFixed(1) + "em";
  }
  tasksProgressHandler();
}

export const increaseLevelApiRequest = async (t_id) => {
  try {
    await api.put(`/tasks/${t_id}/increase-level`);
  } catch (error) {
    AxiosErrorHandler(error);
  }
};
