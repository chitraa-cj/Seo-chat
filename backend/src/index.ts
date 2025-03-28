import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';

export { AuthClient } from './client';

// Load environment variables
dotenv.config();

const app = express();

// Validate CORS origin
const validateOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) {
    // Allow requests with no origin (like mobile apps or curl requests)
    callback(null, true);
    return;
  }

  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL].filter(Boolean) // Remove undefined/empty values
    : ['http://localhost:3000'];

  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

// Middleware
app.use(cors({
  origin: validateOrigin,
  methods: ['GET', 'POST'], // Only allow needed methods
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight request for 24 hours
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  const errorMessage = err instanceof Error ? err.message : 'Something went wrong!';
  res.status(500).json({ message: errorMessage });
});

const PORT = process.env.PORT || 5001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app; 