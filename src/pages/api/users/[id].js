import { hashPassword } from "@/utils/auth";
import prisma from "@/utils/db"

export default async function handler(req, res) {
    let { id } = req.query;
    id = Number(id);
  
    if (!id) {
        return res.status(400).json({ error: "Missing ID" });
    }

    let user;
    try {
        user = await prisma.user.findUnique({
            where: { id },
        });
    } catch (error) {
        return res.status(500).json({ error: "Error finding user." });
    }
    
    if (!user){
        return res.status(404).json({ error: "User not found." });
    }

    // Edit user profile
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    
    const { email, password, firstName, lastName, avatar, phoneNumber, isAdmin } = req.body;

    if (email && email !== user.email) {
        let emailExists;
        try {
            emailExists = await prisma.user.findUnique({
                where: { email },
            });  
        } catch (error) {
            return res.status(404).json({ error: "User not found." });
        }
        if (emailExists) {
            return res.status(409).json({ error: "Update failed, email already in use" });
        }
    }

    const dataToUpdate = {
        email: email || user.email,
        password: password ? await hashPassword(password) : user.password,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        avatar: avatar || user.avatar,
        phoneNumber: phoneNumber || user.phoneNumber,
        isAdmin: isAdmin ?? user.isAdmin,
    };
    
    try{
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: dataToUpdate,
        });
        res.status(200).json({
            "message": "Update Successful",
            "updatedUser": updatedUser
        });
    }catch (error){
        res.status(500).json({ error: "Error updating user profile." });
    }
}