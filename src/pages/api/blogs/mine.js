import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";

export default async function handler(req, res) {
  const user = await authenticate(req, res);

  if (req.method === "GET") {
    const { title, content, tags, codeTemplates, userId, page = 1, pageSize = 10 } = req.query;        
    if (!title && !content && !tags && !codeTemplates) {

      try {
        const totalBlogs = await prisma.blog.count({
          where: { userId: user.id, },
        });

        const blogs = await prisma.blog.findMany({
          where: { userId: user.id, },
          skip: (page - 1) * parseInt(pageSize, 10),
          take: parseInt(pageSize, 10),
        });

        const blogsWithVotes = await Promise.all(
          blogs.map(async (blog) => {
            const totalVotes = await prisma.vote.aggregate({
              _count: true,
              _sum: { value: true },
              where: { blogId: blog.id },
            });
        
            return {
              ...blog,
              voteCount: totalVotes._count || 0,
              sumOfVotes: totalVotes._sum.value || 0,
            };
          })
        );
        
        // const blogsSortedByVote = blogsWithVotes.sort(
        //   (a, b) => b.sumOfVotes - a.sumOfVotes
        // );

        const totalPages = Math.ceil(totalBlogs / parseInt(pageSize, 10));

        return res.status(200).json({
          blogs: blogsWithVotes,
          pagination: {
            currentPage: page,
            totalPages,
          },
        });
      } catch (error) {
        return res.status(500).json({ error: "Error fetching blogs." });
      }
    }
    else {                
      try {
          let where = { userId: user.id };
      
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
              blogs: filteredBlogsWithVotes,
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


  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
