import tasksProgressHandler, { getAllSubTasks } from "@/utils/tasks/tasksProgressHandler";
import api from "../api";
import AxiosErrorHandler from "../AxiosErrorHandler";

export default function handleCheckBoxChange(event) {
  // Set the percentages for this task if the checkbox is changed
  event.target.previousSibling.innerText = event.target.checked ? "100%" : "0%";
  toggleTaskCompletion(event.target.parentElement.id);
  // Handle in/completion of all subtasks (children, grandchildren, great grandchildren, ...)
  const allSubTasks = getAllSubTasks(event.target.parentNode);
  allSubTasks.forEach((el) => {
    el.childNodes[0].innerText = event.target.checked ? "100%" : "0%";
    el.childNodes[1].checked = event.target.checked;
  });
  tasksProgressHandler();
}

export const toggleTaskCompletion = async (t_id) => {
  try {
    await api.put(`/tasks/${t_id}/toggle-complete`);
  } catch (error) {
    AxiosErrorHandler(error);
  }
};
