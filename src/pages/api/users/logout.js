import { verifyRefreshToken, revokeToken } from "@/utils/auth";
import prisma from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: "Please provide the refresh token." });
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        await revokeToken(refreshToken, decoded.userId);
        res.status(200).json({ message: "Logout successful." });
    } catch (error) {
        return res.status(403).json({ error: "Invalid refresh token." });
    }
}