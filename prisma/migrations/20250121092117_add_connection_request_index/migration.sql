/*
  Warnings:

  - A unique constraint covering the columns `[fromUserId,toUserId]` on the table `ConnectionRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ConnectionRequest_fromUserId_toUserId_key" ON "ConnectionRequest"("fromUserId", "toUserId");
