export default function handleTaskInput(e, setLevel, setTaskText) {
  console.log("======================================================");
  const level = parseInt(e.target.parentNode.getAttribute("level"));
  if (e.shiftKey && e.key === "Tab") {
    e.preventDefault();
    if (e.target.parentNode.getAttribute("level") !== "0") setLevel(level - 1);
    console.log("Decreasing one level");
  } else if (e.key === "Tab") {
    e.preventDefault();
    const prevLevel = parseInt(e.target.parentNode.previousSibling?.getAttribute("level"));
    if (level <= prevLevel) setLevel(level + 1);
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
