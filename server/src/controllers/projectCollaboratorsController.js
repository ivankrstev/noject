import db from "../../db/index.js";

export const searchUsers = async (req, res) => {
  try {
    const { p_id } = req.params;
    const user = req.user;
    const { q } = req.query;
    if (!q || q === "") return res.status(400).json({ error: "Query(q) is missing" });
    const [rows] = await db.execute(
      "SELECT U.u_id FROM users U LEFT JOIN project_collaborators PC ON U.u_id = PC.u_id AND PC.p_id = ? WHERE PC.u_id IS NULL AND U.u_id != ? AND U.u_id LIKE CONCAT(?, '%')",
      [p_id, user, q]
    );
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const addCollaborator = async (req, res) => {
  try {
    const { userToAdd, p_id } = req.body;
    if (!userToAdd || userToAdd === "")
      return res.status(400).json({ error: "User Id(userToAdd) is missing" });
    await db.execute("INSERT INTO project_collaborators (p_id, u_id) VALUES (?, ?)", [
      p_id,
      userToAdd,
    ]);
    return res.status(201).send({ u_id: userToAdd });
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2")
      return res.status(404).json({ error: "Collaborator not found" });
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Collaborator already exists" });
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const getCollaborators = async (req, res) => {
  try {
    const { p_id } = req.params;
    const [rows] = await db.execute("SELECT u_id FROM project_collaborators WHERE p_id = ?", [
      p_id,
    ]);
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const removeCollaborator = async (req, res) => {
  try {
    const { p_id } = req.params;
    const { u_id } = req.query;
    if (!u_id || u_id === "") return res.status(400).json({ error: "User Id(u_id) is missing" });
    const rows = await db.execute("DELETE FROM project_collaborators WHERE p_id = ? AND u_id = ?", [
      p_id,
      u_id,
    ]);
    if (rows[0].affectedRows === 0)
      return res.status(404).json({ error: "Collaborator not found" });
    return res.status(200).json({ u_id });
  } catch (error) {
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
