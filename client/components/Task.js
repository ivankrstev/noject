import styles from "@/styles/Task.module.css";
import handleTaskInput from "@/utils/taskKeyEventsHandler";
import { useRef, useEffect, useState } from "react";
import tasksProgressHandler, { getAllSubTasks } from "@/utils/tasksProgressHandler";
import api from "@/utils/api";
import { toast } from "react-toastify";

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

export default function Task({ t_id, valueProp, levelProp, completed, projectId }) {
  const taskRef = useRef(null);
  const [oldProps, setOldProps] = useState({ valueProp });
  const [value, setValue] = useState(valueProp);

  useEffect(() => {
    if (value && value !== oldProps.valueProp) {
      const debounceTaskValue = setTimeout(() => updateTaskValue(), 1000);
      return () => clearTimeout(debounceTaskValue);
    }
  }, [value]);

  const updateTaskValue = async () => {
    try {
      const response = await api.put(`/tasks/${projectId}-${t_id}/value`, { value });
      console.log(response);
      setOldProps({ ...oldProps, valueProp: value });
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Error updating task");
    }
  };

  return (
    <div
      ref={taskRef}
      level={levelProp}
      style={{ marginLeft: (levelProp * 1.1).toFixed(1) + "em" }}
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
        onInput={(e) => setValue(e.target.innerText)}
        onKeyDown={(e) => handleTaskInput(e, taskRef)}
        suppressContentEditableWarning={true}
        contentEditable={true}>
        {valueProp}
      </div>
    </div>
  );
}
