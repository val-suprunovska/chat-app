import Message from '../models/Message.js';
import { getRandomQuote } from '../utils/quotable.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, userId } = data;

        // Save user message
        const userMessage = await Message.create({
          chatId,
          sender: 'user',
          content
        });

        // Emit user message to all clients in the chat room
        io.to(chatId).emit('new_message', userMessage);

        // Auto-reply after 3 seconds
        setTimeout(async () => {
          const quote = await getRandomQuote();
          const systemMessage = await Message.create({
            chatId,
            sender: 'system',
            content: quote
          });

          io.to(chatId).emit('new_message', systemMessage);
        }, 3000);

      } catch (error) {
        console.error('Socket error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};