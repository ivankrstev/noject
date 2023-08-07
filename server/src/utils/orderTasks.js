// Function to order tasks based on prev_id, next_id and to convert them from array to object
export default function orderTasks(tasksArray) {
  let counter = 0;
  if (tasksArray.length === 1) return [...tasksArray[0]];
  let current_next = null;
  let temp = [];
  for (let i = 0; i < tasksArray.length; i++) {
    counter++;
    const { t_id, next, prev } = tasksArray[i];
    const taskNode = {
      ...tasksArray[i],
    };
    // delete taskNode.prev;
    if (!prev && temp.length === 0) {
      temp.push(taskNode);
      current_next = next;
      i = -1;
    } else if (current_next === t_id) {
      temp.push(taskNode);
      current_next = next; // Set the pointer for the next element to be searched and added to the array
      i = -1;
      if (next === null) break;
    }
  }
  return temp;
}
