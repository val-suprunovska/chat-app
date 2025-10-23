import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { seedUserChats } from '../utils/seedUserData.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', { 
    expiresIn: '30d' 
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Registration attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Пожалуйста, заполните все поля: email и пароль' 
      });
    }

    // валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Пожалуйста, введите корректный email адрес' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Пароль должен содержать не менее 6 символов' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email уже зарегистрирован' 
      });
    }

    console.log('Creating user...');
    const user = await User.create({ email, password });
    console.log('User created:', user._id);

    // АВТОМАТИЧЕСКИ СОЗДАЕМ ТЕСТОВЫЕ ЧАТЫ ДЛЯ НОВОГО ПОЛЬЗОВАТЕЛЯ
    console.log('Creating test chats for new user...');
    await seedUserChats(user._id);
    console.log('Test chats created successfully');

    res.status(201).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Обработка ошибок MongoDB
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Ошибка валидации данных' 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email уже существует' 
      });
    }
    
    res.status(500).json({ 
      message: 'Ошибка сервера при регистрации. Пожалуйста, попробуйте позже' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Пожалуйста, введите email и пароль' 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ 
        message: 'Пользователь с таким email не найден' 
      });
    }

    const isPasswordValid = await user.correctPassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Неверный пароль' 
      });
    }

    console.log('Password correct');
    res.json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Ошибка сервера при входе. Пожалуйста, попробуйте позже' 
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Токен не предоставлен' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Пользователь не найден' 
      });
    }

    res.json({
      _id: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Недействительный токен' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Срок действия токена истек' 
      });
    }
    
    res.status(401).json({ 
      message: 'Ошибка проверки токена' 
    });
  }
});

export default router;