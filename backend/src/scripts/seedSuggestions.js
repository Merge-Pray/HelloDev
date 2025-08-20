import mongoose from 'mongoose';
import Suggestion from '../models/Suggestion.js';
import { normalizeText, generateAliases } from '../utils/textNormalization.js';
import 'dotenv/config';

const INITIAL_DATA = {
  programmingLanguages: [
    { value: 'JavaScript', usageCount: 150, popularRank: 1, isPopular: true, isVerified: true },
    { value: 'Python', usageCount: 140, popularRank: 2, isPopular: true, isVerified: true },
    { value: 'TypeScript', usageCount: 120, popularRank: 3, isPopular: true, isVerified: true },
    { value: 'Java', usageCount: 110, popularRank: 4, isPopular: true, isVerified: true },
    { value: 'C++', usageCount: 85, popularRank: 5, isPopular: true, isVerified: true },
    { value: 'C#', usageCount: 80, popularRank: 6, isPopular: true, isVerified: true },
    { value: 'Go', usageCount: 75, popularRank: 7, isPopular: true, isVerified: true },
    { value: 'Rust', usageCount: 65, popularRank: 8, isPopular: true, isVerified: true },
    { value: 'Swift', usageCount: 55, popularRank: 9, isPopular: true, isVerified: true },
    { value: 'PHP', usageCount: 50, popularRank: 10, isPopular: true, isVerified: true }
  ],
  techStack: [
    { value: 'React', usageCount: 180, popularRank: 1, isPopular: true, isVerified: true },
    { value: 'Node.js', usageCount: 170, popularRank: 2, isPopular: true, isVerified: true },
    { value: 'MongoDB', usageCount: 150, popularRank: 3, isPopular: true, isVerified: true },
    { value: 'Express', usageCount: 140, popularRank: 4, isPopular: true, isVerified: true },
    { value: 'PostgreSQL', usageCount: 130, popularRank: 5, isPopular: true, isVerified: true },
    { value: 'Docker', usageCount: 120, popularRank: 6, isPopular: true, isVerified: true },
    { value: 'Vue.js', usageCount: 110, popularRank: 7, isPopular: true, isVerified: true },
    { value: 'AWS', usageCount: 100, popularRank: 8, isPopular: true, isVerified: true },
    { value: 'Next.js', usageCount: 90, popularRank: 9, isPopular: true, isVerified: true },
    { value: 'Django', usageCount: 80, popularRank: 10, isPopular: true, isVerified: true }
  ],
  techArea: [
    { value: 'Web Development', usageCount: 50, popularRank: 1, isPopular: true, isVerified: true },
    { value: 'Mobile Development', usageCount: 45, popularRank: 2, isPopular: true, isVerified: true },
    { value: 'Game Development', usageCount: 40, popularRank: 3, isPopular: true, isVerified: true },
    { value: 'Artificial Intelligence / Machine Learning', usageCount: 38, popularRank: 4, isPopular: true, isVerified: true },
    { value: 'Data Science & Analytics', usageCount: 35, popularRank: 5, isPopular: true, isVerified: true },
    { value: 'Cybersecurity', usageCount: 32, popularRank: 6, isPopular: true, isVerified: true },
    { value: 'Cloud Computing', usageCount: 30, popularRank: 7, isPopular: true, isVerified: true },
    { value: 'DevOps & IT Operations', usageCount: 28, popularRank: 8, isPopular: true, isVerified: true },
    { value: 'Blockchain & Web3', usageCount: 25, popularRank: 9, isPopular: true, isVerified: true },
    { value: 'IT Support', usageCount: 22, popularRank: 10, isPopular: true, isVerified: true }
  ],
  languages: [
    { value: 'English', usageCount: 50, popularRank: 1, isPopular: true, isVerified: true },
    { value: 'German', usageCount: 25, popularRank: 2, isPopular: true, isVerified: true },
    { value: 'Spanish', usageCount: 20, popularRank: 3, isPopular: true, isVerified: true },
    { value: 'French', usageCount: 15, popularRank: 4, isPopular: true, isVerified: true },
    { value: 'Mandarin', usageCount: 12, popularRank: 5, isPopular: true, isVerified: true }
  ],
  otherInterests: [
    { value: 'Reading', usageCount: 30, popularRank: 1, isPopular: true, isVerified: true },
    { value: 'Music', usageCount: 28, popularRank: 2, isPopular: true, isVerified: true },
    { value: 'Travel', usageCount: 25, popularRank: 3, isPopular: true, isVerified: true },
    { value: 'Photography', usageCount: 22, popularRank: 4, isPopular: true, isVerified: true },
    { value: 'Gaming', usageCount: 20, popularRank: 5, isPopular: true, isVerified: true }
  ]
};

async function seedSuggestions() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log('Connected to MongoDB');

    await Suggestion.deleteMany({});
    console.log('Cleared existing suggestions');

    for (const [category, items] of Object.entries(INITIAL_DATA)) {
      for (const item of items) {
        const normalizedValue = normalizeText(item.value);
        const aliases = generateAliases(item.value);

        await Suggestion.create({
          value: item.value,
          normalizedValue,
          category,
          usageCount: item.usageCount,
          isPopular: item.isPopular,
          popularRank: item.popularRank,
          aliases,
          isVerified: item.isVerified
        });
      }
      console.log(`Seeded ${items.length} ${category} suggestions`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedSuggestions();