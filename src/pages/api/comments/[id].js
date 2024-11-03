import { authenticate } from "@/utils/auth";
import prisma, { getComment } from "@/utils/db";

export default async function handler(req, res) {
    const user = await authenticate(req, res);
    if (!user){
        return res.status(401).json({ error: "Unauthorized: You need to be logged in to perform this action." });
    }
    
    const { id } = req.query;
    const commentId = Number(id);
    if (!id) {
        return res.status(400).json({ error: "Missing ID" });
    }

    const comment = await getComment(commentId);
    if (!comment){
        return res.status(404).json({ error: "Comment not found." });
    }

    // Check if authenticated user owns the blog
    if (comment.userId !== user.id) {
        return res.status(403).json({ error: "You do not have permission to modify this comment." });
    }

    // Edit comment
    if (req.method === "POST"){

    }

    // Delete comment
    else if (req.method === "DELETE"){
        try {
            if (!comment) {
                return res.status(404).json({ error: "Comment not found." });
            }    
            if (comment.userId !== user.id) {
                return res.status(403).json({ error: "Forbidden: You can only delete your own comments." });
            }
            // Delete replies
            await prisma.comment.deleteMany({
                where: { parentCommentId: comment.id },
            });
            // Delete related votes
            await prisma.vote.deleteMany({
                where: { commentId: comment.id },
            });
            // Delete related reports
            await prisma.report.deleteMany({
                where: { commentId: comment.id },
            });
            // Delete comment
            await prisma.comment.delete({
                where: { id: comment.id },
            });
            return res.status(200).json({ message: "Comment deleted successfully." });
        } catch (error) {
            return res.status(500).json({ error: "Error deleting comment." });
        }
    }
    else{
        return res.status(405).json({ error: "Method not allowed" });
    }
}