import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import session from 'express-session'; 

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chats.js';
import messageRoutes from './routes/messages.js';
import { connectDB } from './utils/database.js';
import Chat from './models/Chat.js';
import Message from './models/Message.js';
import { getRandomQuote } from './utils/quotable.js';
import passport from './config/passport.js'

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Настройка CORS
const corsOptions = {
  origin: [ process.env.CLIENT_URL || "http://localhost:5173", "https://*.vercel.app", "https://chat-app-phi-amber.vercel.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Логирование запросов для отладки
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware для добавления io в запросы
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io с правильными CORS настройками
const io = new Server(httpServer, {
  cors: corsOptions
});

// Middleware для аутентификации Socket.io
io.use(async (socket, next) => {
  try {
    console.log('Socket middleware - client connected:', socket.id);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Обработчики Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Присоединение к комнате чата
  socket.on('join_chat', (chatId) => {
    console.log(`User ${socket.id} joined chat: ${chatId}`);
    socket.join(chatId);
  });

  // Отправка сообщения
  socket.on('send_message', async (data) => {
    try {
      console.log('=== SOCKET: send_message received ===');
      console.log('Data:', data);
      
      const { chatId, content, userId } = data;

      if (!chatId || !content) {
        console.log('Missing chatId or content');
        socket.emit('error', { message: 'Missing chatId or content' });
        return;
      }

      // Проверяем существование чата
      const chat = await Chat.findById(chatId);
      if (!chat) {
        console.log('Chat not found:', chatId);
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      console.log('Creating user message...');
      // Создаем сообщение пользователя
      const userMessage = await Message.create({
        chatId,
        sender: 'user',
        content: content.trim()
      });

      // Добавляем сообщение в чат
      await Chat.findByIdAndUpdate(chatId, {
        $push: { messages: userMessage._id },
        $set: { updatedAt: new Date() }
      });

      console.log('User message created:', userMessage._id);

      // Отправляем сообщение всем в комнате чата
      io.to(chatId).emit('new_message', userMessage);
      console.log('User message broadcasted to room:', chatId);

      // Авто-ответ через 3 секунды
      setTimeout(async () => {
        try {
          console.log('=== AUTO-REPLY TRIGGERED ===');
          const quote = await getRandomQuote();
          console.log('Generated quote:', quote);
          
          const systemMessage = await Message.create({
            chatId,
            sender: 'system',
            content: quote
          });

          console.log('System message created:', systemMessage._id);

          // Добавляем системное сообщение в чат
          await Chat.findByIdAndUpdate(chatId, {
            $push: { messages: systemMessage._id },
            $set: { updatedAt: new Date() }
          });

          // Отправляем системное сообщение через Socket.io
          io.to(chatId).emit('new_message', systemMessage);
          console.log('System message broadcasted to room:', chatId);
          
        } catch (error) {
          console.error('Error creating auto-reply:', error);
          // Отправляем ошибку обратно клиенту
          socket.emit('error', { message: 'Ошибка при создании автоответа' });
        }
      }, 3000);

    } catch (error) {
      console.error('Error in send_message handler:', error);
      socket.emit('error', { 
        message: 'Ошибка при отправке сообщения. Попробуйте еще раз' 
      });
    }
  });

  // В обработчике send_message добавляем больше логирования:
socket.on('send_message', async (data) => {
  try {
    console.log('=== SOCKET: send_message received ===');
    console.log('Data:', data);
    
    const { chatId, content, userId } = data;

    if (!chatId || !content) {
      console.log('Missing chatId or content');
      socket.emit('error', { message: 'Отсутствует ID чата или сообщение' });
      return;
    }

    console.log('Looking for chat:', chatId);
    // Проверяем существование чата
    const chat = await Chat.findById(chatId);
    console.log('Chat found:', chat ? 'yes' : 'no');
    
    if (!chat) {
      console.log('Chat not found:', chatId);
      socket.emit('error', { message: 'Чат не найден' });
      return;
    }

    console.log('Creating user message...');
    // Создаем сообщение пользователя
    const userMessage = await Message.create({
      chatId,
      sender: 'user',
      content: content.trim()
    });

    console.log('User message created successfully:', userMessage._id);

    // Добавляем сообщение в чат
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: userMessage._id }
    });

    console.log('Message added to chat');

    // Отправляем сообщение всем в комнате чата
    io.to(chatId).emit('new_message', userMessage);
    console.log('User message broadcasted to room:', chatId);

    // Авто-ответ через 3 секунды
    setTimeout(async () => {
      try {
        console.log('=== AUTO-REPLY TRIGGERED ===');
        const quote = await getRandomQuote();
        console.log('Generated quote:', quote);
        
        const systemMessage = await Message.create({
          chatId,
          sender: 'system',
          content: quote
        });

        console.log('System message created:', systemMessage._id);

        // Добавляем системное сообщение в чат
        await Chat.findByIdAndUpdate(chatId, {
          $push: { messages: systemMessage._id }
        });

        // Отправляем системное сообщение через Socket.io
        io.to(chatId).emit('new_message', systemMessage);
        console.log('System message broadcasted to room:', chatId);
        
      } catch (error) {
        console.error('Error creating auto-reply:', error);
        socket.emit('error', { message: 'Ошибка при создании автоответа' });
      }
    }, 3000);

  } catch (error) {
    console.error('Error in send_message handler:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    socket.emit('error', { 
      message: 'Ошибка при отправке сообщения. Попробуйте еще раз' 
    });
  }
});

  // Выход из комнаты чата
  socket.on('leave_chat', (chatId) => {
    console.log(`User ${socket.id} left chat: ${chatId}`);
    socket.leave(chatId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: 'Что-то пошло не так!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS enabled for: ${corsOptions.origin}`);
    console.log('Socket.io handlers are ready!');
  });
});