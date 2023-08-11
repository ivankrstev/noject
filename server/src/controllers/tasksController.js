import db from "../../db/index.js";
import socketStore from "../sockets/connectedUsers.js";
import orderTasks from "../utils/orderTasks.js";

export const getAllTasks = async (req, res) => {
  try {
    let { p_id } = req.params;
    const [rows] = await db.execute("SELECT * FROM tasks WHERE p_id = ?", [p_id]);
    const [[{ first_task }]] = await db.execute("SELECT first_task FROM projects WHERE p_id = ?", [
      p_id,
    ]);
    // Check if there are tasks, but no first_task pointer. Should not happen
    if (!first_task && rows.length !== 0)
      return res.status(500).json({ error: "Oops! Something went wrong" });
    if (!first_task) return res.status(200).json([]);
    const tasks = orderTasks(rows, first_task);
    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const updateTaskValue = async (req, res) => {
  try {
    const { p_id, t_id } = req.params;
    const { value } = req.body;
    if (!p_id || p_id === "") return res.status(400).json({ error: "value is missing" });
    await db.execute("UPDATE tasks SET value = ? WHERE p_id = ? AND t_id = ?", [value, p_id, t_id]);
    req.app
      .get("io")
      .to("p-" + p_id)
      .except(socketStore.getSocketIds(req.user)) // Except all socket ids that belong to the user who updated the task
      .emit("tasks:value-changed", { t_id, value });
    return res.status(200).json({ message: "Task value updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const updateTasksLevels = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
