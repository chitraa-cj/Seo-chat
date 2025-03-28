import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Store a new chat message
router.post('/history', authenticate, async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    console.log('Received chat history request:', {
      headers: req.headers,
      body: req.body,
      user: req.user
    });

    const { messages, reportId, chatId } = req.body;
    if (!req.user?.id) {
      console.error('No user ID found in request');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Missing or invalid messages:', messages);
      res.status(400).json({ error: 'Missing or invalid messages' });
      return;
    }

    console.log('Storing chat history for user:', req.user.id);
    console.log('Chat data:', { messages, reportId, chatId });

    let chatHistory;
    if (chatId) {
      // Update existing chat
      chatHistory = await prisma.chatHistory.update({
        where: { id: chatId },
        data: {
          messages: messages as Prisma.InputJsonValue,
          lastMessage: new Date(),
          reportId,
        },
      });
    } else {
      // Create new chat
      const title = messages[0].content.substring(0, 50) + (messages[0].content.length > 50 ? '...' : '');
      chatHistory = await prisma.chatHistory.create({
        data: {
          userId: req.user.id,
          title,
          messages: messages as Prisma.InputJsonValue,
          reportId,
          lastMessage: new Date(),
        },
      });
    }

    console.log('Successfully stored chat history:', chatHistory);
    res.json(chatHistory);
  } catch (error) {
    console.error('Error storing chat history:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: 'Failed to store chat history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get chat history for the authenticated user
router.get('/history', authenticate, async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    console.log('Fetching chat history for user:', req.user.id);

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [chats, total] = await Promise.all([
      prisma.chatHistory.findMany({
        where: { userId: req.user.id },
        orderBy: { lastMessage: 'desc' },
        skip,
        take,
        select: {
          id: true,
          title: true,
          lastMessage: true,
          createdAt: true,
          reportId: true,
        },
      }),
      prisma.chatHistory.count({
        where: { userId: req.user.id },
      }),
    ]);

    console.log(`Found ${total} chats for user ${req.user.id}`);
    console.log('First chat:', chats[0]);

    res.json({
      chats,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Get a specific chat by ID
router.get('/history/:id', authenticate, async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const chatId = req.params.id;
    console.log('Fetching chat:', chatId, 'for user:', req.user.id);

    const chat = await prisma.chatHistory.findFirst({
      where: { 
        id: chatId,
        userId: req.user.id 
      },
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

export default router; 