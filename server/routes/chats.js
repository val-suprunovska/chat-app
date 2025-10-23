import express from 'express';
import { protect } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { ensureUserHasChats } from '../utils/seedUserData.js';

const router = express.Router();

router.use(protect);

// Get all chats for user
router.get('/', async (req, res) => {
  try {
    console.log('Fetching chats for user:', req.user._id);
    
    // Убеждаемся что у пользователя есть чаты
    await ensureUserHasChats(req.user._id);
    
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    console.log(`Found ${chats.length} chats`);

    // Затем для каждого чата получаем сообщения
    const chatsWithMessages = await Promise.all(
      chats.map(async (chat) => {
        console.log(`Fetching messages for chat: ${chat._id}`);
        
        const messages = await Message.find({ chatId: chat._id })
          .sort({ createdAt: 1 })
          .limit(50);
        
        console.log(`Found ${messages.length} messages for chat ${chat._id}`);

        return {
          _id: chat._id,
          userId: chat.userId,
          firstName: chat.firstName,
          lastName: chat.lastName,
          messages: messages,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        };
      })
    );

    res.json(chatsWithMessages);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ 
      message: 'Ошибка при загрузке чатов. Пожалуйста, попробуйте позже' 
    });
  }
});

// Create new chat
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ 
        message: 'Пожалуйста, укажите имя и фамилию собеседника' 
      });
    }

    if (firstName.trim().length < 1 || lastName.trim().length < 1) {
      return res.status(400).json({ 
        message: 'Имя и фамилия не могут быть пустыми' 
      });
    }

    const chat = await Chat.create({
      userId: req.user._id,
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });

    res.status(201).json({
      _id: chat._id,
      userId: chat.userId,
      firstName: chat.firstName,
      lastName: chat.lastName,
      messages: [],
      createdAt: chat.createdAt
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ 
      message: 'Ошибка при создании чата. Пожалуйста, попробуйте позже' 
    });
  }
});

// Update chat
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({ 
        message: 'Чат не найден' 
      });
    }

    if (firstName && firstName.trim().length < 1) {
      return res.status(400).json({ 
        message: 'Имя не может быть пустым' 
      });
    }

    if (lastName && lastName.trim().length < 1) {
      return res.status(400).json({ 
        message: 'Фамилия не может быть пустой' 
      });
    }

    if (firstName) chat.firstName = firstName.trim();
    if (lastName) chat.lastName = lastName.trim();

    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ 
      message: 'Ошибка при обновлении чата. Пожалуйста, попробуйте позже' 
    });
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  try {
    // Сначала удаляем все сообщения чата
    await Message.deleteMany({ chatId: req.params.id });
    
    // Затем удаляем сам чат
    const chat = await Chat.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!chat) {
      return res.status(404).json({ 
        message: 'Чат не найден' 
      });
    }

    res.json({ message: 'Чат успешно удален' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ 
      message: 'Ошибка при удалении чата. Пожалуйста, попробуйте позже' 
    });
  }
});

export default router;