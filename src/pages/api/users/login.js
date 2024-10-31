import prisma from "@/utils/db";
import { comparePassword, generateToken } from "@/utils/auth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = req.body;

    // Field check
    if (!email || !password) {
    return res.status(400).json({
            message: "Please provide all the required fields",
        });
    }
    
    // Find user by email
    let user;
    try {
        user = await prisma.user.findUnique({
            where: { email }
        });   
    } catch (error) {
        return res.status(500).json({ error: "Error finding user." });
    }

    // Check valid credentials
    if (!user || !(await comparePassword(password, user.password))){
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(200).json({
        "message": "Login Successful",
        "token": token
    });
}