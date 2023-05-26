import db from "../../db/index.js";
import changePasswordSchema from "../schemas/changePasswordSchema.js";
import Joi from "joi";
import bcrypt from "bcrypt";
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

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

export const changePassword = async (req, res) => {
  try {
    const value = await changePasswordSchema.validateAsync(req.body);
    const user = req.user;
    const [rows] = await db.execute("SELECT password FROM users WHERE u_id = ?", [user]);
    const hashedOldPassword = rows[0];
    const passwordMatches = await bcrypt.compare(value.currentPassword, hashedOldPassword.password);
    if (!passwordMatches) return res.status(401).json({ error: "Invalid password" });
    if (value.currentPassword === value.newPassword)
      return res.status(400).json({ error: "You can't use an old password" });
    const hashedNewPassword = await bcrypt.hash(value.newPassword, 10);
    await db.execute("UPDATE users SET password = ? WHERE u_id = ?", [hashedNewPassword, user]);
    return res.status(200).json({ message: "Password Successfully Changed" });
  } catch (error) {
    console.error(error);
    if (error instanceof Joi.ValidationError)
      return res
        .status(400)
        .json({ error: capitalizeFirstLetter(error.details[0].message.replaceAll(`"`, ``)) });
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
