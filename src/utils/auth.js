import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const generateToken = (user) => {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
};

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid Token' });
    }
  } else {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
};