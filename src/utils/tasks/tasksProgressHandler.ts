export const getAllSubTasks = (node: HTMLElement | null): HTMLElement[] => {
  // Get all subtasks (children, grandchildren, great grandchildren, ...)
  if (!node) return [];

  const levelNode = parseInt(node.getAttribute("data-level") || "0");
  let temp = node.nextElementSibling as HTMLElement | null;
  const subTasks: HTMLElement[] = [];

  while (temp && parseInt(temp.getAttribute("data-level") || "0") > levelNode) {
    subTasks.push(temp);
    temp = temp.nextElementSibling as HTMLElement | null;
  }

  return subTasks;
};

const getChildTasks = (node: HTMLElement | null): HTMLElement[] => {
  // Get only the child tasks of a task (not their grandchildren,great grandchildren, ...)
  if (!node) return [];

  const childsLevel = parseInt(node.getAttribute("data-level") || "0") + 1;
  let temp = node.nextElementSibling as HTMLElement | null;
  const childs: HTMLElement[] = [];

  while (temp && parseInt(temp.getAttribute("data-level") || "0") >= childsLevel) {
    if (parseInt(temp.getAttribute("data-level") || "0") === childsLevel) childs.push(temp);
    temp = temp.nextElementSibling as HTMLElement | null;
  }

  return childs;
};

const getParentTask = (node: HTMLElement): HTMLElement | null => {
  // Get the task that is a parent to the node element (not the parentElement)
  const currLevel = parseInt(node.getAttribute("data-level") || "0");
  let current = node;

  while (current.previousElementSibling) {
    const prevElement = current.previousElementSibling as HTMLElement;
    if (parseInt(prevElement.getAttribute("data-level") || "0") < currLevel) return prevElement;
    current = prevElement;
  }

  return null;
};

// Calculate progress only for a main task
const calculateMainTask = (mainTask: HTMLElement): void => {
  const allSubTasks = getAllSubTasks(mainTask);
  // Find the maximum level of the siblings of the mainTask
  let maximumLevel = 0;

  allSubTasks.forEach((subtask) => {
    const level = parseInt(subtask.getAttribute("data-level") || "0");
    if (level > maximumLevel) maximumLevel = level;
  });

  let currentLevel = maximumLevel;
  // Start traversing the subtasks according to their levels (from maximum to minimum level)
  while (currentLevel >= 0) {
    allSubTasks.forEach((subtask) => {
      // If the current subtask level is matching the target currentLevel
      if (parseInt(subtask.getAttribute("data-level") || "0") === currentLevel) {
        const parentTask = getParentTask(subtask);
        if (!parentTask) return;

        const parentTaskChilds = getChildTasks(parentTask);
        let completeParent = true;
        let parentPercentages = 0;

        // Loop through the siblings of the subtask (childs of the parent task of the subtask)
        for (let i = 0; i < parentTaskChilds.length; i++) {
          const checkbox = parentTaskChilds[i].childNodes[1] as HTMLInputElement;
          if (checkbox && !checkbox.checked) {
            completeParent = false;
          }
          // Get the progress from the childs of the parent task and sum them up
          const progressElement = parentTaskChilds[i].childNodes[0] as HTMLElement;
          if (progressElement) {
            parentPercentages += parseFloat(progressElement.innerText || "0");
          }
        }

        // If a task has only one child, then its progress value can be either 100 or 0
        if (parentTaskChilds.length === 1 && parentPercentages !== 100) parentPercentages = 0;

        const parentCheckbox = parentTask.childNodes[1] as HTMLInputElement;
        if (parentCheckbox) {
          parentCheckbox.checked = completeParent;
        }

        // Assign the progress to the parent task of the subtask
        const parentProgress = parentTask.childNodes[0] as HTMLElement;
        if (parentProgress) {
          parentProgress.innerText =
            parseFloat((parentPercentages / parentTaskChilds.length).toFixed(2)) + "%";
        }
      }
    });
    currentLevel--;
  }
};

// Function to assign progress to all the main tasks (of level 0) and calculate the whole project progress
export default function calculateProject(): void {
  const taskContainer = document.querySelector("#projectTasksWrapperDiv");
  if (!taskContainer) return;

  let tasks = Array.from(taskContainer.querySelectorAll<HTMLElement>("> div")) || [];
  tasks = tasks.filter((task) => parseInt(task.getAttribute("data-level") || "0") === 0);

  // For each main task run calculateMainTask
  tasks.forEach((task) => calculateMainTask(task));

  // Calculate the whole project progress
  let projectProgress = 0;
  tasks.forEach((task) => {
    const progressElement = task.childNodes[0] as HTMLElement;
    if (progressElement) {
      projectProgress += parseFloat(progressElement.innerText || "0");
    }
  });

  // Assign the whole project progress to the span
  const projectProgressSpan = document.querySelector("#projectProgressSpan");
  if (projectProgressSpan && tasks.length > 0) {
    projectProgressSpan.textContent = parseFloat((projectProgress / tasks.length).toFixed(2)) + "%";
  }
}
