import prisma from "@/utils/db"
import { authenticate } from '@/utils/auth';

export default async function handler(req, res) {
    const { id } = req.query;
  
    if (req.method === 'POST') {
      await forkTemplate(req, res, id);
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  
  // fork template (POST)
  async function forkTemplate(req, res, id) {
    const user = await authenticate(req, res);
    if (!user) {
      return;
    }
  
    const { title, explanation, code, tags } = req.body;
  
    if (!title || !code) {
      res.status(400).json({ error: 'Title and code are required' });
      return;
    }
  
    try {
      const originalTemplate = await prisma.codeTemplate.findUnique({
        where: { id: parseInt(id) },
        include: { tags: true },
      });
  
      if (!originalTemplate) {
        res.status(404).json({ error: 'Original template not found' });
        return;
      }
  
      // tag handler
      let tagRecords = [];
      if (tags && tags.length > 0) {
        tagRecords = await Promise.all(
          tags.map(async (tagName) => {
            tagName = tagName.trim().toLowerCase();
            let tag = await prisma.tag.findUnique({ where: { name: tagName } });
            if (!tag) {
              tag = await prisma.tag.create({ data: { name: tagName } });
            }
            return tag;
          })
        );
      } else {
        tagRecords = originalTemplate.tags;
      }
  
      const newTemplate = await prisma.codeTemplate.create({
        data: {
          title,
          explanation,
          code,
          isFork: true,
          user: { connect: { id: user.id } },
          forkedFrom: { connect: { id: parseInt(id) } },
          tags: {
            connect: tagRecords.map((tag) => ({ id: tag.id })),
          },
        },
      });
  
      res.status(201).json({
        id: newTemplate.id,
        message: 'Code template forked successfully.',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fork template' });
    }
}