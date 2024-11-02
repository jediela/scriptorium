import prisma from "@/utils/db"
import { authenticate } from "@/utils/auth";

export default async function handler(req, res) {
    const user = await authenticate(req, res);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized: You need to be logged in to perform this action." });
    }

    let { id } = req.query;
    id = Number(id);
  
    if (!id) {
        return res.status(400).json({ error: "Missing ID" });
    }

    let blog;
    try {
        blog = await prisma.blog.findUnique({
            where: { id },
            include: { user: true }, 
        });
    } catch (error) {
        return res.status(500).json({ error: "Error finding blog." });
    }

    if (!blog){
        return res.status(404).json({ error: "Blog not found." });
    }

    // Check if authenticated user owns the blog
    if (blog.userId !== user.id) {
        return res.status(403).json({ error: "You do not have permission to modify this blog." });
    }

    // Update Blog
    if (req.method === "POST") {
        let { title, content, isHidden: requestedIsHidden } = req.body;

        // Check if user is an admin
        let isHidden, message;
        if (user.isAdmin) {
            isHidden = requestedIsHidden;
            message = "Blog Hidden."
        } 
        else {
            isHidden = blog.isHidden;
            message = "Only admins can hide blogs."
        }

        try {
            const updatedBlog = await prisma.blog.update({
                where: { id },
                data: {
                    title: title || blog.title,
                    content: content || blog.content,
                    isHidden: isHidden,
                },
                select: {
                    title: true,
                    content: true,
                    isHidden: true,
                },
            });
            res.status(200).json({
                message: message,
                updatedBlog: updatedBlog,
            });
        } catch (error) {
            res.status(500).json({ error: "Error updating blog." });
        }
    }

    // Delete Blog
    else if (req.method === "DELETE"){
        try {
            // Delete comments related to given blogId
            await prisma.comment.deleteMany({
                where: { blogPostId: id },
            });
            // Delete reports related to given blogId
            await prisma.report.deleteMany({
                where: { blogPostId: id },
            });
            // Delete votes related to given blogId
            await prisma.vote.deleteMany({
                where: { blogPostId: id },
            });
            // Delete blog
            await prisma.blog.delete({
                where: { id },
            });
            res.status(200).json({
                message: "Blog deleted successfully",
            });
        } catch (error) {
            res.status(500).json({ error: "Error deleting blog." });
        }
    }
}