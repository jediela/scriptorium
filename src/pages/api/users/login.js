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
    const user = await prisma.user.findUnique({
        where: { email }
    });

    // Check if user exists
    if (!user){
        return res.status(404).json({ error: "User does not exist" });
    }

    // Check if password is correct
    if (!(await comparePassword(password, user.password))){
        return res.status(401).json({ error: "Invalid password" });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(200).json({
        "message": "Login Successful",
        "token": token
    });
}