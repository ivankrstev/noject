import {
  addTask,
  decreaseTaskLevel,
  deleteTask,
  increaseTaskLevel,
} from "@/utils/tasks/taskOperations";

export default function handleTaskInput(e, taskRef, projectId) {
  const taskId = parseInt(taskRef.current.id);
  if (e.shiftKey && e.key === "Tab") {
    e.preventDefault();
    decreaseTaskLevel(projectId, taskId);
  } else if (e.key === "Tab") {
    e.preventDefault();
    increaseTaskLevel(projectId, taskId);
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
