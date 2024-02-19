import increaseTaskLevel from "./increaseTaskLevel";
import decreaseTaskLevel from "./decreaseTaskLevel";
import AxiosErrorHandler from "../AxiosErrorHandler";
import api from "../api";

export default function handleTaskInput(e, taskRef, projectId) {
  if (e.shiftKey && e.key === "Tab") {
    e.preventDefault();
    if (e.target.parentNode.getAttribute("level") !== "0") decreaseTaskLevel(taskRef);
  } else if (e.key === "Tab") {
    e.preventDefault();
    increaseTaskLevel(taskRef);
  } else if (e.key === "Enter") {
    e.preventDefault();
    handleTaskCreating(projectId, taskRef.current.id);
  } else if (e.key === "Delete") {
    handleTaskDeleting(taskRef.current.id);
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

const handleTaskCreating = async (projectId, prev) => {
  try {
    await api.post(`/tasks/${projectId}`, { prev });
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error);
  }
};
const handleTaskDeleting = async (t_id) => {
  try {
    await api.delete(`/tasks/${t_id}`);
  } catch (error) {
    console.error(error);
    AxiosErrorHandler(error);
  }
};
