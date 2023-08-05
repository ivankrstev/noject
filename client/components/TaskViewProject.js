import styles from "@/styles/Task.module.css";

export default function TaskViewProject({ value, completed, level }) {
  return (
    <div
      level={level}
      className={styles.task}
      style={{ marginLeft: (level * 1.1).toFixed(1) + "em" }}>
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
