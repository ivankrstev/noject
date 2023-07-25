import db from "../../db/index.js";

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const [rows] = await db.execute(`SELECT u_id FROM users WHERE u_id LIKE CONCAT(? , "%")`, [q]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const addCollaborator = async (req, res) => {
  try {
    const { userToAdd, p_id } = req.body;
    await db.execute("INSERT INTO project_collaborators (p_id, u_id) VALUES (?, ?)", [
      p_id,
      userToAdd,
    ]);
    return res.status(201).send({ p_id, addedUser: userToAdd });
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2")
      return res.status(404).json({ error: "Collaborator not found" });
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Collaborator already exists" });
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
