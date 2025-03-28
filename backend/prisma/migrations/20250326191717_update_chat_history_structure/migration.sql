/*
  Warnings:

  - You are about to drop the column `query` on the `chat_history` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `chat_history` table. All the data in the column will be lost.
  - Added the required column `messages` to the `chat_history` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the new messages column as nullable
ALTER TABLE "chat_history" ADD COLUMN "messages" JSONB;

-- Convert existing query/response pairs to messages array
UPDATE "chat_history"
SET "messages" = jsonb_build_array(
  jsonb_build_object('sender', 'user', 'content', "query"),
  jsonb_build_object('sender', 'bot', 'content', "response")
);

-- Make messages column required after data migration
ALTER TABLE "chat_history" ALTER COLUMN "messages" SET NOT NULL;

-- Drop the old columns
ALTER TABLE "chat_history" DROP COLUMN "query",
DROP COLUMN "response";
