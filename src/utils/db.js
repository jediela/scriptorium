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

// True if user has voted, false they haven't voted
export async function checkVotedComment(userId, commentId) {
    try {
        const existingVote = await prisma.vote.findFirst({
            where: {
                userId: userId,
                commentId: commentId,
            },
        });
        return existingVote;
    } catch (error) {
        throw new Error("Error retrieving vote info.");
    }
}
// True if user has reported the comment, false they haven't reported it
export async function checkReportedComment(userId, commentId) {
    try {
        const existingReport = await prisma.report.findFirst({
            where: {
                userId: userId,
                commentId: commentId,
            },
        });
        return existingReport;
    } catch (error) {
        throw new Error("Error retrieving vote info.");
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
// True if user has reported the blog, false they haven't reported it
export async function checkReportedBlog(userId, blogId) {
    try {
        const existingReport = await prisma.report.findFirst({
            where: {
                userId: userId,
                blogPostId: blogId,
            },
        });
        return existingReport;
    } catch (error) {
        throw new Error("Error retrieving report info.");
    }
}