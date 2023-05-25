import db from "../../db/index.js";
import newUserSchema from "../schemas/newUserSchema.js";
import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const registerUser = async (req, res) => {
  try {
    const value = await newUserSchema.validateAsync(req.body);
    const [rows] = await db.execute("SELECT u_id FROM users WHERE u_id = ?", [value.email]);
    if (rows.length !== 0) return res.status(409).json({ error: "Email already in use" });
    const hashedPassword = await bcrypt.hash(value.password, 10);
    const tfa_code = speakeasy.generateSecret().base32;
    const [result] = await db.execute(
      "INSERT INTO USERS (u_id, first_name, last_name, password, tfa_code) VALUES (?,?,?,?,?)",
      [value.email, value.firstName, value.lastName, hashedPassword, tfa_code]
    );
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    if (error instanceof Joi.ValidationError)
      return res
        .status(400)
        .json({ error: capitalizeFirstLetter(error.details[0].message.replaceAll(`"`, ``)) });
    console.log("Error:", error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email = "", password = "" } = req.body;
    const [rows] = await db.execute("SELECT * FROM users WHERE u_id = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(401).json({ error: "Invalid email or password" });
    const tfaToken = jwt.sign(data, process.env.TFA_JWT_SECRET, { expiresIn: "2m" });
    if (user.tfa_activated)
      return res.status(400).json({ error: "TwoFactorAuth needed", tfaToken });
    const data = { userId: user.u_id };
    const refreshToken = jwt.sign(data, process.env.REFRESH_JWT_SECRET, {
      expiresIn: "14d",
    });
    await db.execute("INSERT INTO refresh_tokens (u_id, refresh_token) VALUES (?,?)", [
      user.u_id,
      refreshToken,
    ]);
    const accessToken = jwt.sign(data, process.env.ACCESS_JWT_SECRET, {
      expiresIn: "1m",
    });
    return res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1209600000),
        secure: true,
        sameSite: "strict",
      })
      .json({ accessToken: accessToken });
  } catch (error) {
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const verifyTFA = async (req, res) => {
  try {
    const { tfaToken, userToken } = req.body;
    if (!tfaToken) return res.status(400).json({ error: "tfaToken is missing" });
    if (!userToken) return res.status(400).json({ error: "userToken is missing" });
    const { userId } = jwt.verify(tfaToken, process.env.TFA_JWT_SECRET);
    const u_id = userId;
    const [rows] = await db.execute("SELECT tfa_code FROM users WHERE u_id = ?", [u_id]);
    const tfa_code = rows[0].tfa_code;
    if (!tfa_code) return res.status(400).json({ error: "Oops! Something went wrong" });
    const verified = speakeasy.totp.verify({
      secret: tfa_code,
      encoding: "base32",
      token: userToken,
    });
    if (!verified) return res.status(400).json({ error: "Invalid code entered" });
    const data = { userId };
    const refreshToken = jwt.sign(data, process.env.REFRESH_JWT_SECRET, {
      expiresIn: "14d",
    });
    const accessToken = jwt.sign(data, process.env.ACCESS_JWT_SECRET, {
      expiresIn: "1m",
    });
    await db.execute("INSERT INTO refresh_tokens (u_id, refresh_token) VALUES (?,?)", [
      userId,
      refreshToken,
    ]);
    return res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1209600000),
        secure: true,
        sameSite: "strict",
      })
      .json({ accessToken: accessToken });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      return res.status(401).json({ error: "Invalid token" });
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const enableTFA = async (req, res) => {
  try {
    const { userToken } = req.body;
    if (!userToken) return res.status(400).json({ error: "userToken is missing" });
    const user = req.user;
    const [rows] = db.execute("SELECT tfa_code, tfa_activated FROM users WHERE u_id = ?", [user]);
    const tfaData = rows[0];
    if (!tfaData) return res.status(500).json({ error: "Oops! Something went wrong" });
    if (!parseInt(tfaData.tfa_activated))
      return res.status(400).json({ error: "Two Factor Authentication is already enabled" });
    const verified = speakeasy.totp.verify({
      secret: tfaData.tfa_code,
      encoding: "base32",
      token: userToken,
    });
    if (!verified) return res.status(400).json({ error: "Invalid code entered" });
    await db.execute("UPDATE users SET tfa_activated = 1 WHERE u_id = ?", [user]);
    return res.status(200).json({ message: "Two Factor Authenitication enabled" });
  } catch (error) {}
};

export const disableTFA = async (req, res) => {
  try {
    const { userToken } = req.body;
    if (!userToken) return res.status(400).json({ error: "userToken is missing" });
    const user = req.user;
    const [rows] = db.execute("SELECT tfa_code, tfa_activated FROM users WHERE u_id = ?", [user]);
    const tfaData = rows[0];
    if (!tfaData) return res.status(500).json({ error: "Oops! Something went wrong" });
    if (!parseInt(tfaData.tfa_activated))
      return res.status(400).json({ error: "Two Factor Authentication is already disabled" });
    const verified = speakeasy.totp.verify({
      secret: tfaData.tfa_code,
      encoding: "base32",
      token: userToken,
    });
    if (!verified) return res.status(400).json({ error: "Invalid code entered" });
    await db.execute("UPDATE users SET tfa_activated = 0, tfa_code = NULL WHERE u_id = ?", [user]);
    return res.status(200).json({ message: "Two Factor Authenitication disabled" });
  } catch (error) {
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const generateTfaSecret = async (req, res) => {
  try {
    const user = req.user;
    const [rows] = db.execute("SELECT tfa_activated FROM users WHERE u_id = ?", [user]);
    const tfaData = rows[0];
    if (!tfaData) return res.status(500).json({ error: "Oops! Something went wrong" });
    if (parseInt(tfaData.tfa_activated))
      return res.status(400).json({ error: "Two Factor Authentication is already enabled" });
    const tfa_code = speakeasy.generateSecret().base32;
    await db.execute("UPDATE users SET tfa_code = NULL WHERE u_id = ?", [tfa_code, user]);
    return res.status(201).json({ secret: tfa_code });
  } catch (error) {
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).send({ error: "Token missing or invalid" });
    const { userId } = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    const [rows] = await db.execute(
      "SELECT refresh_token FROM refresh_tokens WHERE refresh_token = ? AND u_id = ?",
      [refreshToken, userId]
    );
    if (rows.length === 0) return res.status(401).json({ error: "Token is invalid or expired" });
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_JWT_SECRET, {
      expiresIn: "1m",
    });
    return res.status(201).json({ accessToken: accessToken });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      return res.status(401).json({ error: "Token is invalid or expired" });
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const signOut = async (req, res) => {
  try {
    const user = req.user;
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).send({ error: "Token missing or invalid" });
    await db.execute("DELETE FROM refresh_tokens WHERE u_id = ? AND refresh_token = ?", [
      user,
      refreshToken,
    ]);
    return res.clearCookie("refreshToken").redirect("/login");
  } catch (error) {
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
