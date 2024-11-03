import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "./db";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN; 

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (user) => {
  return jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

export const revokeToken = async (token, userId) => {
  await prisma.revokedToken.create({
      data: {
          token,
          userId,
      },
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const authenticate = async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const revokedToken = await prisma.revokedToken.findUnique({
      where: { token }
    });
    if (revokedToken) {
      return res.status(401).json({ error: "Token has been revoked" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    return user;
  } catch (err) {
    return res.status(401).json({ error: "Invalid Token" });
  }
};