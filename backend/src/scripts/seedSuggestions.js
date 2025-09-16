import "dotenv/config";
import db from "../db/db.js";
import Suggestion from "../models/Suggestion.js";
import { normalizeText } from "../utils/textNormalization.js";

const seedData = {
  programmingLanguages: [
    // Popular languages with extensive aliases
    { value: 'JavaScript', aliases: ['js', 'ecmascript', 'es6', 'es2015', 'es2020', 'vanilla js'], usageCount: 1500 },
    { value: 'Python', aliases: ['py', 'python3', 'py3'], usageCount: 1400 },
    { value: 'TypeScript', aliases: ['ts', 'typescript'], usageCount: 1200 },
    { value: 'Java', aliases: ['java8', 'java11', 'java17'], usageCount: 1100 },
    { value: 'C++', aliases: ['cpp', 'cplusplus', 'c plus plus'], usageCount: 1000 },
    { value: 'C#', aliases: ['csharp', 'cs', 'c sharp', 'dotnet'], usageCount: 950 },
    { value: 'Go', aliases: ['golang', 'go lang'], usageCount: 900 },
    { value: 'Rust', aliases: ['rust lang'], usageCount: 850 },
    { value: 'PHP', aliases: ['php7', 'php8'], usageCount: 800 },
    { value: 'Swift', aliases: ['swift5', 'swiftui'], usageCount: 750 },
    { value: 'Kotlin', aliases: ['kotlin jvm', 'android kotlin'], usageCount: 700 },
    { value: 'Ruby', aliases: ['ruby on rails', 'ror'], usageCount: 650 },
    { value: 'Dart', aliases: ['flutter dart'], usageCount: 600 },
    { value: 'R', aliases: ['r lang', 'r programming'], usageCount: 550 },
    { value: 'Scala', aliases: ['scala lang'], usageCount: 500 },
    { value: 'C', aliases: ['c lang', 'ansi c'], usageCount: 480 },
    { value: 'Perl', aliases: ['perl5'], usageCount: 300 },
    { value: 'Elixir', aliases: ['elixir lang'], usageCount: 280 },
    { value: 'Haskell', aliases: ['haskell lang'], usageCount: 250 },
    { value: 'Clojure', aliases: ['clojure lang'], usageCount: 200 }
  ],
  
  techStack: [
    // Frontend Frameworks & Libraries
    { value: 'React', aliases: ['reactjs', 'react.js', 'react 18', 'react hooks'], usageCount: 1400 },
    { value: 'Vue.js', aliases: ['vue', 'vuejs', 'vue 3', 'vue3', 'composition api'], usageCount: 1200 },
    { value: 'Angular', aliases: ['angularjs', 'angular 15', 'ng', 'angular typescript'], usageCount: 1100 },
    { value: 'Next.js', aliases: ['nextjs', 'next', 'next 13', 'next.js'], usageCount: 1050 },
    { value: 'Svelte', aliases: ['sveltejs', 'sveltekit'], usageCount: 650 },
    { value: 'Nuxt.js', aliases: ['nuxt', 'nuxtjs'], usageCount: 550 },
    
    // Backend Frameworks
    { value: 'Node.js', aliases: ['nodejs', 'node', 'node 18', 'node.js'], usageCount: 1300 },
    { value: 'Express', aliases: ['expressjs', 'express.js', 'express server'], usageCount: 1150 },
    { value: 'Nest.js', aliases: ['nestjs', 'nest'], usageCount: 750 },
    { value: 'Fastify', aliases: ['fastify.js'], usageCount: 400 },
    { value: 'Django', aliases: ['django python', 'django rest'], usageCount: 900 },
    { value: 'Flask', aliases: ['flask python'], usageCount: 700 },
    { value: 'FastAPI', aliases: ['fast api', 'fastapi python'], usageCount: 650 },
    { value: 'Spring Boot', aliases: ['spring', 'springboot', 'spring framework'], usageCount: 800 },
    { value: 'Laravel', aliases: ['laravel php'], usageCount: 650 },
    { value: 'Ruby on Rails', aliases: ['rails', 'ror', 'ruby rails'], usageCount: 500 },
    { value: 'ASP.NET', aliases: ['asp.net core', 'dotnet core', '.net'], usageCount: 700 },
    
    // Styling & CSS
    { value: 'HTML/CSS', aliases: ['html', 'css', 'html5', 'css3', 'html css'], usageCount: 1450 },
    { value: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'], usageCount: 1000 },
    { value: 'Bootstrap', aliases: ['bootstrap5', 'bootstrap 5'], usageCount: 900 },
    { value: 'Sass/SCSS', aliases: ['sass', 'scss', 'syntactically awesome stylesheets'], usageCount: 800 },
    { value: 'Material-UI', aliases: ['mui', 'material ui', 'material-ui'], usageCount: 650 },
    { value: 'Styled Components', aliases: ['styled-components', 'css-in-js'], usageCount: 550 },
    { value: 'Chakra UI', aliases: ['chakra-ui'], usageCount: 400 },
    
    // Databases
    { value: 'MongoDB', aliases: ['mongo', 'mongodb atlas', 'nosql'], usageCount: 1100 },
    { value: 'PostgreSQL', aliases: ['postgres', 'psql', 'postgresql'], usageCount: 1050 },
    { value: 'MySQL', aliases: ['mysql8', 'mysql 8'], usageCount: 950 },
    { value: 'Redis', aliases: ['redis cache', 'redis db'], usageCount: 800 },
    { value: 'SQLite', aliases: ['sqlite3'], usageCount: 600 },
    { value: 'Firebase', aliases: ['firebase firestore', 'google firebase'], usageCount: 850 },
    { value: 'Supabase', aliases: ['supabase db'], usageCount: 500 },
    { value: 'DynamoDB', aliases: ['aws dynamodb', 'amazon dynamodb'], usageCount: 450 },
    
    // Cloud & DevOps
    { value: 'AWS', aliases: ['amazon web services', 'aws cloud', 'amazon aws'], usageCount: 950 },
    { value: 'Google Cloud', aliases: ['gcp', 'google cloud platform'], usageCount: 700 },
    { value: 'Azure', aliases: ['microsoft azure', 'azure cloud'], usageCount: 650 },
    { value: 'Docker', aliases: ['docker containers', 'containerization'], usageCount: 950 },
    { value: 'Kubernetes', aliases: ['k8s', 'k8s cluster', 'container orchestration'], usageCount: 750 },
    { value: 'Vercel', aliases: ['vercel deployment'], usageCount: 600 },
    { value: 'Netlify', aliases: ['netlify hosting'], usageCount: 550 },
    { value: 'Heroku', aliases: ['heroku app'], usageCount: 500 },
    
    // Tools & Build Systems
    { value: 'Git', aliases: ['github', 'git version control', 'version control'], usageCount: 1400 },
    { value: 'Webpack', aliases: ['webpack5'], usageCount: 750 },
    { value: 'Vite', aliases: ['vitejs', 'vite build'], usageCount: 700 },
    { value: 'Babel', aliases: ['babeljs', 'babel transpiler'], usageCount: 600 },
    { value: 'ESLint', aliases: ['eslint linting'], usageCount: 650 },
    { value: 'Prettier', aliases: ['code formatting'], usageCount: 600 },
    
    // APIs & Data
    { value: 'REST API', aliases: ['rest', 'restful api', 'api design'], usageCount: 1200 },
    { value: 'GraphQL', aliases: ['graphql api', 'apollo graphql'], usageCount: 800 },
    { value: 'Socket.io', aliases: ['websockets', 'real-time'], usageCount: 600 },
    { value: 'JWT', aliases: ['json web tokens', 'jwt auth'], usageCount: 700 },
    
    // Testing
    { value: 'Jest', aliases: ['jest testing', 'unit testing'], usageCount: 700 },
    { value: 'Cypress', aliases: ['cypress testing', 'e2e testing'], usageCount: 650 },
    { value: 'Testing Library', aliases: ['react testing library', '@testing-library'], usageCount: 600 },
    { value: 'Playwright', aliases: ['playwright testing'], usageCount: 400 },
    
    // Mobile
    { value: 'React Native', aliases: ['react-native', 'rn', 'expo'], usageCount: 800 },
    { value: 'Flutter', aliases: ['flutter mobile', 'dart flutter'], usageCount: 750 },
    { value: 'Ionic', aliases: ['ionic framework'], usageCount: 400 },
    
    // State Management
    { value: 'Redux', aliases: ['redux toolkit', 'rtk'], usageCount: 700 },
    { value: 'Zustand', aliases: ['zustand state'], usageCount: 500 },
    { value: 'Recoil', aliases: ['recoil state'], usageCount: 300 },
    { value: 'MobX', aliases: ['mobx state'], usageCount: 250 }
  ],
  
  techArea: [
    // Development Areas
    { value: 'Frontend Development', aliases: ['frontend', 'front-end', 'client-side', 'ui development'], usageCount: 1400 },
    { value: 'Backend Development', aliases: ['backend', 'back-end', 'server-side', 'api development'], usageCount: 1350 },
    { value: 'Full Stack Development', aliases: ['fullstack', 'full-stack', 'full stack dev'], usageCount: 1300 },
    { value: 'Mobile Development', aliases: ['mobile', 'mobile app', 'app development', 'ios', 'android'], usageCount: 1200 },
    { value: 'Web Development', aliases: ['web dev', 'website development'], usageCount: 1100 },
    
    // Specialized Areas
    { value: 'DevOps', aliases: ['dev ops', 'devops engineer', 'infrastructure'], usageCount: 1100 },
    { value: 'Data Science', aliases: ['datascience', 'data analysis', 'analytics'], usageCount: 1000 },
    { value: 'Machine Learning', aliases: ['ml', 'ai', 'artificial intelligence', 'deep learning'], usageCount: 950 },
    { value: 'Cloud Computing', aliases: ['cloud', 'cloud architecture', 'cloud engineer'], usageCount: 850 },
    { value: 'Cybersecurity', aliases: ['security', 'infosec', 'cyber security', 'penetration testing'], usageCount: 900 },
    { value: 'Game Development', aliases: ['gamedev', 'game dev', 'unity', 'unreal'], usageCount: 800 },
    { value: 'Blockchain', aliases: ['crypto', 'web3', 'defi', 'smart contracts'], usageCount: 700 },
    
    // Design & UX
    { value: 'UI/UX Design', aliases: ['ui', 'ux', 'user experience', 'user interface', 'design'], usageCount: 950 },
    { value: 'Product Design', aliases: ['product', 'design thinking'], usageCount: 600 },
    { value: 'Graphic Design', aliases: ['graphics', 'visual design'], usageCount: 500 },
    
    // Database & Data
    { value: 'Database Administration', aliases: ['dba', 'database', 'db admin', 'sql'], usageCount: 700 },
    { value: 'Data Engineering', aliases: ['data pipeline', 'etl', 'big data'], usageCount: 650 },
    { value: 'Business Intelligence', aliases: ['bi', 'data visualization', 'analytics'], usageCount: 550 },
    
    // Testing & QA
    { value: 'Quality Assurance', aliases: ['qa', 'testing', 'quality control'], usageCount: 750 },
    { value: 'Test Automation', aliases: ['automation testing', 'automated testing'], usageCount: 600 },
    
    // Architecture & Management
    { value: 'Software Architecture', aliases: ['architecture', 'system design', 'tech lead'], usageCount: 800 },
    { value: 'Project Management', aliases: ['pm', 'scrum master', 'agile'], usageCount: 650 },
    { value: 'Technical Writing', aliases: ['documentation', 'tech writing'], usageCount: 400 },
    
    // Emerging Tech
    { value: 'IoT Development', aliases: ['iot', 'internet of things', 'embedded'], usageCount: 350 },
    { value: 'AR/VR Development', aliases: ['ar', 'vr', 'augmented reality', 'virtual reality'], usageCount: 300 },
    { value: 'Robotics', aliases: ['robotics engineering', 'automation'], usageCount: 250 }
  ],
  
  languages: [
    // Major World Languages
    { value: 'English', aliases: ['en', 'english language', 'native english'], usageCount: 2500 },
    { value: 'Spanish', aliases: ['es', 'español', 'castilian', 'spanish language'], usageCount: 1800 },
    { value: 'German', aliases: ['de', 'deutsch', 'german language'], usageCount: 1500 },
    { value: 'French', aliases: ['fr', 'français', 'french language'], usageCount: 1400 },
    { value: 'Portuguese', aliases: ['pt', 'português', 'brazilian portuguese'], usageCount: 1300 },
    { value: 'Italian', aliases: ['it', 'italiano', 'italian language'], usageCount: 1100 },
    { value: 'Chinese', aliases: ['zh', 'mandarin', 'chinese mandarin', 'simplified chinese'], usageCount: 1200 },
    { value: 'Japanese', aliases: ['ja', 'japanese language'], usageCount: 1000 },
    { value: 'Russian', aliases: ['ru', 'russian language'], usageCount: 900 },
    { value: 'Arabic', aliases: ['ar', 'arabic language'], usageCount: 850 },
    { value: 'Hindi', aliases: ['hi', 'hindi language'], usageCount: 800 },
    { value: 'Korean', aliases: ['ko', 'korean language'], usageCount: 750 },
    { value: 'Dutch', aliases: ['nl', 'dutch language', 'netherlands'], usageCount: 600 },
    { value: 'Swedish', aliases: ['sv', 'swedish language'], usageCount: 500 },
    { value: 'Norwegian', aliases: ['no', 'norwegian language'], usageCount: 400 },
    { value: 'Polish', aliases: ['pl', 'polish language'], usageCount: 550 },
    { value: 'Turkish', aliases: ['tr', 'turkish language'], usageCount: 500 },
    { value: 'Hebrew', aliases: ['he', 'hebrew language'], usageCount: 400 },
    { value: 'Czech', aliases: ['cs', 'czech language'], usageCount: 350 },
    { value: 'Greek', aliases: ['el', 'greek language'], usageCount: 300 }
  ],
  
  otherInterests: [
    // Technology & Programming
    { value: 'Open Source', aliases: ['oss', 'open source projects', 'github contributions'], usageCount: 1400 },
    { value: 'Tech Conferences', aliases: ['conferences', 'meetups', 'tech events'], usageCount: 1200 },
    { value: 'Hackathons', aliases: ['coding competitions', 'hack events'], usageCount: 1100 },
    { value: 'Side Projects', aliases: ['personal projects', 'hobby coding'], usageCount: 1300 },
    
    // Entertainment & Media
    { value: 'Gaming', aliases: ['games', 'video games', 'pc gaming', 'console gaming'], usageCount: 1500 },
    { value: 'Streaming', aliases: ['twitch', 'youtube', 'content creation'], usageCount: 900 },
    { value: 'Podcasts', aliases: ['tech podcasts', 'audio content'], usageCount: 800 },
    { value: 'Movies', aliases: ['films', 'cinema', 'netflix', 'movie watching'], usageCount: 1200 },
    { value: 'TV Shows', aliases: ['series', 'binge watching', 'television'], usageCount: 1100 },
    { value: 'Anime', aliases: ['japanese animation', 'manga'], usageCount: 800 },
    
    // Creative & Arts
    { value: 'Music', aliases: ['listening to music', 'music production', 'instruments'], usageCount: 1400 },
    { value: 'Photography', aliases: ['photos', 'photo editing', 'camera'], usageCount: 1000 },
    { value: 'Art', aliases: ['drawing', 'painting', 'digital art', 'creative arts'], usageCount: 800 },
    { value: 'Writing', aliases: ['blogging', 'creative writing', 'journalism'], usageCount: 700 },
    { value: 'Design', aliases: ['graphic design', 'ui design', 'visual arts'], usageCount: 900 },
    
    // Learning & Knowledge
    { value: 'Reading', aliases: ['books', 'technical books', 'e-books', 'literature'], usageCount: 1200 },
    { value: 'Online Learning', aliases: ['courses', 'tutorials', 'moocs', 'udemy'], usageCount: 1100 },
    { value: 'Tech Blogs', aliases: ['blogging', 'technical writing', 'dev blogs'], usageCount: 950 },
    { value: 'Research', aliases: ['academic research', 'tech research'], usageCount: 600 },
    
    // Physical & Outdoors
    { value: 'Sports', aliases: ['athletics', 'team sports', 'individual sports'], usageCount: 1300 },
    { value: 'Fitness', aliases: ['gym', 'workout', 'exercise', 'bodybuilding'], usageCount: 1200 },
    { value: 'Running', aliases: ['jogging', 'marathon', 'cardio'], usageCount: 800 },
    { value: 'Cycling', aliases: ['biking', 'mountain biking', 'road cycling'], usageCount: 700 },
    { value: 'Hiking', aliases: ['trekking', 'nature walks', 'outdoor activities'], usageCount: 900 },
    { value: 'Travel', aliases: ['traveling', 'tourism', 'backpacking', 'exploring'], usageCount: 1300 },
    { value: 'Camping', aliases: ['outdoor camping', 'wilderness'], usageCount: 500 },
    
    // Food & Lifestyle
    { value: 'Cooking', aliases: ['food', 'recipes', 'culinary', 'baking'], usageCount: 1100 },
    { value: 'Coffee', aliases: ['specialty coffee', 'barista', 'coffee culture'], usageCount: 1000 },
    { value: 'Beer', aliases: ['craft beer', 'brewing', 'beer tasting'], usageCount: 800 },
    { value: 'Wine', aliases: ['wine tasting', 'viticulture'], usageCount: 600 },
    
    // Social & Community
    { value: 'Volunteering', aliases: ['community service', 'charity work'], usageCount: 700 },
    { value: 'Mentoring', aliases: ['teaching', 'coaching', 'helping others'], usageCount: 900 },
    { value: 'Networking', aliases: ['professional networking', 'community building'], usageCount: 800 },
    
    // Hobbies & Crafts
    { value: 'DIY Projects', aliases: ['diy', 'crafting', 'maker projects'], usageCount: 600 },
    { value: 'Gardening', aliases: ['plants', 'growing vegetables', 'landscaping'], usageCount: 500 },
    { value: 'Board Games', aliases: ['tabletop games', 'strategy games'], usageCount: 700 },
    { value: 'Chess', aliases: ['chess playing', 'strategy'], usageCount: 400 },
    
    // Investment & Finance
    { value: 'Investing', aliases: ['stock market', 'portfolio management', 'finance'], usageCount: 800 },
    { value: 'Cryptocurrency', aliases: ['crypto', 'bitcoin', 'trading'], usageCount: 900 },
    
    // Pets & Animals
    { value: 'Dogs', aliases: ['dog owner', 'pets', 'dog training'], usageCount: 800 },
    { value: 'Cats', aliases: ['cat owner', 'feline'], usageCount: 700 }
  ]
};

async function seedSuggestions() {
  try {
    console.log("🗑️ Deleting existing suggestions...");
    await Suggestion.deleteMany({});
    
    console.log("🌱 Seeding comprehensive suggestions...");
    
    let totalSeeded = 0;
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
      totalSeeded += items.length;
    }
    
    console.log(`🎉 Seeding complete! Total: ${totalSeeded} suggestions`);
    console.log("📊 Breakdown:");
    console.log(`   • Programming Languages: ${seedData.programmingLanguages.length}`);
    console.log(`   • Tech Stack: ${seedData.techStack.length}`);
    console.log(`   • Tech Areas: ${seedData.techArea.length}`);
    console.log(`   • Languages: ${seedData.languages.length}`);
    console.log(`   • Other Interests: ${seedData.otherInterests.length}`);
    
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding suggestions:", error);
    await db.close();
    process.exit(1);
  }
}

async function runSeed() {
  console.log("🚀 Starting comprehensive suggestion seeding...");
  await db.connect();
  await seedSuggestions();
}

runSeed();