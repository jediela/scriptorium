import prisma from "@/utils/db"
import { authenticate } from '@/utils/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Get a code template
    return getTemplate(req, res, id);
  } else if (req.method === 'PUT') {
    // Update a code template
    return updateTemplate(req, res, id);
  } else if (req.method === 'DELETE') {
    // Delete a code template
    return deleteTemplate(req, res, id);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// GET template
async function getTemplate(req, res, id) {
  try {
    const template = await prisma.codeTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true, isAdmin: false},
        },
        tags: true,
        forkedFrom: {
          select: { id: true, title: true },
        },
        forks: {
          select: { id: true, title: true },
        },
      },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    return res.status(200).json(template);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch template' });
  }
}

// PUT template
async function updateTemplate(req, res, id) {
  return authenticate(req, res, async () => {
    const { title, explanation, code, tags } = req.body;

    try {
      const template = await prisma.codeTemplate.findUnique({ where: { id: parseInt(id) } });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (template.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

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
      }

      await prisma.codeTemplate.update({
        where: { id: parseInt(id) },
        data: {
          title,
          explanation,
          code,
          tags: {
            set: [],
            connect: tagRecords.map((tag) => ({ id: tag.id })),
          },
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({ message: 'Code template updated successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update template' });
    }
  });
}

// DELETE template
async function deleteTemplate(req, res, id) {
  return authenticate(req, res, async () => {
    try {
      const template = await prisma.codeTemplate.findUnique({ where: { id: parseInt(id) } });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (template.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await prisma.codeTemplate.delete({ where: { id: parseInt(id) } });

      return res.status(200).json({ message: 'Code template deleted successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete template' });
    }
  });
}