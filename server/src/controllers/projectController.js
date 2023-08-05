import db from "../../db/index.js";
import checkBgContrast from "../utils/checkBgContrast.js";
import generateColor from "../utils/generateColor.js";
import { v4 } from "uuid";

export const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;
    if (!name || name === "") return res.status(400).json({ error: "Project name is missing" });
    const bgColor = generateColor();
    const color = checkBgContrast(bgColor);
    await db.execute(
      "INSERT INTO projects (name,created_by,color,background_color) VALUES (?,?,?,?)",
      [name, user, color, bgColor]
    );
    const [rows] = await db.execute("SELECT * FROM projects WHERE p_id = LAST_INSERT_ID()");
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const getProjects = async (req, res) => {
  try {
    const user = req.user;
    const { order_by_type } = req.query;
    // Default ordering by name a-z if not specified
    let sqlString = "SELECT * FROM Projects WHERE created_by = ? ORDER BY name ASC";
    if (order_by_type === "name_z-a")
      sqlString = "SELECT * FROM Projects WHERE created_by = ? ORDER BY name DESC";
    else if (order_by_type === "creation_date_asc")
      sqlString = "SELECT * FROM Projects WHERE created_by = ? ORDER BY creation_date ASC";
    else if (order_by_type === "creation_date_desc")
      sqlString = "SELECT * FROM Projects WHERE created_by = ? ORDER BY creation_date DESC";
    const [rows] = await db.execute(sqlString, [user]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const getOneProject = async (req, res) => {
  try {
    const user = req.user;
    const { p_id } = req.params;
    if (!p_id || p_id === "") return res.status(400).json({ error: "Project id is missing" });
    const [rows] = await db.execute(
      "SELECT p_id, creation_date, name, public_link FROM projects WHERE p_id = ? AND created_by = ?",
      [p_id, user]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Project not found" });
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name === "") return res.status(400).json({ error: "Project name is missing" });
    const [updated] = await db.execute("UPDATE projects SET name = ? WHERE p_id = ?", [
      name,
      req.p_id,
    ]);
    if (updated.affectedRows === 0)
      return res.status(500).json({ error: "Oops! Something went wrong" });
    const [rows] = await db.execute("SELECT name FROM projects WHERE p_id = ?", [req.p_id]);
    if (rows.length === 0) return res.status(500).json({ error: "Oops! Something went wrong" });
    return res.status(200).json({ name: rows[0].name });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const [rows] = await db.execute("DELETE FROM projects WHERE p_id = ?", [req.p_id]);
    if (rows.affectedRows === 0)
      return res.status(500).json({ error: "Oops! Something went wrong" });
    res.status(200).json({ message: "Project was deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const getSharedProjects = async (req, res) => {
  try {
    const user = req.user;
    const [rows] = await db.execute(
      "SELECT P.p_id, P.name, P.color, P.background_color FROM projects P INNER JOIN project_collaborators PC ON PC.p_id = P.p_id AND PC.u_id = ?",
      [user]
    );
    res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const turnOnProjectSharing = async (req, res) => {
  try {
    const { p_id } = req.params;
    const public_link = v4();
    await db.execute("UPDATE projects SET public_link = ? WHERE p_id = ?", [public_link, p_id]);
    return res.status(200).json({ public_link });
  } catch (error) {
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const turnOffProjectSharing = async (req, res) => {
  try {
    const { p_id } = req.params;
    await db.execute("UPDATE projects SET public_link = null WHERE p_id = ?", [p_id]);
    return res.status(200).json({ message: "Sharing is off" });
  } catch (error) {
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
