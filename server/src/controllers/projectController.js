import db from "../../db/index.js";
import checkBgContrast from "../../utils/checkBgContrast.js";
import generateColor from "../../utils/generateColor.js";

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
