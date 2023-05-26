export default function handleTaskInput(e, increaseLevel, decreaseLevel, setTaskText) {
  console.log("======================================================");
  if (e.shiftKey && e.key === "Tab") {
    e.preventDefault();
    if (e.target.parentNode.getAttribute("level") !== "0") decreaseLevel();
  } else if (e.key === "Tab") {
    e.preventDefault();
    increaseLevel();
  } else if (e.key === "Enter") {
    e.preventDefault();
    console.log("Enter new task!");
  } else if (e.key === "Delete") {
    console.log("Delete the task");
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    e.target.parentNode.nextSibling?.lastChild.focus({ focusVisible: true });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    e.target.parentNode.previousSibling?.lastChild.focus({ focusVisible: true });
  } else setTaskText(e.target.innerText);
  console.log(e.key);
  console.log(e.target);
}
