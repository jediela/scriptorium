import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";

export default async function handler(req, res) {
  const user = await authenticate(req, res);

  if (req.method === "GET") {
    const { page = 1, pageSize = 10 } = req.query;

    try {
      const totalBlogs = await prisma.blog.count({
        where: { userId: user.id, isHidden: false },
      });

      const blogs = await prisma.blog.findMany({
        where: { userId: user.id, isHidden: false },
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

      const blogsSortedByVote = blogsWithVotes.sort(
        (a, b) => b.sumOfVotes - a.sumOfVotes
      );

      const totalPages = Math.ceil(totalBlogs / parseInt(pageSize, 10));

      return res.status(200).json({
        blogs: blogsSortedByVote,
        pagination: {
          currentPage: page,
          totalPages,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: "Error fetching blogs." });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
