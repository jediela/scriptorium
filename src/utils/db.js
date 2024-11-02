import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

export async function getUser(userId) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });
        return user;
    } catch (error) {
        throw new Error("Error retrieving user.");
    }
}

export async function getBlog(blogId) {
    try {
        const blog = await prisma.blog.findUnique({
            where: { id: Number(blogId) }
        });
        return blog;
    } catch (error) {
        throw new Error("Error retrieving blog.");
    }
}

export async function getComment(commentId) {
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: Number(commentId) }
        });
        return comment;
    } catch (error) {
        throw new Error("Error retrieving comment.");
    }
}

export async function getVote(voteId) {
    try {
        const vote = await prisma.vote.findUnique({
            where: { id: Number(voteId) }
        });
        return vote;
    } catch (error) {
        throw new Error("Error retrieving vote.");
    }
}

// True if user has voted, false they haven't voted
export async function checkVotedBlog(userId, blogId) {
    try {
        const existingVote = await prisma.vote.findFirst({
            where: {
                userId: userId,
                blogId: blogId,
            },
        });
        return existingVote;
    } catch (error) {
        throw new Error("Error retrieving vote info.");
    }
}