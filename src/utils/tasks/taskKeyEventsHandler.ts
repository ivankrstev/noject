import {
  addTask,
  decreaseTaskLevel,
  deleteTask,
  increaseTaskLevel,
} from "@/utils/tasks/taskOperations";
import { RefObject } from "react";

export default function handleTaskInput(
  e: React.KeyboardEvent<HTMLDivElement>,
  taskRef: RefObject<HTMLDivElement>,
  projectId: string
): void {
  if (!taskRef.current) return;

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
    const currentElement = e.target as HTMLElement;
    const div = currentElement.parentNode?.nextSibling?.lastChild as HTMLDivElement | undefined;
    if (div) setFocusCursorOnEnd(div);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const currentElement = e.target as HTMLElement;
    const div = currentElement.parentNode?.previousSibling?.lastChild as HTMLDivElement | undefined;
    if (div) setFocusCursorOnEnd(div);
  }
}

export const setFocusCursorOnEnd = (div: HTMLDivElement): void => {
  div.focus();
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(div);
  range.collapse(false);
  sel?.removeAllRanges();
  sel?.addRange(range);
};
