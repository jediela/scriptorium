import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    // Create tag
    if(req.method === "POST"){
        const { name } = req.body;
        try {
            const existingTag = await prisma.tag.findUnique({ where: {name}});
            if(existingTag) return res.status(400).json({ message: "Tag already exists "}); 
            const newTag = await prisma.tag.create({
                data: {
                    name,
                },
            });
            return res.status(201).json(newTag);
        } catch (error) {
            return res.status(500).json({ message: "Error creating tag" });
        }
    }
    // Get tags
    else if(req.method === "GET"){
        try {
            const tags = await prisma.tag.findMany();
            return res.status(200).json(tags);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error fetching tags" });
        }
    }
    return res.status(405).json({ message: "Method not allowed" })
}