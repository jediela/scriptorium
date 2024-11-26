#!/bin/bash

echo "Installing dependencies..."
npm install

docker build -t python-executor ./docker/python
docker build -t node-executor ./docker/node
docker build -t java-executor ./docker/java
docker build -t cpp-executor ./docker/cpp
docker build -t csharp-executor ./docker/csharp
docker build -t php-executor ./docker/php
docker build -t swift-executor ./docker/swift
docker build -t rust-executor ./docker/rust
docker build -t r-executor ./docker/r
docker build -t perl-executor ./docker/perl
docker build -t d-executor ./docker/d
docker build -t haskell-executor ./docker/haskell
docker build -t dart-executor ./docker/dart

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
