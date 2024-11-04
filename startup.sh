#!/bin/bash

echo "Installing dependencies..."
npm install

echo "Running database migrations..."
npx prisma migrate dev

echo "Creating admin user..."
node -e "
   const { PrismaClient } = require('@prisma/client');
   const bcrypt = require('bcrypt');
   const prisma = new PrismaClient();
   
   const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);

   async function createAdminUser() {
      try {
         const existingUser = await prisma.user.findUnique({
            where: { email: 'admin@example.com' }
         });
         if (existingUser) {
            console.log('Admin user already exists.');
            return;
         }
         const hashedPassword = await bcrypt.hash('password', BCRYPT_SALT_ROUNDS);
         await prisma.user.create({
            data: {
               email: 'admin@example.com',
               password: hashedPassword,
               firstName: 'Admin',
               lastName: 'User',
               isAdmin: true
            }
         });
         console.log('Admin user created successfully.');
      } catch (error) {
         console.error('Error creating admin user:', error);
      }
   }

   createAdminUser();
"

echo "Setup complete."
