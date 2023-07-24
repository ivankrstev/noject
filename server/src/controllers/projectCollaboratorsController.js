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
