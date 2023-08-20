import styles from "@/styles/Task.module.css";
import handleTaskInput from "@/utils/tasks/taskKeyEventsHandler";
import handleCheckBoxChange from "@/utils/tasks/handleCheckBoxChange";
import { useRef, useEffect, useState } from "react";
import api from "@/utils/api";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import { useRouter } from "next/router";

export default function Task({ t_id, valueProp, levelProp, completed }) {
  const router = useRouter();
  const taskRef = useRef(null);
  const [oldProps, setOldProps] = useState({ valueProp });
  const [value, setValue] = useState(valueProp);

  useEffect(() => {
    if (value && value !== oldProps.valueProp && value.replace(/\s+/g, "") !== "") {
      const debounceTaskValue = setTimeout(() => updateTaskValue(), 1000);
      return () => clearTimeout(debounceTaskValue);
    }
  }, [value]);

  const updateTaskValue = async () => {
    try {
      const response = await api.put(`/tasks/${t_id}/value`, { value });
      console.log(response);
      setOldProps({ ...oldProps, valueProp: value });
    } catch (error) {
      AxiosErrorHandler(error, router, "Error updating task");
    }
  };

  return (
    <div
      id={t_id}
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
        contentEditable={true}
        style={{ minWidth: valueProp === "" ? "20vw" : "unset" }}>
        {valueProp}
      </div>
    </div>
  );
}
