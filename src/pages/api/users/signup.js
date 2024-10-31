import prisma from "@/utils/db";
import { hashPassword } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== "POST"){
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, firstName, lastName, avatar, phoneNumber, isAdmin } = req.body;

  // Field check
  if (!email || !password || !firstName || !lastName){
    return res.status(400).json({
      message: "Please provide all the required fields",
    });
  }

  // Email uniqueness check
  let emailExists;
  try {
    emailExists = await prisma.user.findUnique({
      where: { email }
    });
  } catch (error) {
    return res.status(500).json({ error: "Error finding user." });
  }

  if (emailExists){
    return res.status(409).json({ error: "Email already in use" });
  }

  // Create user
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
        avatar,
        phoneNumber,
        isAdmin,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Error creating user." });
  }
}