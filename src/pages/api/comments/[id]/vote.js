import { authenticate } from "@/utils/auth";
import prisma, { checkVotedComment, getComment } from "@/utils/db";

export default async function handler(req, res) {
    // Add vote
    if (req.method === "POST"){
        const user = await authenticate(req, res);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized: You need to be logged in to perform this action." });
        }

        const { commentId, voteValue} = req.body;
        if (!commentId || !voteValue){
            return res.status(400).json({message: "Please provide the required fields",});        
        }

        if (voteValue !== 1 && voteValue !== -1) {
            return res.status(400).json({ error: "Invalid vote value. Vote must be 1 or -1." });
        }

        const comment = await getComment(commentId);
        if (!comment){
            return res.status(404).json({ error: "comment not found." });
        }

        try {
            const existingVote = await checkVotedComment(user.id, commentId);
            let voteMessage;
            // Update existing vote
            if (existingVote) {
                if (existingVote.userId !== user.id) {
                    return res.status(403).json({ error: "Forbidden: You can only update your own votes." });
                }
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
                        commentId: commentId,
                    },
                });
            }
            // Calculate total votes for the comment
            const totalVotes = await prisma.vote.aggregate({
                _count: { value: true },
                _sum: { value: true },
                where: { commentId: commentId },
            });
            return res.status(200).json({ 
                message: voteMessage, 
                comment: comment.id,
                totalVotes: totalVotes._count,
                sumOfVotes: totalVotes._sum
            });
        } catch (error) {
            return res.status(500).json({ error: "Error processing vote." });
        }
    }

    // Remove vote
    else if (req.method === "DELETE"){
        const user = await authenticate(req, res);
        const { id: commentId } = req.query;
        if (!commentId){
            return res.status(400).json({ error: "comment ID is required" });
        }
        const comment = await getComment(Number(commentId));
        if (!comment){
            return res.status(404).json({ error: "comment not found." });
        }
        try {
            const existingVote = await checkVotedComment(Number(user.id), Number(commentId));            
            if (!existingVote) {
                return res.status(404).json({ error: "Vote not found." });
            }
            await prisma.vote.delete({
                where: {
                    id: Number(existingVote.id),
                },
            });
            return res.status(200).json({ message: "Vote removed successfully" });
        } catch (error) {
            return res.status(500).json({ error });
        }
    }
    else{
        return res.status(405).json({ error: "Method not allowed" });
    }
}
