import "dotenv/config";
import db from "../db/db.js";
import Suggestion from "../models/Suggestion.js";
import { normalizeText } from "../utils/textNormalization.js";

const seedData = {
  programmingLanguages: [
    { value: 'JavaScript', aliases: ['js', 'ecmascript'], usageCount: 1500 },
    { value: 'Python', aliases: ['py'], usageCount: 1400 },
    { value: 'TypeScript', aliases: ['ts'], usageCount: 1200 },
    { value: 'Java', aliases: [], usageCount: 1100 },
    { value: 'C++', aliases: ['cpp', 'cplusplus'], usageCount: 1000 },
    { value: 'C#', aliases: ['csharp', 'cs'], usageCount: 950 },
    { value: 'Go', aliases: ['golang'], usageCount: 900 },
    { value: 'Rust', aliases: [], usageCount: 850 },
    { value: 'PHP', aliases: [], usageCount: 800 },
    { value: 'Swift', aliases: [], usageCount: 750 }
  ],
  
  techStack: [
    { value: 'React', aliases: ['reactjs'], usageCount: 1300 },
    { value: 'Node.js', aliases: ['nodejs', 'node'], usageCount: 1250 },
    { value: 'Express', aliases: ['expressjs'], usageCount: 1100 },
    { value: 'MongoDB', aliases: ['mongo'], usageCount: 1050 },
    { value: 'PostgreSQL', aliases: ['postgres'], usageCount: 1000 },
    { value: 'Docker', aliases: [], usageCount: 950 },
    { value: 'AWS', aliases: ['amazon web services'], usageCount: 900 },
    { value: 'Git', aliases: [], usageCount: 850 },
    { value: 'Redis', aliases: [], usageCount: 800 },
    { value: 'Kubernetes', aliases: ['k8s'], usageCount: 750 }
  ],
  
  techArea: [
    { value: 'Frontend Development', aliases: ['frontend', 'front-end'], usageCount: 1400 },
    { value: 'Backend Development', aliases: ['backend', 'back-end'], usageCount: 1350 },
    { value: 'Full Stack Development', aliases: ['fullstack', 'full-stack'], usageCount: 1300 },
    { value: 'Mobile Development', aliases: ['mobile'], usageCount: 1200 },
    { value: 'DevOps', aliases: ['dev ops'], usageCount: 1100 },
    { value: 'Data Science', aliases: ['datascience'], usageCount: 1000 },
    { value: 'Machine Learning', aliases: ['ml', 'ai'], usageCount: 950 },
    { value: 'Cybersecurity', aliases: ['security'], usageCount: 900 },
    { value: 'Cloud Computing', aliases: ['cloud'], usageCount: 850 },
    { value: 'Game Development', aliases: ['gamedev'], usageCount: 800 }
  ],
  
  languages: [
    { value: 'English', aliases: ['en'], usageCount: 2000 },
    { value: 'Spanish', aliases: ['es', 'español'], usageCount: 1500 },
    { value: 'German', aliases: ['de', 'deutsch'], usageCount: 1400 },
    { value: 'French', aliases: ['fr', 'français'], usageCount: 1300 },
    { value: 'Portuguese', aliases: ['pt', 'português'], usageCount: 1200 },
    { value: 'Italian', aliases: ['it', 'italiano'], usageCount: 1100 },
    { value: 'Chinese', aliases: ['zh', 'mandarin'], usageCount: 1000 },
    { value: 'Japanese', aliases: ['ja'], usageCount: 900 },
    { value: 'Russian', aliases: ['ru'], usageCount: 850 },
    { value: 'Arabic', aliases: ['ar'], usageCount: 800 }
  ],
  
  otherInterests: [
    { value: 'Gaming', aliases: ['games', 'video games'], usageCount: 1500 },
    { value: 'Music', aliases: [], usageCount: 1400 },
    { value: 'Sports', aliases: [], usageCount: 1300 },
    { value: 'Reading', aliases: ['books'], usageCount: 1200 },
    { value: 'Travel', aliases: ['traveling'], usageCount: 1100 },
    { value: 'Photography', aliases: ['photos'], usageCount: 1000 },
    { value: 'Cooking', aliases: ['food'], usageCount: 950 },
    { value: 'Fitness', aliases: ['gym', 'workout'], usageCount: 900 },
    { value: 'Movies', aliases: ['films', 'cinema'], usageCount: 850 },
    { value: 'Art', aliases: ['drawing', 'painting'], usageCount: 800 }
  ]
};

async function seedSuggestions() {
  try {
    console.log("🗑️ Deleting existing suggestions...");
    await Suggestion.deleteMany({});
    
    console.log("🌱 Seeding suggestions...");
    
    for (const [category, items] of Object.entries(seedData)) {
      for (const item of items) {
        await Suggestion.create({
          value: item.value,
          normalizedValue: normalizeText(item.value),
          category,
          usageCount: item.usageCount,
          aliases: item.aliases
        });
      }
      console.log(`✅ Seeded ${items.length} ${category} suggestions`);
    }
    
    console.log("🎉 Seeding complete!");
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding suggestions:", error);
    await db.close();
    process.exit(1);
  }
}

async function runSeed() {
  await db.connect();
  await seedSuggestions();
}

runSeed();