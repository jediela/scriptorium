import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
    const user = await authenticate(req, res);
    if (!user || !user.isAdmin) {
        return res.status(403).json({ error: "Forbidden: Admin access only." });
    }
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { page = 1, pageSize = 10 } = req.query;

        const reportedBlogs = await prisma.blog.findMany({
            where: { reports: { some: {} } },
            orderBy: { reports: { _count: 'desc' } },
            skip: (page - 1) * pageSize,
            take: parseInt(pageSize, 10),
            include: { reports: true }
        });
        const reportedComments = await prisma.comment.findMany({
            where: { reports: { some: {} } },
            orderBy: { reports: { _count: 'desc' } },
            skip: (page - 1) * pageSize,
            take: parseInt(pageSize, 10),
            include: { reports: true }
        });
        return res.status(200).json({ reportedBlogs, reportedComments });
    } catch (error) {
        return res.status(500).json({ error: "Error fetching reported content." });
    }
}