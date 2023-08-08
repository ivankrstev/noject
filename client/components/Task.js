import styles from "@/styles/Task.module.css";
import handleTaskInput from "@/utils/taskKeyEventsHandler";
import { useRef, useEffect, useState } from "react";
import tasksProgressHandler, { getAllSubTasks } from "@/utils/tasksProgressHandler";

const updateTask = (value) => console.log("Updating task with: ", value);

const handleCheckBoxChange = (event) => {
  // Set the percentages for this task if the checkbox is changed
  event.target.previousSibling.innerText = event.target.checked ? "100%" : "0%";
  // Handle in/completion of all subtasks (children, grandchildren, great grandchildren, ...)
  const allSubTasks = getAllSubTasks(event.target.parentNode);
  allSubTasks.forEach((el) => {
    el.childNodes[0].innerText = event.target.checked ? "100%" : "0%";
    el.childNodes[1].checked = event.target.checked;
  });
  tasksProgressHandler();
};

export default function Task({ value, levelProp, completed }) {
  const taskRef = useRef(null);
  const [taskText, setTaskText] = useState(value);
  const [level, setLevel] = useState(levelProp);

  useEffect(() => {
    if (taskText !== "" && taskText !== value) {
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
      level={level}
      style={{ marginLeft: (level * 1.1).toFixed(1) + "em" }}
      className={styles.task}>
      <span className={[styles.taskPercentages, "no-select"].join(" ")} title='Task progress'>
        {completed ? "100%" : "0%"}
      </span>
      <input
        onChange={(e) => handleCheckBoxChange(e)}
        defaultChecked={completed}
        title='Complete task'
        type='checkbox'
        className={styles.taskCheckbox}
      />
      <button className={styles.taskSettingsButton} title='Task Settings'></button>
      <div
        title='Task text'
        className={styles.taskText}
        onKeyDown={(e) => handleTaskInput(e, taskRef, setTaskText, setLevel)}
        suppressContentEditableWarning={true}
        contentEditable={true}>
        {value}
      </div>
    </div>
  );
}
