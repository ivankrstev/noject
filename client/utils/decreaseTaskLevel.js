import tasksProgressHandler from "@/utils/tasksProgressHandler";

export default function decreaseLevel(taskRef) {
  const taskElement = taskRef.current;
  const currentLevel = parseInt(taskElement.getAttribute("level"));
  let temp = taskElement.nextSibling;
  while (temp && parseInt(temp.getAttribute("level")) > currentLevel) {
    console.log("temp:", temp);
    const tempLevel = parseInt(temp.getAttribute("level"));
    temp.setAttribute("level", tempLevel - 1);
    temp.style.marginLeft = ((tempLevel - 1) * 1.1).toFixed(1) + "em";
    temp.childNodes[0].innerText = temp.childNodes[1].checked ? "100%" : "0%";
    temp = temp.nextSibling;
  }
  taskElement.setAttribute("level", currentLevel - 1);
  taskElement.style.marginLeft = ((currentLevel - 1) * 1.1).toFixed(1) + "em";
  tasksProgressHandler();
}
