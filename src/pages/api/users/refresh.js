import { generateRefreshToken, verifyRefreshToken, generateToken } from "@/utils/auth";
import prisma from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            message: "Please provide the refresh token.",
        });
    }

    let user;
    try {
        const decoded = verifyRefreshToken(refreshToken);

        user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid refresh token." });
        }
        console.log(user)
        const newAccessToken = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);

        res.status(200).json({
            message: "Refresh successful",
            refreshToken: newRefreshToken,
            token: newAccessToken
        });
    } catch (error) {
        return res.status(403).json({ error: "Error refreshing token" });
    }
}