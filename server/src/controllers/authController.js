import db from "../../db/index.js";
import newUserSchema from "../schemas/newUserSchema.js";
import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
import { v4 } from "uuid";
import sendVerifyEmail from "../utils/sendVerifyEmail.js";
import sendResetPwEmail from "../utils/sendResetPwEmail.js";
import resetPasswordSchema from "../schemas/resetPasswordSchema.js";

export const registerUser = async (req, res) => {
  try {
    const value = await newUserSchema.validateAsync(req.body);
    const [rows] = await db.execute("SELECT u_id FROM users WHERE u_id = ?", [value.email]);
    if (rows.length !== 0) return res.status(409).json({ error: "Email already in use" });
    const hashedPassword = await bcrypt.hash(value.password, 10);
    const tfa_token = speakeasy.generateSecret().base32;
    const verification_token = v4();
    await db.execute(
      "INSERT INTO users (u_id, first_name, last_name, password, tfa_token, verification_token) VALUES (?,?,?,?,?,?)",
      [value.email, value.firstName, value.lastName, hashedPassword, tfa_token, verification_token]
    );
    const [results] = await db.execute(
      "SELECT first_name,last_name,u_id,verification_token FROM users WHERE u_id = ?",
      [value.email]
    );
    sendVerifyEmail(results[0]);
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error(error);
    if (error instanceof Joi.ValidationError)
      return res
        .status(400)
        .json({ error: capitalizeFirstLetter(error.details[0].message.replaceAll(`"`, ``)) });
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password || password === "" || !email || email === "")
      return res.status(401).json({ error: "Invalid email or password" });
    const [rows] = await db.execute("SELECT * FROM users WHERE u_id = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(401).json({ error: "Invalid email or password" });
    const data = { userId: user.u_id };
    const tfaToken = jwt.sign(data, process.env.TFA_JWT_SECRET, { expiresIn: "2m" });
    if (user.tfa_activated)
      return res.status(400).json({ error: "Two-Factor Authentication needed", tfaToken });
    const refreshToken = jwt.sign(data, process.env.REFRESH_JWT_SECRET, {
      expiresIn: "14d",
    });
    await db.execute("INSERT INTO refresh_tokens (u_id, refresh_token,expires_at) VALUES (?,?,?)", [
      user.u_id,
      refreshToken,
      new Date(Date.now() + 1209600000),
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
        sameSite: process.env.SAME_SITE_COOKIE,
      })
      .json({ accessToken: accessToken });
  } catch (error) {
    console.error(error);
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
    const [rows] = await db.execute("SELECT tfa_token FROM users WHERE u_id = ?", [u_id]);
    const tfa_token = rows[0].tfa_token;
    if (!tfa_token) return res.status(400).json({ error: "Oops! Something went wrong" });
    const verified = speakeasy.totp.verify({
      secret: tfa_token,
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
    console.error(error);
    if (error instanceof jwt.TokenExpiredError)
      return res.status(401).json({ error: "Please log in again" });
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const enableTFA = async (req, res) => {
  try {
    const { userToken } = req.body;
    if (!userToken) return res.status(400).json({ error: "userToken is missing" });
    const user = req.user;
    const [rows] = await db.execute("SELECT tfa_token, tfa_activated FROM users WHERE u_id = ?", [
      user,
    ]);
    const tfaData = rows[0];
    if (!tfaData) return res.status(500).json({ error: "Oops! Something went wrong" });
    if (parseInt(tfaData.tfa_activated))
      return res.status(400).json({ error: "Two Factor Authentication is already enabled" });
    const verified = speakeasy.totp.verify({
      secret: tfaData.tfa_token,
      encoding: "base32",
      token: userToken,
    });
    if (!verified) return res.status(400).json({ error: "Invalid code entered" });
    await db.execute("UPDATE users SET tfa_activated = 1 WHERE u_id = ?", [user]);
    return res.status(200).json({ message: "Two Factor Authenitication is enabled" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const disableTFA = async (req, res) => {
  try {
    const { userToken } = req.body;
    if (!userToken) return res.status(400).json({ error: "userToken is missing" });
    const user = req.user;
    const [rows] = await db.execute("SELECT tfa_token,tfa_activated FROM users WHERE u_id = ?", [
      user,
    ]);
    const tfaData = rows[0];
    if (!tfaData) return res.status(500).json({ error: "Oops! Something went wrong" });
    if (!parseInt(tfaData.tfa_activated))
      return res.status(400).json({ error: "Two Factor Authentication is already disabled" });
    const verified = speakeasy.totp.verify({
      secret: tfaData.tfa_token,
      encoding: "base32",
      token: userToken,
    });
    if (!verified) return res.status(400).json({ error: "Invalid code entered" });
    await db.execute("UPDATE users SET tfa_activated = 0, tfa_token = NULL WHERE u_id = ?", [user]);
    return res.status(200).json({ message: "Two Factor Authenitication is disabled" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const generateTfaSecret = async (req, res) => {
  try {
    const user = req.user;
    const [rows] = await db.execute("SELECT tfa_activated FROM users WHERE u_id = ?", [user]);
    const tfaData = rows[0];
    if (!tfaData) return res.status(500).json({ error: "Oops! Something went wrong" });
    if (parseInt(tfaData.tfa_activated))
      return res.status(400).json({ error: "Two Factor Authentication is already enabled" });
    const tfa_token = speakeasy.generateSecret().base32;
    await db.execute("UPDATE users SET tfa_token = ? WHERE u_id = ?", [tfa_token, user]);
    return res.status(201).json({ secret: tfa_token });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError)
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
    return res.clearCookie("refreshToken").json({ message: "Successfully logged out" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || token === "") return res.status(400).json({ error: "Token is missing" });
    if (!email || email === "") return res.status(400).json({ error: "Email is missing" });
    const [rows] = await db.execute(
      "SELECT verified_email FROM users WHERE u_id = ? AND verification_token = ?",
      [email, token]
    );
    if (rows.length === 0) return res.status(500).json({ error: "Oops! Something went wrong" });
    if (rows[0].verified_email === 1)
      return res.status(400).json({ error: "Email is already verified" });
    const results = await db.execute(
      "UPDATE users SET verified_email = 1 WHERE u_id = ? AND verification_token = ?",
      [email, token]
    );
    if (results[0].affectedRows === 0)
      return res.status(500).json({ error: "Oops! Something went wrong" });
    res.status(200).send({ message: "Email is verified" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const sendVerifyEmailLink = async (req, res) => {
  try {
    const user = req.user;
    const [rows] = await db.execute("SELECT verified_email FROM users WHERE u_id = ?", [user]);
    if (rows.length === 0) return res.status(500).json({ error: "Oops! Something went wrong" });
    if (rows[0].verified_email === 1)
      return res.status(400).json({ error: "Email is already verified" });
    const [results] = await db.execute(
      "SELECT u_id,first_name,last_name,verification_token FROM users WHERE u_id = ?",
      [user]
    );
    if (results.length === 0) return res.status(500).json({ error: "Oops! Something went wrong" });
    sendVerifyEmail(results[0]);
    return res.status(200).json({ message: "Confirmation email sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || email === "") return res.status(400).json({ error: "email can't be empty" });
    const reset_token = v4();
    const resetTokenExpiration = new Date(Date.now() + 3600000);
    const [rows] = await db.execute(
      "UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE u_id = ?",
      [reset_token, resetTokenExpiration, email]
    );
    if (rows.affectedRows === 0) return res.status(404).json({ error: "User was not found" });
    const [[user]] = await db.execute(
      "SELECT u_id, first_name, last_name, reset_token FROM users WHERE u_id = ?",
      [email]
    );
    if (!user) return res.status(404).json({ error: "User was not found" });
    sendResetPwEmail(user);
    return res.status(201).json({ message: "Reset link was sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const isResetTokenValid = async (req, res) => {
  try {
    const { reset_token } = req.params;
    if (!reset_token || reset_token === "")
      return res.status(400).json({ error: "The link is expired or invalid" });
    const [[result]] = await db.execute(
      "SELECT reset_token_expiration > NOW() as reset_token_valid FROM users WHERE reset_token = ?",
      [reset_token]
    );
    if (!result || !result.reset_token_valid)
      return res.status(400).json({ error: "The link is expired or invalid" });
    return res.status(200).json({ message: "The link is valid" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const resetPasswordWithToken = async (req, res) => {
  try {
    const { reset_token } = req.params;
    if (!reset_token || reset_token === "")
      return res.status(400).json({ error: "The link is expired or invalid" });
    const value = await resetPasswordSchema.validateAsync(req.body);
    const hashedPassword = await bcrypt.hash(value.password, 10);
    const [rows] = await db.execute(
      "UPDATE users SET password = ? WHERE reset_token = ? AND reset_token_expiration > NOW()",
      [hashedPassword, reset_token]
    );
    if (rows.affectedRows === 0)
      return res.status(400).json({ message: "Invalid or expired token" });
    await db.execute(
      "DELETE FROM refresh_tokens WHERE u_id IN (SELECT u_id FROM users WHERE reset_token = ?)",
      [reset_token]
    );
    await db.execute(
      "UPDATE users SET reset_token_expiration = NULL, reset_token = NULL WHERE reset_token = ?",
      [reset_token]
    );
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    if (error instanceof Joi.ValidationError)
      return res
        .status(400)
        .json({ error: capitalizeFirstLetter(error.details[0].message.replaceAll(`"`, ``)) });
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
