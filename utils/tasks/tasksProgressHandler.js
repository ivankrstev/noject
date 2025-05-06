export const getAllSubTasks = (node) => {
  // Get all subtasks (children, grandchildren, great grandchildren, ...)
  const levelNode = parseInt(node?.getAttribute("level"));
  let temp = node?.nextSibling;
  let subTasks = [];
  while (temp && parseInt(temp.getAttribute("level")) > levelNode) {
    subTasks.push(temp);
    temp = temp.nextSibling;
  }
  return subTasks;
};

const getChildTasks = (node) => {
  // Get only the child tasks of a task (not their grandchildren,great grandchildren, ...)
  const childsLevel = parseInt(node?.getAttribute("level")) + 1;
  let temp = node?.nextSibling;
  let childs = [];
  while (temp && parseInt(temp.getAttribute("level")) >= childsLevel) {
    if (parseInt(temp.getAttribute("level")) === childsLevel) childs.push(temp);
    temp = temp.nextSibling;
  }
  return childs;
};

const getParentTask = (node) => {
  // Get the task that is a parent to the node element (not the parentElement)
  const currLevel = parseInt(node.getAttribute("level"));
  while (node.previousSibling) {
    if (parseInt(node.previousSibling.getAttribute("level")) < currLevel)
      return node.previousSibling;
    node = node.previousSibling;
  }
  return null;
};

// Calculate progress only for a main task
const calculateMainTask = (mainTask) => {
  let allSubTasks = getAllSubTasks(mainTask);
  // Find the maximum level of the siblings of the mainTask
  let maximumLevel = 0;
  allSubTasks.forEach((subtask) => {
    if (parseInt(subtask.getAttribute("level")) > maximumLevel)
      maximumLevel = parseInt(subtask.getAttribute("level"));
  });
  let currentLevel = maximumLevel;
  // Start traversing the subtasks according to their levels (from maximum to minimum level)
  while (currentLevel >= 0) {
    allSubTasks.forEach((subtask) => {
      // If the current subtask level is matching the target currentLevel
      if (parseInt(subtask.getAttribute("level")) === currentLevel) {
        const parentTask = getParentTask(subtask);
        const parentTaskChilds = getChildTasks(parentTask);
        let completeParent = true;
        let parentPercentages = 0;
        // Loop through the siblings of the subtask (childs of the parent task of the subtask)
        for (let i = 0; i < parentTaskChilds.length; i++) {
          // If there is an uncompleted child, set completeParent = false
          !parentTaskChilds[i].childNodes[1].checked && (completeParent = false);
          // Get the progress from the childs of the parent task and sum them up
          parentPercentages += parseFloat(parentTaskChilds[i].childNodes[0].innerText);
        }
        // If a task has only one child, then its progress value can be either 100 or 0
        if (parentTaskChilds.length === 1 && parentPercentages !== 100) parentPercentages = 0;
        if (parentTask) {
          parentTask.childNodes[1].checked = completeParent;
          // Assign the progress to the parent task of the subtask
          parentTask.childNodes[0].innerText =
            parseFloat((parentPercentages / parentTaskChilds.length).toFixed(2)) + "%";
        }
      }
    });
    currentLevel--;
  }
};

// Function to assign progress to all the main tasks (of level 0) and calculate the whole project progress
export default function calculateProject() {
  let tasks = Array.from(document.querySelectorAll("#projectTasksWrapperDiv > div")); // Get all the tasks
  tasks = tasks.filter((task) => parseInt(task.getAttribute("level")) === 0); // Filter the main tasks only
  // For each main task run calculateMainTask to calculate the
  // progress for the main task and each of its subtasks
  tasks.forEach((task) => calculateMainTask(task));
  // Calculate the whole project progress
  let projectProgress = 0;
  // Sum the progress from every main task in the variable percentages
  tasks.forEach((task) => (projectProgress += parseFloat(task.childNodes[0].innerText)));
  // Get the span that shows the whole project progress &
  // Assign the whole project progress to the span
  document.querySelector("#projectProgressSpan") &&
    (document.querySelector("#projectProgressSpan").innerText =
      parseFloat((projectProgress / tasks.length).toFixed(2)) + "%");
}
