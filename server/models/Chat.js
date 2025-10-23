import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Виртуальное поле для полного имени
chatSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Чтобы виртуальные поля включались в JSON
chatSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Chat', chatSchema);