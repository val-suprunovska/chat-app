import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { seedUserChats } from '../utils/seedUserData.js';

dotenv.config();

// Проверяем наличие обязательных переменных
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  Google OAuth credentials not found. OAuth will be disabled.');
} else {
  console.log('✅ Google OAuth credentials loaded');
}

const googleStrategyConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback",
  scope: ['profile', 'email'],
  state: true
};

// Проверяем конфигурацию перед созданием стратегии
if (googleStrategyConfig.clientID && googleStrategyConfig.clientSecret) {
  passport.use(new GoogleStrategy(
    googleStrategyConfig,
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔐 Google OAuth profile received:', profile.id);
        
        // Ищем пользователя по googleId или email
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        });
        
        if (user) {
          console.log('✅ Existing user found:', user.email);
          // Обновляем googleId если его не было
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
            console.log('🔄 Added Google ID to existing user');
          }
          return done(null, user);
        }
        
        // Создаем нового пользователя
        console.log('👤 Creating new user from Google OAuth');
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          password: Math.random().toString(36).slice(-16) + Math.random().toString(36).slice(-16), // Более надежный пароль
          name: profile.displayName,
          avatar: profile.photos[0]?.value
        });
        
        console.log('✅ New user created:', user.email);
        
        // Создаем тестовые чаты
        await seedUserChats(user._id);
        console.log('✅ Test chats created for new user');
        
        return done(null, user);
      } catch (error) {
        console.error('❌ Google OAuth error:', error);
        return done(error, null);
      }
    }
  ));
} else {
  console.warn('🚫 Google OAuth strategy not initialized due to missing credentials');
}

// Упрощенные сериализации
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;