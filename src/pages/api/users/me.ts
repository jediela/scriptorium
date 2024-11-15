import { authenticate } from "@/utils/auth";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== "GET"){
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const user = await authenticate(req, res);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}