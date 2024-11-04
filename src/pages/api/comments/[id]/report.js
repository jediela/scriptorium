import { authenticate } from "@/utils/auth";
import prisma, { checkReportedComment, getComment } from "@/utils/db";

export default async function handler(req, res) {
    const user = await authenticate(req, res);
    if (!user){
        return res.status(401).json({ error: "Unauthorized: You need to be logged in to perform this action." });
    }

    // Report Comment
    if (req.method === "POST"){
        const { commentId, reason } = req.body;
        if (!commentId || !reason){
            return res.status(400).json({message: "Please provide the required fields",});
        }
        const comment = await getComment(commentId);
        if (!comment){
            return res.status(404).json({ error: "Comment not found." });
        }

        try {
            const existingReport = await checkReportedComment(user.id, commentId);
            let reportMessage;
            // Update existing report
            if (existingReport){
                if (existingReport.userId !== user.id){
                    return res.status(403).json({ error: "Forbidden: You can only update your own reports." });
                }
                reportMessage = "Report updated."
                await prisma.report.update({
                    where: { id: existingReport.id },
                    data: { reason: reason },
                });
            }
            // Create new report
            else{
                reportMessage = "Report submitted."
                await prisma.report.create({
                    data: {
                        reason: reason,
                        userId: user.id,
                        commentId: commentId,
                    },
                });
            }
            return res.status(200).json({
                message: reportMessage,
                comment: {
                    id: comment.id,
                    content: comment.content,
                },
            });
        } catch (error) {
            return res.status(500).json({ error: "Error processing report." });
        }
    }

    // Remove report from comment
    else if (req.method === "DELETE"){
        const { id: commentId } = req.query;
        if (!commentId){
            return res.status(400).json({ error: "Comment ID is required" });
        }
        const comment = await getComment(commentId);
        if (!comment){
            return res.status(404).json({ error: "Comment not found." });
        }
        try {
            const existingReport = await checkReportedComment(user.id, Number(commentId));
            if (!existingReport){
                return res.status(404).json({ error: "Report not found." });
            }
            await prisma.report.delete({
                where: {
                    id: existingReport.id,
                },
            });
            return res.status(200).json({ message: "Report deleted successfully" });
        } catch (error) {
            return res.status(500).json({ error: "Error deleting report" });
        }
    }
    else{
        return res.status(405).json({ error: "Method not allowed" });
    }
}