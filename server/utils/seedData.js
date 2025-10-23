import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { seedUserChats } from './seedUserData.js';

// Загружаем переменные окружения
dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB:', mongoUri);
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.db.databaseName}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('Clearing existing test user...');
    // Удаляем только тестового пользователя если он существует
    await User.deleteMany({ email: 'test@example.com' });
    
    console.log('Creating test user...');
    // Создаем тестового пользователя
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Test user created:', user.email);
    
    // Создаем тестовые чаты для пользователя
    await seedUserChats(user._id);
    
    console.log('Seed data completed successfully!');
    console.log('Test credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed data error:', error);
    process.exit(1);
  }
};

seedData();