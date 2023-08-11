// Function to order tasks based on prev_id, next_id and to convert them from array to object
export default function orderTasks(tasksArray, first_task) {
  if (tasksArray.length === 0) return [];
  if (tasksArray.length === 1) return tasksArray;
  let current_next = null;
  let orderedArray = [];
  for (let i = 0; i < tasksArray.length; i++) {
    const { t_id, next } = tasksArray[i];
    const taskNode = tasksArray[i];
    delete taskNode.p_id;
    if (orderedArray.length === 0 && t_id === first_task) {
      orderedArray.push(taskNode);
      current_next = next;
      i = -1;
    } else if (current_next === t_id) {
      orderedArray.push(taskNode);
      current_next = next; // Set the pointer for the next element to be searched and added to the array
      i = -1;
      if (next === null) break;
    }
  }
  return orderedArray;
}
