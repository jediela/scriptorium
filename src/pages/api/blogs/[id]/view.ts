import prisma from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

    let { id } = req.query;
    const rid: number = parseInt(id as string);

    if (!rid) {
        return res.status(400).json({ error: "Missing ID" });
    }

    let blog;
    let voteValue;
    try {
        blog = await prisma.blog.findUnique({
            where: { id: rid },
            include: {
                user: true,
                codeTemplates: true,
                tags: true,
                comments: {
                    where: {
                        isHidden: false,
                    },
                },
                reports: true,
                Vote: true,
            },
        });


        if (!blog) {
            return res.status(404).json({ error: "Blog not found." });
        }

        const voteAggregate = await prisma.vote.aggregate({
            where: { blogId: rid },
            _sum: { value: true },
        });

        voteValue = voteAggregate._sum.value || 0;
    } catch (error) {
        console.error("Error fetching blog or calculating votes:", error);
        return res.status(500).json({ error: "Error processing request." });
    }

    return res.status(200).json({
        ...blog,
        voteValue,
    });
}
