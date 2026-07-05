import styles from "@/styles/Task.module.css";
import { AuthReloginError } from "@/types";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import handleCheckBoxChange from "@/utils/tasks/handleCheckBoxChange";
import handleTaskInput from "@/utils/tasks/taskKeyEventsHandler";
import tasksSocket from "@/utils/tasksSignalRHub";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface TaskProps {
  taskId: number;
  valueProp: string;
  levelProp: number;
  completed: boolean;
  projectId: string;
}

interface OldProps {
  valueProp: string;
}

const Task = forwardRef<HTMLDivElement, TaskProps>(function Task(
  { taskId, valueProp, levelProp, completed, projectId },
  ref
) {
  const router = useRouter();
  const taskRef = useRef<HTMLDivElement>(null);
  const [oldProps, setOldProps] = useState<OldProps>({ valueProp });
  const [value, setValue] = useState<string>(valueProp);

  const updateTaskValue = useCallback(async (): Promise<void> => {
    try {
      await tasksSocket.invoke("ChangeValue", projectId, taskId, value);
      setOldProps({ ...oldProps, valueProp: value });
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError, router, "Error updating task");
    }
  }, [projectId, taskId, value, oldProps, router]);

  useEffect(() => {
    if (value && value !== oldProps.valueProp && value.replace(/\s+/g, "") !== "") {
      const debounceTaskValue = setTimeout(() => updateTaskValue(), 1000);
      return () => clearTimeout(debounceTaskValue);
    }
  }, [value, oldProps.valueProp, updateTaskValue]);

  useEffect(() => {
    if (taskRef.current) {
      const childDiv = taskRef.current.querySelector("div");
      if (childDiv) {
        childDiv.innerHTML = valueProp;
      }
    }
  }, [valueProp]);

  return (
    <div
      id={taskId.toString()}
      ref={taskRef}
      data-level={levelProp}
      style={{ marginLeft: (levelProp * 1.1).toFixed(1) + "em" }}
      className={styles.task}>
      <span className={[styles.taskPercentages, "no-select"].join(" ")} title='Task progress'>
        {completed ? "100%" : "0%"}
      </span>
      <input
        onChange={(e) => handleCheckBoxChange(e, projectId)}
        checked={completed}
        title='Complete task'
        type='checkbox'
        className={styles.taskCheckbox}
      />
      <div
        title='Task text'
        ref={ref}
        tabIndex={0}
        className={styles.taskText}
        onInput={(e: React.FormEvent<HTMLDivElement>) => {
          const target = e.target as HTMLDivElement;
          setValue(target.innerHTML);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) =>
          handleTaskInput(e, taskRef as RefObject<HTMLDivElement>, projectId)
        }
        suppressContentEditableWarning={true}
        contentEditable={true}
        style={{ minWidth: valueProp === "" ? "1em" : "unset" }}
      />
    </div>
  );
});

export default Task;
