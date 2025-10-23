import axios from 'axios';

export const getRandomQuote = async () => {
  try {
    const response = await axios.get('https://api.quotable.io/random');
    return `${response.data.content} — ${response.data.author}`;
  } catch (error) {
    console.error('Error fetching quote:', error);
    // Fallback quotes
    const fallbackQuotes = [
      'The only true wisdom is in knowing you know nothing. — Socrates',
      'The unexamined life is not worth living. — Socrates',
      'I cannot teach anybody anything. I can only make them think. — Socrates',
      'Be the change that you wish to see in the world. — Mahatma Gandhi'
    ];
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }
};