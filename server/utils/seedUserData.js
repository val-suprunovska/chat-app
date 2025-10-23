import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export const seedUserChats = async (userId) => {
  try {
    console.log('Seeding test chats for user:', userId);

    // Проверяем, есть ли уже чаты у пользователя
    const existingChats = await Chat.find({ userId });
    if (existingChats.length > 0) {
      console.log('User already has chats, skipping seed');
      return true;
    }

    // Создаем тестовые чаты для нового пользователя
    const chat1 = await Chat.create({
      userId: userId,
      firstName: 'Иван',
      lastName: 'Петров'
    });
    
    const chat2 = await Chat.create({
      userId: userId,
      firstName: 'Мария',
      lastName: 'Сидорова'
    });
    
    const chat3 = await Chat.create({
      userId: userId,
      firstName: 'Алексей',
      lastName: 'Козлов'
    });

    console.log('Test chats created for user:', userId);

    // Создаем тестовые сообщения
    const messages = await Message.create([
      {
        chatId: chat1._id,
        sender: 'user',
        content: 'Привет! Как дела?',
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        chatId: chat1._id,
        sender: 'system',
        content: 'The only true wisdom is in knowing you know nothing. — Socrates',
        createdAt: new Date(Date.now() - 3500000)
      },
      {
        chatId: chat2._id,
        sender: 'user',
        content: 'Какие планы на выходные?',
        createdAt: new Date(Date.now() - 7200000)
      },
      {
        chatId: chat2._id,
        sender: 'system',
        content: 'The only way to do great work is to love what you do. — Steve Jobs',
        createdAt: new Date(Date.now() - 7100000)
      },
      {
        chatId: chat3._id,
        sender: 'system',
        content: 'In three words I can sum up everything I have learned about life: it goes on. — Robert Frost',
        createdAt: new Date(Date.now() - 10800000)
      }
    ]);

    // Обновляем чаты с ссылками на сообщения
    await Chat.findByIdAndUpdate(chat1._id, { 
      $push: { messages: { $each: [messages[0]._id, messages[1]._id] } } 
    });
    
    await Chat.findByIdAndUpdate(chat2._id, { 
      $push: { messages: { $each: [messages[2]._id, messages[3]._id] } } 
    });
    
    await Chat.findByIdAndUpdate(chat3._id, { 
      $push: { messages: { $each: [messages[4]._id] } } 
    });

    console.log('Test messages created for user:', userId);
    return true;
  } catch (error) {
    console.error('Error seeding user chats:', error);
    return false;
  }
};

// Функция для проверки и создания чатов если их нет
export const ensureUserHasChats = async (userId) => {
  try {
    const chatCount = await Chat.countDocuments({ userId });
    if (chatCount === 0) {
      console.log('User has no chats, creating default chats...');
      await seedUserChats(userId);
    }
    return true;
  } catch (error) {
    console.error('Error ensuring user has chats:', error);
    return false;
  }
};