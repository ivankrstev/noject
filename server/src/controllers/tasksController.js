import db from "../../db/index.js";
import socketStore from "../sockets/connectedUsers.js";
import orderTasks from "../utils/orderTasks.js";
import getAllSubTasksRecursive from "../utils/getAllSubTasksRecursive.js";

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
    const { t_id } = req.params;
    const { value } = req.body;
    if (!value || value === "") return res.status(400).json({ error: "value is missing" });
    await db.execute("UPDATE tasks SET value = ? WHERE t_id = ?", [value, t_id]);
    req.app
      .get("io")
      .to("p-" + req.p_id)
      .except(socketStore.getSocketIds(req.user)) // Except all socket ids that belong to the user who updated the task
      .emit("tasks:value-changed", { t_id, value });
    return res.status(200).json({ message: "Task value updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const createTask = async (req, res) => {
  const dbConn = await db.getConnection();
  try {
    const { p_id } = req.params;
    const prev = parseInt(req.body.prev);
    await dbConn.beginTransaction();
    const [[{ first_task }]] = await dbConn.execute(
      "SELECT first_task FROM projects WHERE p_id = ?",
      [p_id]
    );
    if (!first_task) {
      // If !first_task, it means that the project has no tasks
      const [{ insertId }] = await dbConn.execute(
        "INSERT INTO tasks (value, created_by, p_id) VALUES (?, ?, ?)",
        ["", req.user, p_id]
      );
      await dbConn.execute("UPDATE projects SET first_task = ? WHERE p_id = ?", [insertId, p_id]);
      await dbConn.commit();
      const [rows] = await dbConn.execute("SELECT * FROM tasks WHERE t_id = ?", [insertId]);
      if (rows.length === 0) return res.status(500).json({ error: "Oops! Something went wrong" });
      return res.status(201).json(rows[0]);
    }
    if (!prev) return res.status(400).json({ error: "prev is missing or invalid" });
    const [[{ valid_task }]] = await dbConn.execute(
      "SELECT EXISTS(SELECT t_id FROM TASKS WHERE p_id = ? AND t_id = ?) as valid_task",
      [p_id, prev]
    ); // Check if the target previous task is in the same project as the provided p_id
    if (!valid_task) return res.status(400).json({ error: "The provided value is invalid" });
    const [[{ t_id_of_prev_task, next_of_prev_task, level_of_prev_task }]] = await dbConn.execute(
      "SELECT t_id as t_id_of_prev_task, next as next_of_prev_task, level as level_of_prev_task FROM tasks WHERE t_id = ?",
      [prev]
    ); // Get the next pointer and level of the previous task
    const [{ insertId }] = await dbConn.execute(
      "INSERT INTO tasks (next, value, level, created_by, p_id) VALUES (?, ?, ?, ?, ?)",
      [next_of_prev_task, "", level_of_prev_task, req.user, p_id]
    ); // Create task with level same as the previous task
    await dbConn.execute("UPDATE tasks SET next = ? WHERE t_id = ?", [insertId, t_id_of_prev_task]); // Update the task(next) that points to the created task
    await dbConn.commit(); // Commit transaction
    const [rows] = await dbConn.execute("SELECT * FROM tasks WHERE t_id = ?", [insertId]);
    if (rows.length === 0) return res.status(500).json({ error: "Oops! Something went wrong" });
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    await dbConn.rollback();
    return res.status(500).json({ error: "Oops! Something went wrong" });
  } finally {
    dbConn.release();
  }
};

export const deleteTask = async (req, res) => {
  const dbConn = await db.getConnection();
  try {
    const { t_id } = req.params;
    await dbConn.beginTransaction();
    await dbConn.execute(
      "UPDATE projects SET first_task = (SELECT next FROM tasks WHERE t_id = ?) WHERE p_id = ? AND first_task = ?",
      [t_id, req.p_id, t_id]
    );
    await dbConn.execute(
      "UPDATE tasks AS t1 JOIN (SELECT next FROM tasks WHERE t_id = ?) AS t2 SET t1.next = t2.next WHERE t1.next = ?;",
      [t_id, t_id]
    );
    await dbConn.execute("DELETE FROM tasks WHERE t_id = ?", [t_id]);
    dbConn.commit();
    res.status(200).json({ message: "Task was deleted" });
  } catch (error) {
    console.error(error);
    await dbConn.rollback();
    return res.status(500).json({ error: "Oops! Something went wrong" });
  } finally {
    dbConn.release();
  }
};

export const decreaseLevelOfTasks = async (req, res) => {
  const dbConn = await db.getConnection();
  try {
    const { t_id } = req.params;
    await dbConn.beginTransaction();
    const [[{ targetNext, targetLevel }]] = await dbConn.execute(
      "SELECT level as targetLevel, next as targetNext FROM tasks WHERE t_id = ?",
      [t_id]
    );
    if (targetLevel === 0)
      return res.status(400).json({ error: "Task is already on minimum level" }); // Don't allow decreasing below 0
    const [tasks] = await dbConn.execute("SELECT t_id, level, next FROM TASKS WHERE p_id = ?", [
      req.p_id,
    ]);
    // Update the target task with level = level - 1
    await dbConn.execute("UPDATE tasks SET level = level - 1 WHERE t_id = ?", [t_id]);
    // Get the subtasks and update their levels with level - 1
    const subtasks = getAllSubTasksRecursive(targetNext, targetLevel, tasks);
    subtasks.forEach(async (subtask) => {
      await dbConn.execute("UPDATE tasks SET level = level - 1 WHERE t_id = ?", [subtask.t_id]);
    });
    await dbConn.commit();
    return res.status(200).send({ message: "Task level decreased" });
  } catch (error) {
    await dbConn.rollback();
    return res.status(500).json({ error: "Oops! Something went wrong" });
  } finally {
    dbConn.release();
  }
};

export const increaseLevelOfTasks = async (req, res) => {
  const dbConn = await db.getConnection();
  try {
    const { t_id } = req.params;
    await dbConn.beginTransaction();
    const [[{ targetLevel, prevTaskLevel }]] = await dbConn.execute(
      "SELECT level as targetLevel, (SELECT level FROM tasks WHERE next = ?) as prevTaskLevel FROM tasks WHERE t_id = ?",
      [t_id, t_id]
    );
    if (prevTaskLevel === null || targetLevel > prevTaskLevel)
      return res.status(400).json({ error: "Task is already on maximum level" }); // Don't allow increasing
    // Update the target task with level = level + 1
    await dbConn.execute("UPDATE tasks SET level = level + 1 WHERE t_id = ?", [t_id]);
    await dbConn.commit();
    return res.status(200).send({ message: "Task level decreased" });
  } catch (error) {
    console.error(error);
    await dbConn.rollback();
    return res.status(500).json({ error: "Oops! Something went wrong" });
  } finally {
    dbConn.release();
  }
};
