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
    if (!user.isAdmin && blog.userId !== user.id) {
        return res.status(403).json({ error: "You do not have permission to modify this blog." });
    }

    // Update Blog
    if (req.method === "POST") {
        let { title, content, codeTemplateIds, tagIds, isHidden: requestedIsHidden } = req.body;

        // Check if user is an admin (For hiding/unhiding blogs)
        let isHidden, message;
        if (user.isAdmin) {
            if (requestedIsHidden !== undefined && requestedIsHidden !== blog.isHidden) {
                isHidden = requestedIsHidden;
                message = requestedIsHidden ? "Blog Hidden." : "Blog Unhidden.";
            } else {
                isHidden = blog.isHidden;
            }
        } else {
            if (blog.isHidden) {
                return res.status(403).json({ message: "This blog is hidden and cannot be edited." });
            }
            isHidden = blog.isHidden;
            message = "Only admins can hide blogs."
        }

        try {
            const updatedBlog = await prisma.blog.update({
                where: { id },
                data: {
                    title: title || blog.title,
                    content: content || blog.content,
                    codeTemplates: {
                        set: codeTemplateIds?.map((id) => ({ id })) || [],
                    },
                    tags: {
                        set: tagIds?.map((id) => ({ id })) || [],
                    },
                    isHidden: isHidden,
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

    // Get blog
    else if (req.method === "GET"){
        return res.status(200).json(blog);
    }

    // Delete Blog
    else if (req.method === "DELETE"){
        if (blog.isHidden && !user.isAdmin) {
            return res.status(403).json({ message: "Cannot delete a hidden blog unless you are an admin." });
        }
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
                where: { blogId: id },
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
    else{
        return res.status(405).json({ error: "Method not allowed" });
    }
}