export default function getAllSubTasksRecursive(targetNext, targetLevel, tasks) {
  const subtasks = [];
  for (const task of tasks) {
    // Check if the current task is a potential sibling
    if (task.t_id === targetNext && task.level > targetLevel) {
      subtasks.push(task); // Add the sibling to the subtasks array
      subtasks.push(...getAllSubTasksRecursive(task.next, targetLevel, tasks));
      break; // Break the loop if a task with >= level is reached
    }
  }
  return subtasks;
}
