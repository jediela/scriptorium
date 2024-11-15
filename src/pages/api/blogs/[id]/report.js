import { authenticate } from "@/utils/auth";
import prisma, { checkReportedBlog, getBlog } from "@/utils/db";

export default async function handler(req, res) {
    const user = await authenticate(req, res);
    if (!user){
        return res.status(401).json({ error: "Unauthorized: You need to be logged in to perform this action." });
    }

    // Report Blog
    if (req.method === "POST"){
        const { blogId, reason } = req.body;
        if (!blogId || !reason){
            return res.status(400).json({message: "Please provide the required fields",});
        }
        const blog = await getBlog(blogId);
        if (!blog){
            return res.status(404).json({ error: "Blog not found." });
        }

        try {
            const existingReport = await checkReportedBlog(user.id, blogId);
            let reportMessage;
            // Update existing report
            if (existingReport){
                if (existingReport.userId !== user.id){
                    return res.status(403).json({ error: "Forbidden: You can only update your own reports." });
                }
                reportMessage = "Report updated."
                await prisma.report.update({
                    where: { id: existingReport.id },
                    data: { reason: reason},
                })
            }
            // Create new report if none exists
            else{
                reportMessage = "Report submitted."
                await prisma.report.create({
                    data: {
                        reason: reason,
                        userId: user.id,
                        blogPostId: blogId,
                    },
                });
            }
            return res.status(200).json({
                message: reportMessage,
                blog: {
                    id: blog.id,
                    title: blog.title,
                    content: blog.content,
                },
            });
        } catch (error) {
            return res.status(500).json({ error: "Error processing report." });
        }
    }

    // Remove report from blog
    else if (req.method === "DELETE"){
        const { id: blogId } = req.query;
        if (!blogId){
            return res.status(400).json({ error: "Blog ID is required" });
        }
        const blog = await getBlog(blogId);
        if (!blog){
            return res.status(404).json({ error: "Blog not found." });
        }
        try {
            const existingReport = await checkReportedBlog(user.id, Number(blogId));            
            if (!existingReport) {
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