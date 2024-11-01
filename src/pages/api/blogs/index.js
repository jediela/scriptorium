import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";

export default async function handler(req, res) {
    // Create new blog
    if (req.method === "POST"){
        let user = await authenticate(req, res);

        const { title, content } = req.body;

        if (!title || !content){
            return res.status(400).json({ message: "Please provide all required fields." });
        }
    
        try {
            const newBlog = await prisma.blog.create({
                data: {
                  title,
                  content,
                  userId: user.id,
                },
            });
    
            res.status(200).json({ 
                message: "Blog created successfully", 
                author: user.firstName + " " + user.lastName,
                blog: newBlog 
            });
        } catch (error) {
            res.status(500).json({ error: "Error creating blog." });
        }
    }


}