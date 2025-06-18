import styles from "@/styles/Task.module.css";

interface TaskViewProjectProps {
  value: string;
  completed: boolean;
  level: number;
}

export default function TaskViewProject({ value, completed, level }: TaskViewProjectProps) {
  return (
    <div
      data-level={level}
      className={styles.task}
      style={{ marginLeft: `${(level * 1.1).toFixed(1)}em` }}>
      <span className={[styles.taskPercentages, "no-select"].join(" ")} title='Task progress'>
        {completed ? "100%" : "0%"}
      </span>
      <input
        checked={completed}
        title='Task completion'
        type='checkbox'
        readOnly
        onChange={(e) => (e.target.checked = false)}
        className={styles.taskCheckbox}
      />
      <div title='Task text' className={styles.taskText}>
        {value}
      </div>
    </div>
  );
}
