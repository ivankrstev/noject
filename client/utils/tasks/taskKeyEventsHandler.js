import decreaseTaskLevel from "@/utils/tasks/decreaseTaskLevel";
import increaseTaskLevel from "@/utils/tasks/increaseTaskLevel";
import { addTask, deleteTask } from "@/utils/tasks/taskOperations";

export default function handleTaskInput(e, taskRef, projectId) {
  const taskId = parseInt(taskRef.current.id);
  if (e.shiftKey && e.key === "Tab") {
    e.preventDefault();
    if (e.target.parentNode.getAttribute("level") !== "0") decreaseTaskLevel(taskRef);
  } else if (e.key === "Tab") {
    e.preventDefault();
    increaseTaskLevel(taskRef);
  } else if (e.key === "Enter") {
    e.preventDefault();
    addTask(projectId, taskId);
  } else if (e.key === "Delete") {
    e.preventDefault();
    deleteTask(projectId, taskId);
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    const div = e.target.parentNode.nextSibling?.lastChild;
    div && setFocusCursorOnEnd(div);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const div = e.target.parentNode.previousSibling?.lastChild;
    div && setFocusCursorOnEnd(div);
  }
  console.log(e.key);
}

const setFocusCursorOnEnd = (div) => {
  div.focus({ focusVisible: true });
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(div);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
};
