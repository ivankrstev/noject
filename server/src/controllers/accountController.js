import db from "../../db/index.js";

export const getUserData = async (req, res) => {
  try {
    const user = req.user;
    const [rows] = await db.execute(
      "SELECT u_id,first_name,last_name,tfa_activated,profile_picture,verified_email FROM users WHERE u_id = ?",
      [user]
    );
    if (rows.length === 0) return res.status(500).json({ error: "Oops! Something went wrong" });
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const uploadPicture = async (req, res) => {
  try {
    const user = req.user;
    await db.execute("UPDATE users SET profile_picture = ? WHERE u_id = ?", [
      req.files.profile_picture.data,
      user,
    ]);
    const [rows] = await db.execute("SELECT profile_picture FROM users WHERE u_id = ?", [user]);
    if (rows.length === 0) return res.status(500).json({ error: "Oops! Something went wrong" });
    return res.send(rows[0].profile_picture);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const getPicture = async (req, res) => {
  try {
    const user = req.user;
    const [rows] = await db.execute("SELECT profile_picture FROM users WHERE u_id = ?", [user]);
    if (rows.length === 0) return res.status(500).json({ error: "Oops! Something went wrong" });
    return res.send(rows[0].profile_picture);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
