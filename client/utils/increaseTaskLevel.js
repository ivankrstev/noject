import tasksProgressHandler from "@/utils/tasksProgressHandler";

export default function increaseLevel(taskRef) {
  const taskElement = taskRef.current;
  const currentLevel = parseInt(taskElement.getAttribute("level"));
  const prevLevel = parseInt(taskElement.previousSibling?.getAttribute("level"));
  if (currentLevel <= prevLevel) {
    taskElement.setAttribute("level", currentLevel + 1);
    taskElement.style.marginLeft = ((currentLevel + 1) * 1.1).toFixed(1) + "em";
  }
  tasksProgressHandler();
}
