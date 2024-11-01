import { authenticate } from "@/utils/auth";
import prisma, { getBlog, getComment } from "@/utils/db";

export default async function handler(req, res) {
    let user = await authenticate(req, res);

    // Create comment
    if (req.method === "POST") {
        const { content, blogId, commentId } = req.body;

        if (!content || (!blogId && !commentId)){
            return res.status(400).json({
                message: "Please provide the required fields",
            });        
        }

        if (blogId){
            const blog = await getBlog(blogId);
            if (!blog){
                return res.status(404).json({ error: "Blog not found." });
            }
        }
        else if (commentId){
            const comment = await getComment(commentId);
            if (!comment){
                return res.status(404).json({ error: "Comment not found." });
            }
        }

        try {
            const comment = await prisma.comment.create({
                data: {
                    content,
                    userId: user.id,
                    blogPostId: blogId || null,
                    parentCommentId: commentId || null,
                },
                select: {
                    id: true,
                    content: true,
                }
            });
            res.status(200).json(comment);
        } catch (error) {
            return res.status(500).json({ error: "Error creating comment." });
        }
    } 
    // else if (){

    // }
    // else {
        
    // }
    
}