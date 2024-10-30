import prisma from "@/utils/db"
import authenticate from '@/utils/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Viewing and Searching Templates (User Story 7)
    return getTemplates(req, res);
  } else if (req.method === 'POST') {
    // Saving Code as Templates (User Story 6)
    return createTemplate(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// GET /api/templates
async function getTemplates(req, res) {
  const { search, tags, page = 1, limit = 10, userId } = req.query;
  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  let where = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { explanation: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (tags) {
    const tagList = tags.split(',');
    where.tags = {
      some: {
        name: { in: tagList },
      },
    };
  }

  if (userId) {
    where.userId = parseInt(userId);
  }

  try {
    const totalItems = await prisma.codeTemplate.count({ where });
    const templates = await prisma.codeTemplate.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      templates,
      pagination: {
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(totalItems / take),
        totalItems,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch templates' });
  }
}

// POST /api/templates
async function createTemplate(req, res) {
  // Authenticate the user
  return authenticate(req, res, async () => {
    const { title, explanation, code, tags, isFork, forkedFromId } = req.body;

    if (!title || !code) {
      return res.status(400).json({ error: 'Title and code are required' });
    }

    try {
      // Handle tags
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

      const data = {
        title,
        explanation,
        code,
        isFork: isFork || false,
        user: { connect: { id: req.user.id } },
        tags: {
          connect: tagRecords.map((tag) => ({ id: tag.id })),
        },
      };

      if (isFork && forkedFromId) {
        data.forkedFrom = { connect: { id: forkedFromId } };
      }

      const template = await prisma.codeTemplate.create({ data });

      return res.status(201).json({
        id: template.id,
        message: 'Code template created successfully.',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create template' });
    }
  });
}
