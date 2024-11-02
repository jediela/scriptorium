import prisma from "@/utils/db"
import { authenticate } from '@/utils/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Get a code template
    await getTemplate(req, res, id);
  } else if (req.method === 'POST') {
    // Update a code template
    await updateTemplate(req, res, id);
  } else if (req.method === 'DELETE') {
    // Delete a code template
    await deleteTemplate(req, res, id);
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// get template (GET)
async function getTemplate(req, res, id) {
  try {
    const template = await prisma.codeTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        tags: true,
        forkedFrom: { select: { id: true, title: true } },
        forks: { select: { id: true, title: true } },
      },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.status(200).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
}

// update template (POST)
async function updateTemplate(req, res, id) {
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
    const template = await prisma.codeTemplate.findUnique({ where: { id: parseInt(id) } });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    if (template.userId !== user.id) {
      res.status(403).json({ error: 'Forbidden' });
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

    res.status(200).json({ message: 'Code template updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update template' });
  }
}

// delete template (DELETE)
async function deleteTemplate(req, res, id) {
  const user = await authenticate(req, res);
  if (!user) {
    return;
  }

  try {
    const template = await prisma.codeTemplate.findUnique({ where: { id: parseInt(id) } });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    if (template.userId !== user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.codeTemplate.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Code template deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
}