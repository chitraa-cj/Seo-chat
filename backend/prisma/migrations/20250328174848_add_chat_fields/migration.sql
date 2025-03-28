-- AlterTable
ALTER TABLE "chat_history" ADD COLUMN     "lastMessage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'New Chat';

-- CreateIndex
CREATE INDEX "chat_history_userId_lastMessage_idx" ON "chat_history"("userId", "lastMessage");
