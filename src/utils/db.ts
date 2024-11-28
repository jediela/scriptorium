import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

export async function getUser(userId: number) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        return user;
    } catch (error) {
        throw new Error("Error retrieving user.");
    }
}

export async function getBlog(blogId: number) {
    try {
        const blog = await prisma.blog.findUnique({
            where: { id: blogId }
        });
        return blog;
    } catch (error) {
        throw new Error("Error retrieving blog.");
    }
}

export async function getComment(commentId: number) {
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });
        return comment;
    } catch (error) {
        throw new Error("Error retrieving comment.");
    }
}

// True if user has voted, false they haven't voted
export async function checkVotedComment(userId: number, commentId: number) {
    try {
        const existingVote = await prisma.vote.findFirst({
            where: {
                userId,
                commentId
            },
        });
        return existingVote;
    } catch (error) {
        console.error(error);
    }
}
// True if user has reported the comment, false they haven't reported it
export async function checkReportedComment(userId: number, commentId: number) {
    try {
        const existingReport = await prisma.report.findFirst({
            where: {
                userId,
                commentId,
            },
        });
        return existingReport;
    } catch (error) {
        throw new Error("Error retrieving vote info.");
    }
}

export async function getVote(voteId: number) {
    try {
        const vote = await prisma.vote.findUnique({
            where: { id: voteId }
        });
        return vote;
    } catch (error) {
        throw new Error("Error retrieving vote.");
    }
}

// True if user has voted, false they haven't voted
export async function checkVotedBlog(userId: number, blogId: number) {
    try {
        const existingVote = await prisma.vote.findFirst({
            where: {
                userId,
                blogId,
            },
        });
        return existingVote;
    } catch (error) {
        throw new Error("Error retrieving vote info.");
    }
}
// True if user has reported the blog, false they haven't reported it
export async function checkReportedBlog(userId: number, blogId: number) {
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