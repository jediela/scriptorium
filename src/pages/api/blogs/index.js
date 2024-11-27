import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";

export default async function handler(req, res) {
    // Create new blog
    if (req.method === "POST"){
        let user = await authenticate(req, res);

        const { title, content, codeTemplateIds, tagIds } = req.body;

        if (!title || !content){
            return res.status(400).json({ message: "Please provide all required fields." });
        }
    
        try {
            const newBlog = await prisma.blog.create({
                data: {
                    title,
                    content,
                    userId: user.id,
                    codeTemplates: {
                        connect: codeTemplateIds?.map((id) => ({ id })) || [],
                    },
                    tags: {
                        connect: tagIds?.map((id) => ({ id })) || [],
                    },
                },
            });
            return res.status(200).json({
                message: "Blog created successfully",
                author: user.firstName + " " + user.lastName,
                blog: newBlog,
            });
        } catch (error) {
            return res.status(500).json({ error: "Error creating blog." });
        }
    }

    // View blogs ==> WRITTEN WITH THE ASSISTANCE OF CHATGPT
    else if (req.method === "GET"){
        const { title, content, tags, codeTemplates, userId, page = 1, pageSize = 10 } = req.query;        
        if (userId){
            const user = await authenticate(req, res);
            if (!userId || isNaN(userId)) {
                return res.status(400).json({ message: "Invalid user ID provided." });
            }        
            if (user.id !== parseInt(userId) && !user.isAdmin) {
                return res.status(403).json({ message: "You are not authorized to access this user's data." });
            }        
        }
        try {
            // Default sorted view 
            if (!title && !content && !tags && !codeTemplates) {
                // Total counts for blogs and comments
                const totalBlogs = await prisma.blog.count({
                    where: {
                        isHidden: false,
                        OR: [
                            { isHidden: false },
                            { userId: userId ? parseInt(userId) : undefined }
                        ]
                    }
                });
            
                const totalComments = await prisma.comment.count({
                    where: {
                        OR: [
                            { isHidden: false },
                            { userId: userId ? parseInt(userId) : undefined }
                        ]
                    }
                });
            
                // Pagination logic for blogs
                const blogs = await prisma.blog.findMany({
                    where: {
                        OR: [
                            { isHidden: false },
                            { userId: userId ? parseInt(userId) : undefined }
                        ]
                    },
                    skip: (page - 1) * parseInt(pageSize, 10),
                    take: parseInt(pageSize, 10),
                });
            
                const blogsWithVotes = await Promise.all(
                    blogs.map(async (blog) => {
                        const totalVotes = await prisma.vote.aggregate({
                            _count: { value: true },
                            _sum: { value: true },
                            where: { blogId: blog.id },
                        });
            
                        return {
                            ...blog,
                            voteCount: totalVotes._count.value,
                            sumOfVotes: totalVotes._sum.value || 0,
                        };
                    })
                );
            
                const blogsSortedByVote = blogsWithVotes.sort((a, b) => b.sumOfVotes - a.sumOfVotes);
            
                const comments = await prisma.comment.findMany({
                    where: {
                        OR: [
                            { isHidden: false },
                            { userId: userId ? parseInt(userId) : undefined }
                        ]
                    },
                    skip: (page - 1) * parseInt(pageSize, 10),
                    take: parseInt(pageSize, 10),
                });
            
                const commentsWithVotes = await Promise.all(
                    comments.map(async (comment) => {
                        const totalVotes = await prisma.vote.aggregate({
                            _count: { value: true },
                            _sum: { value: true },
                            where: { commentId: comment.id },
                        });
                        return {
                            ...comment,
                            voteCount: totalVotes._count.value,
                            sumOfVotes: totalVotes._sum.value || 0,
                        };
                    })
                );
            
                const commentsSortedByVote = commentsWithVotes.sort((a, b) => b.sumOfVotes - a.sumOfVotes);
            
                // Calculate total pages
                const totalBlogPages = Math.ceil(totalBlogs / parseInt(pageSize, 10));
                const totalCommentPages = Math.ceil(totalComments / parseInt(pageSize, 10));
            
                return res.status(200).json({
                    blogsSortedByVote,
                    commentsSortedByVote,
                    pagination: {
                        currentPage: page,
                        totalBlogPages,
                        totalCommentPages,
                    },
                });
            }        
            // Specified search
            else {                
            try {
                let where = { isHidden: false };
            
                if (title) {
                  where.title = { contains: title };
                }
                if (content) {
                  where.content = { contains: content };
                }
                if (tags) {
                  where.tags = { some: { name: { contains: tags } } };
                }
                if (codeTemplates) {
                  where.codeTemplates = { some: { title: { contains: codeTemplates } } };
                }
            
                const totalItems = await prisma.blog.count({ where });
            
                const filteredBlogs = await prisma.blog.findMany({
                  where,
                  skip: (page - 1) * parseInt(pageSize, 10),
                  take: parseInt(pageSize, 10),
                  include: { Vote: true, user: true, tags: true, codeTemplates: true },
                });
            
                const filteredBlogsWithVotes = await Promise.all(
                  filteredBlogs.map(async (blog) => {
                    const totalVotes = await prisma.vote.aggregate({
                      _count: { value: true },
                      _sum: { value: true },
                      where: { blogId: blog.id },
                    });
            
                    return {
                      ...blog,
                      voteCount: totalVotes._count.value,
                      sumOfVotes: totalVotes._sum.value || 0,
                    };
                  })
                );
            
                if (filteredBlogsWithVotes.length === 0) {
                  return res.status(404).json({ message: "No blogs found matching the criteria." });
                }
            
                res.status(200).json({
                    blogsSortedByVote: filteredBlogsWithVotes,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(pageSize, 10),
                        totalPages: Math.ceil(totalItems / parseInt(pageSize, 10)),
                        totalItems,
                    },
                });
                } catch (error) {
                    return res.status(500).json({ error: "Error fetching blogs." });
                }
            }

        } catch (error) {
            return res.status(500).json({ error: "Error fetching blogs." });
        } 
    }
    else{
        return res.status(405).json({ error: "Method not allowed" });
    }
}