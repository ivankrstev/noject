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

const calculateMainTask = (mainTask) => {
  let allSubTasks = [];
  let nextSibling = mainTask.nextSibling;
  // Find all subtasks (children, grandchildren, great grandchildren, ...) of the main task
  while (nextSibling && parseInt(nextSibling.getAttribute("level")) > 0) {
    allSubTasks.push(nextSibling);
    nextSibling = nextSibling.nextSibling;
  }
  if (allSubTasks.length === 0)
    mainTask.childNodes[0].innerText = mainTask.childNodes[1].checked ? "100%" : "0%";
  // Find the highest level
  let maximumLevel = 0;
  allSubTasks.forEach((subtask) => {
    if (parseInt(subtask.getAttribute("level")) > maximumLevel)
      maximumLevel = parseInt(subtask.getAttribute("level"));
  });
  let currentLevel = maximumLevel;
  while (currentLevel >= 0) {
    allSubTasks.forEach((subtask) => {
      if (parseInt(subtask.getAttribute("level")) === currentLevel) {
        if (currentLevel === maximumLevel)
          subtask.childNodes[0].innerText = subtask.childNodes[1].checked ? "100%" : "0%";
        const parentTask = getParentTask(subtask);
        const parentTaskChilds = getChildTasks(parentTask);
        let completeParent = true;
        let parentPercentages = 0;
        for (let i = 0; i < parentTaskChilds.length; i++) {
          !parentTaskChilds[i].childNodes[1].checked && (completeParent = false);
          parentPercentages += parseFloat(parentTaskChilds[i].childNodes[0].innerText);
        }
        if (parentTaskChilds.length === 1 && parentPercentages !== 100) parentPercentages = 0;
        if (parentTask) {
          parentTask.childNodes[1].checked = completeParent;
          parentTask.childNodes[0].innerText =
            parseFloat((parentPercentages / parentTaskChilds.length).toFixed(2)) + "%";
        }
      }
    });
    currentLevel--;
  }
};

export default function calculateProject() {
  // Assign progress to all the main tasks
  let tasks = Array.from(document.querySelectorAll("#projectTasksWrapperDiv > div"));
  tasks = tasks.filter((task) => parseInt(task.getAttribute("level")) === 0);
  tasks.forEach((task) => calculateMainTask(task));
  // Calculate the project progress
  let percentages = 0;
  tasks.forEach((task) => (percentages += parseFloat(task.childNodes[0].innerText)));
  const projectProgressSpan = document.querySelector("#projectProgressSpan");
  projectProgressSpan.innerText = parseFloat((percentages / tasks.length).toFixed(2)) + "%";
}
