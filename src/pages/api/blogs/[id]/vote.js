import { authenticate } from "@/utils/auth";
import prisma, { checkVotedBlog, getBlog } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method !== "POST"){
        return res.status(405).json({ error: "Method not allowed" });
    }
    const user = await authenticate(req, res);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized: You need to be logged in to perform this action." });
    }

    const { blogId, voteValue} = req.body;
    if (!blogId || !voteValue){
        return res.status(400).json({message: "Please provide the required fields",});        
    }

    if (voteValue !== 1 && voteValue !== -1) {
        return res.status(400).json({ error: "Invalid vote value. Vote must be 1 or -1." });
    }

    const blog = await getBlog(blogId);
    if (!blog){
        return res.status(404).json({ error: "Blog not found." });
    }

    try {
        const existingVote = await checkVotedBlog(user.id, blogId);
        let voteMessage;
        // Update existing vote
        if (existingVote) {
            voteMessage = "Vote updated."
            await prisma.vote.update({
                where: { id: existingVote.id },
                data: { value: voteValue },
            });
        } 
        // Create new vote if none exists
        else {
            voteMessage = "Vote registered."
            await prisma.vote.create({
                data: {
                    value: voteValue,
                    userId: user.id,
                    blogId: blogId,
                },
            });
        }
        // Calculate total votes for the blog
        const totalVotes = await prisma.vote.aggregate({
            _count: { value: true },
            _sum: { value: true },
            where: { blogId: blogId },
        });
        return res.status(200).json({ 
            message: voteMessage, 
            blog: blog.id + ": " + blog.title,
            totalVotes: totalVotes._count,
            sumOfVotes: totalVotes._sum
        });
    } catch (error) {
        return res.status(500).json({ error: "Error processing vote." });
    }
}
