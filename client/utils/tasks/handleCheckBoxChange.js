import tasksProgressHandler, { getAllSubTasks } from "@/utils/tasks/tasksProgressHandler";

export default function handleCheckBoxChange(event) {
  // Set the percentages for this task if the checkbox is changed
  event.target.previousSibling.innerText = event.target.checked ? "100%" : "0%";
  // Handle in/completion of all subtasks (children, grandchildren, great grandchildren, ...)
  const allSubTasks = getAllSubTasks(event.target.parentNode);
  allSubTasks.forEach((el) => {
    el.childNodes[0].innerText = event.target.checked ? "100%" : "0%";
    el.childNodes[1].checked = event.target.checked;
  });
  tasksProgressHandler();
}
