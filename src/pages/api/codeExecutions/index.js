import { executeCode } from '@/utils/executeCode';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { language, code, input } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: 'Language and code are required' });
  }

  try {
    const output = await executeCode(language, code, input || '');
    return res.status(200).json({ output });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}