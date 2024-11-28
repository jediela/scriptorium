import prisma from "@/utils/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Comment ID is required" });
    }

    try {
      const parentComment = await prisma.comment.findUnique({
        where: { id: Number(id) },
        include: {
          replies: {
            include: {
              user: { select: { id: true, email: true } },
              Vote: { select: { userId: true, value: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!parentComment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      return res.status(200).json({ replies: parentComment.replies });
    } catch (error) {
      console.error("Error fetching replies:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
