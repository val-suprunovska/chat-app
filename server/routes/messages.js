import express from 'express';
import { protect } from '../middleware/auth.js';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { getRandomQuote } from '../utils/quotable.js';

const router = express.Router();

router.use(protect);

// Get messages for chat
router.get('/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findOne({ 
      _id: req.params.chatId, 
      userId: req.user._id 
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await Message.find({ chatId: req.params.chatId })
      .sort({ createdAt: 1 });

    console.log(`Found ${messages.length} messages for chat ${req.params.chatId}`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:chatId', async (req, res) => {
  try {
    const { content } = req.body;
    const chatId = req.params.chatId;
    const io = req.io; // Получаем io из запроса

    console.log('=== SENDING MESSAGE ===');
    console.log('Chat ID:', chatId);
    console.log('User ID:', req.user._id);
    console.log('Content:', content);

    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      console.log('Chat not found');
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!content || content.trim() === '') {
      console.log('Empty content');
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Create user message
    const userMessage = await Message.create({
      chatId,
      sender: 'user',
      content: content.trim()
    });

    console.log('User message created:', userMessage._id);

    // Добавляем сообщение в чат
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: userMessage._id }
    });

    console.log('Message added to chat');

    // Отправляем сообщение через Socket.io всем в комнате чата
    if (io) {
      io.to(chatId).emit('new_message', userMessage);
      console.log('User message broadcasted via Socket.io');
    }

    res.json(userMessage);

    // Auto-reply after 3 seconds
    console.log('Setting up auto-reply timer...');
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
        if (io) {
          io.to(chatId).emit('new_message', systemMessage);
          console.log('System message broadcasted via Socket.io');
        }

      } catch (error) {
        console.error('Error creating auto-reply:', error);
      }
    }, 3000);

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update message
router.put('/:messageId', async (req, res) => {
  try {
    const { content } = req.body;
    const messageId = req.params.messageId;
    const io = req.io; // Получаем io из запроса

    console.log('=== UPDATING MESSAGE ===');
    console.log('Message ID:', messageId);
    console.log('New content:', content);
    console.log('User ID:', req.user._id);

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Находим сообщение
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Проверяем что пользователь имеет доступ к чату этого сообщения
    const chat = await Chat.findOne({ 
      _id: message.chatId, 
      userId: req.user._id 
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Проверяем что сообщение от пользователя (нельзя редактировать системные)
    if (message.sender !== 'user') {
      return res.status(403).json({ message: 'Can only edit user messages' });
    }

    // Обновляем сообщение
    message.content = content.trim();
    message.updatedAt = new Date();
    await message.save();

    console.log('Message updated successfully:', messageId);

    // Отправляем обновленное сообщение через Socket.io
    if (io) {
      io.to(message.chatId).emit('message_updated', message);
      console.log('Message update broadcasted via Socket.io');
    }

    res.json(message);

  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;