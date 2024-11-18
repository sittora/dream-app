import { db } from '../src/db';
import { users, dreams, dreamSymbols } from '../src/db/schema';
import { hashPassword } from '../src/utils/auth';
import { createId } from '../src/utils/ids';

async function seed() {
  console.log('Seeding database...');

  // Create demo user
  const demoUser = {
    id: createId(),
    username: 'demo',
    email: 'demo@animainsights.com',
    passwordHash: await hashPassword('Demo123!@#'),
    bio: 'A curious dream explorer',
    preferencesJson: JSON.stringify({
      language: 'en',
      timezone: 'UTC',
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        promotions: true,
        security: true,
        updates: true
      }
    }),
    role: 'user',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  console.log('Creating demo user...');
  await db.insert(users).values(demoUser);

  // Create sample dreams
  const sampleDreams = [
    {
      id: createId(),
      userId: demoUser.id,
      title: 'Flying Over the City',
      content: 'I found myself soaring over a beautiful cityscape at night. The lights below twinkled like stars, and I felt completely free.',
      language: 'en',
      mood: 'Peaceful',
      lucidity: 8,
      visibility: 'private',
      metadataJson: JSON.stringify({
        location: 'City',
        weather: 'Clear night',
        sleepQuality: 9,
        sleepDuration: 8
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: createId(),
      userId: demoUser.id,
      title: 'Ocean Depths',
      content: 'I was swimming in deep, crystal-clear waters. Marine life of all colors surrounded me, and I could breathe underwater.',
      language: 'en',
      mood: 'Curious',
      lucidity: 6,
      visibility: 'private',
      metadataJson: JSON.stringify({
        location: 'Ocean',
        weather: 'Unknown',
        sleepQuality: 8,
        sleepDuration: 7.5
      }),
      createdAt: new Date(Date.now() - 86400000), // Yesterday
      updatedAt: new Date(Date.now() - 86400000),
    },
  ];

  console.log('Creating sample dreams...');
  await db.insert(dreams).values(sampleDreams);

  // Create dream symbols
  const dreamSymbolsData = [
    {
      id: createId(),
      dreamId: sampleDreams[0].id,
      name: 'Flying',
      category: 'Action',
      meaning: 'Freedom, transcendence, escape from limitations',
      archetype: 'Freedom',
      frequency: 1,
      createdAt: new Date(),
    },
    {
      id: createId(),
      dreamId: sampleDreams[0].id,
      name: 'City Lights',
      category: 'Environment',
      meaning: 'Civilization, social connection, human achievement',
      archetype: 'Community',
      frequency: 1,
      createdAt: new Date(),
    },
    {
      id: createId(),
      dreamId: sampleDreams[1].id,
      name: 'Ocean',
      category: 'Environment',
      meaning: 'Unconscious mind, emotions, depth of experience',
      archetype: 'Great Mother',
      frequency: 1,
      createdAt: new Date(),
    },
    {
      id: createId(),
      dreamId: sampleDreams[1].id,
      name: 'Breathing Underwater',
      category: 'Action',
      meaning: 'Adaptation, comfort with emotions, spiritual connection',
      archetype: 'Transformation',
      frequency: 1,
      createdAt: new Date(),
    },
  ];

  console.log('Creating dream symbols...');
  await db.insert(dreamSymbols).values(dreamSymbolsData);

  console.log('Seeding completed successfully!');
}

// Run the seed function
seed().catch(error => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
