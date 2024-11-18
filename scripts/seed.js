import bcrypt from 'bcryptjs';
import { db } from '../src/db/index.js';
import { users, dreams, dreamSymbols } from '../src/db/schema.js';
import { createId } from '../src/utils/ids.js';

console.log('Seeding database...');

// Create demo user
console.log('Creating demo user...');
const userId = createId();
const hashedPassword = await bcrypt.hash('demo123', 12);

await db.insert(users).values({
  id: userId,
  username: 'demo',
  email: 'demo@example.com',
  passwordHash: hashedPassword,
  bio: 'A dream explorer',
  preferencesJson: JSON.stringify({
    theme: 'dark',
    emailNotifications: true,
    dreamReminders: true,
  }),
});

// Create sample dreams
console.log('Creating sample dreams...');
const dreamId = createId();

await db.insert(dreams).values({
  id: dreamId,
  userId,
  title: 'The Enchanted Forest',
  content: 'I found myself wandering through a luminescent forest...',
  mood: 'mystical',
  lucidity: 7,
  metadataJson: JSON.stringify({
    location: 'forest',
    timeOfNight: 'midnight',
    emotions: ['wonder', 'curiosity'],
    weather: 'clear',
  }),
});

// Create dream symbols
console.log('Creating dream symbols...');
await db.insert(dreamSymbols).values({
  id: createId(),
  dreamId,
  name: 'Forest',
  category: 'Nature',
  meaning: 'Represents the unconscious mind and hidden wisdom',
  archetype: 'The Unknown',
  frequency: 1,
});

console.log('Seeding completed successfully!');
