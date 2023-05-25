import styles from "@/styles/Task.module.css";
import handleTaskInput from "@/utils/taskKeyEventsHandler";
import { useRef, useEffect, useState } from "react";
import tasksProgressHandler, { getAllSubTasks } from "@/utils/tasksProgressHandler";

const updateTask = (text) => console.log("Updating task with: ", text);

export default function Task({ text, levelProp, completed }) {
  const taskRef = useRef(null);
  const [level, setLevel] = useState(levelProp);
  const [taskText, setTaskText] = useState(text);

  useEffect(() => {
    taskRef.current.childNodes[0].innerText = completed ? "100%" : "0%";
  }, []);

  useEffect(() => {
    const taskElement = taskRef.current;
    const startLevel = parseInt(taskElement.nextSibling?.getAttribute("level"));
    // Handle decreasing of multiple tasks
    if (startLevel > level + 1 && parseInt(taskElement.getAttribute("level")) > level) {
      let temp = taskElement.nextSibling;
      while (temp && parseInt(temp.getAttribute("level")) >= startLevel) {
        const tempLevel = parseInt(temp.getAttribute("level"));
        temp.setAttribute("level", tempLevel - 1);
        temp.style.marginLeft = ((tempLevel - 1) * 1.1).toFixed(1) + "em";
        temp.childNodes[0].innerText = temp.childNodes[1].checked ? "100%" : "0%";
        temp = temp.nextSibling;
      }
    }
    taskElement.setAttribute("level", level);
    tasksProgressHandler();
  }, [level]);

  useEffect(() => {
    if (taskText !== "" && taskText !== text) {
      console.log("Changed taskText");
      const sendData = setTimeout(() => {
        updateTask(taskText);
      }, 1000);
      return () => clearTimeout(sendData);
    }
  }, [taskText]);

  return (
    <div
      ref={taskRef}
      style={{ marginLeft: (level * 1.2).toFixed(1) + "em" }}
      className={styles.task}>
      <span className={styles.taskPercentages} title='Task progress'>
        {completed ? "100%" : "0%"}
      </span>
      <input
        onChange={(e) => {
          // Set the percentages for this task if the checkbox is changed
          e.target.previousSibling.innerText = e.target.checked ? "100%" : "0%";
          // Handle in/completion of all subtasks (children, grandchildren, great grandchildren, ...)
          const allSubTasks = getAllSubTasks(e.target.parentNode);
          allSubTasks.forEach((el) => {
            el.childNodes[0].innerText = e.target.checked ? "100%" : "0%";
            el.childNodes[1].checked = e.target.checked;
          });
          tasksProgressHandler();
        }}
        defaultChecked={completed}
        title='Complete task'
        type='checkbox'
        className={styles.taskCheckbox}
      />
      <button className={styles.taskSettingsButton} title='Task Settings'></button>
      <div
        title='Task text'
        className={styles.taskText}
        onKeyDown={(e) => handleTaskInput(e, setLevel, setTaskText)}
        type='text'
        suppressContentEditableWarning={true}
        contentEditable={true}>
        {text}
      </div>
    </div>
  );
}
