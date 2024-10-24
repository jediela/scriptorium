/*
  Warnings:

  - You are about to drop the column `codeTemplateId` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CodeTemplateToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CodeTemplateToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "CodeTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CodeTemplateToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_BlogToCodeTemplate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BlogToCodeTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "Blog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlogToCodeTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "CodeTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_BlogToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BlogToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Blog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlogToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Blog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "reportsNum" INTEGER NOT NULL DEFAULT 0,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Blog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Blog" ("content", "createdAt", "description", "id", "isHidden", "reportsNum", "title", "updatedAt", "userId", "votes") SELECT "content", "createdAt", "description", "id", "isHidden", "reportsNum", "title", "updatedAt", "userId", "votes" FROM "Blog";
DROP TABLE "Blog";
ALTER TABLE "new_Blog" RENAME TO "Blog";
CREATE TABLE "new_CodeTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isFork" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "forkedFromId" INTEGER,
    CONSTRAINT "CodeTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CodeTemplate_forkedFromId_fkey" FOREIGN KEY ("forkedFromId") REFERENCES "CodeTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CodeTemplate" ("code", "createdAt", "explanation", "id", "title", "updatedAt", "userId") SELECT "code", "createdAt", "explanation", "id", "title", "updatedAt", "userId" FROM "CodeTemplate";
DROP TABLE "CodeTemplate";
ALTER TABLE "new_CodeTemplate" RENAME TO "CodeTemplate";
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "codeTemplateId" INTEGER,
    "blogPostId" INTEGER,
    "parentCommentId" INTEGER,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_codeTemplateId_fkey" FOREIGN KEY ("codeTemplateId") REFERENCES "CodeTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comment_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "Blog" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("blogPostId", "codeTemplateId", "content", "createdAt", "id", "isHidden", "userId", "votes") SELECT "blogPostId", "codeTemplateId", "content", "createdAt", "id", "isHidden", "userId", "votes" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "phoneNumber" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("avatar", "email", "firstName", "id", "lastName", "password", "phoneNumber") SELECT "avatar", "email", "firstName", "id", "lastName", "password", "phoneNumber" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CodeTemplateToTag_AB_unique" ON "_CodeTemplateToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_CodeTemplateToTag_B_index" ON "_CodeTemplateToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlogToCodeTemplate_AB_unique" ON "_BlogToCodeTemplate"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogToCodeTemplate_B_index" ON "_BlogToCodeTemplate"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlogToTag_AB_unique" ON "_BlogToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogToTag_B_index" ON "_BlogToTag"("B");
