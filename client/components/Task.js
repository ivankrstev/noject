import styles from "@/styles/Task.module.css";
import handleTaskInput from "@/utils/taskKeyEventsHandler";
import { useRef, useEffect, useState } from "react";
import tasksProgressHandler, { getAllSubTasks } from "@/utils/tasksProgressHandler";

const updateTask = (text) => console.log("Updating task with: ", text);

export default function Task({ text, levelProp, completed }) {
  const taskRef = useRef(null);
  const [level, setLevel] = useState(levelProp);
  const [taskText, setTaskText] = useState(text);

  const increaseLevel = () => {
    const taskElement = taskRef.current;
    const currentLevel = parseInt(taskElement.getAttribute("level"));
    const prevLevel = parseInt(taskElement.previousSibling?.getAttribute("level"));
    if (currentLevel <= prevLevel) {
      taskElement.setAttribute("level", currentLevel + 1);
      taskElement.style.marginLeft = ((currentLevel + 1) * 1.1).toFixed(1) + "em";
    }
    tasksProgressHandler();
  };

  const decreaseLevel = () => {
    const taskElement = taskRef.current;
    const currentLevel = parseInt(taskElement.getAttribute("level"));
    const startLevel = parseInt(taskElement.nextSibling?.getAttribute("level"));
    if (startLevel > level + 1) {
      let temp = taskElement.nextSibling;
      while (temp && parseInt(temp.getAttribute("level")) >= startLevel) {
        const tempLevel = parseInt(temp.getAttribute("level"));
        temp.setAttribute("level", tempLevel - 1);
        temp.style.marginLeft = ((tempLevel - 1) * 1.1).toFixed(1) + "em";
        temp.childNodes[0].innerText = temp.childNodes[1].checked ? "100%" : "0%";
        temp = temp.nextSibling;
      }
    }
    taskElement.setAttribute("level", currentLevel - 1);
    taskElement.style.marginLeft = ((currentLevel - 1) * 1.1).toFixed(1) + "em";
    tasksProgressHandler();
  };

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
      level={levelProp}
      style={{ marginLeft: (levelProp * 1.1).toFixed(1) + "em" }}
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
        onKeyDown={(e) => handleTaskInput(e, increaseLevel, decreaseLevel, setTaskText)}
        type='text'
        suppressContentEditableWarning={true}
        contentEditable={true}>
        {text}
      </div>
    </div>
  );
}
