import mongoose from "mongoose";
import UserModel from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

// List of random animal names for nicknames
const animalNames = [
  "Clever Fox", "Swift Eagle", "Brave Lion", "Wise Owl", "Gentle Deer",
  "Mighty Bear", "Quick Rabbit", "Smart Dolphin", "Strong Wolf", "Graceful Swan",
  "Curious Cat", "Bold Tiger", "Peaceful Dove", "Agile Cheetah", "Noble Horse",
  "Playful Otter", "Fierce Hawk", "Calm Turtle", "Energetic Squirrel", "Majestic Elephant",
  "Sneaky Raccoon", "Loyal Dog", "Independent Lynx", "Social Penguin", "Mysterious Raven",
  "Cheerful Parrot", "Determined Ant", "Flexible Octopus", "Patient Sloth", "Adventurous Monkey",
  "Protective Rhino", "Elegant Flamingo", "Resourceful Beaver", "Observant Meerkat", "Resilient Camel",
  "Spirited Mustang", "Thoughtful Koala", "Dynamic Jaguar", "Serene Whale", "Witty Crow",
  "Ambitious Falcon", "Gentle Lamb", "Fierce Panther", "Wise Elephant", "Nimble Gazelle",
  "Loyal Husky", "Clever Raven", "Bold Eagle", "Peaceful Panda", "Quick Hummingbird",
  "Strong Bison", "Graceful Butterfly", "Curious Ferret", "Mighty Gorilla", "Swift Antelope",
  "Smart Chimp", "Brave Badger", "Gentle Manatee", "Wise Tortoise", "Agile Leopard",
  "Playful Seal", "Fierce Wolverine", "Calm Llama", "Energetic Kangaroo", "Majestic Peacock",
  "Sneaky Weasel", "Loyal Shepherd", "Independent Bobcat", "Social Dolphin", "Mysterious Bat",
  "Cheerful Canary", "Determined Bee", "Flexible Snake", "Patient Ox", "Adventurous Lemur",
  "Protective Buffalo", "Elegant Crane", "Resourceful Rat", "Observant Hawk", "Resilient Yak",
  "Spirited Stallion", "Thoughtful Orangutan", "Dynamic Cougar", "Serene Manatee", "Witty Magpie",
  "Ambitious Kestrel", "Gentle Alpaca", "Fierce Bobcat", "Wise Baboon", "Nimble Impala",
  "Loyal Collie", "Clever Jackdaw", "Bold Condor", "Peaceful Koala", "Quick Roadrunner",
  "Strong Moose", "Graceful Heron", "Curious Mongoose", "Mighty Hippo", "Swift Greyhound",
  "Smart Bonobo", "Brave Honey Badger", "Gentle Dugong", "Wise Pelican", "Agile Ocelot",
  "Playful Dolphin", "Fierce Lynx", "Calm Capybara", "Energetic Chipmunk", "Majestic Albatross",
  "Sneaky Stoat", "Loyal Retriever", "Independent Caracal", "Social Meerkat", "Mysterious Owl",
  "Cheerful Robin", "Determined Wasp", "Flexible Eel", "Patient Sloth", "Adventurous Gibbon"
];

// Function to get a random animal name
const getRandomAnimalName = () => {
  return animalNames[Math.floor(Math.random() * animalNames.length)];
};

// Function to ensure unique nicknames
const generateUniqueNickname = async (usedNicknames) => {
  let nickname;
  let attempts = 0;
  const maxAttempts = 1000;
  
  do {
    nickname = getRandomAnimalName();
    attempts++;
    
    // If we've tried too many times, add a number suffix
    if (attempts > maxAttempts) {
      nickname = `${getRandomAnimalName()} ${Math.floor(Math.random() * 1000)}`;
      break;
    }
  } while (usedNicknames.has(nickname));
  
  usedNicknames.add(nickname);
  return nickname;
};

// Main migration function
const addNicknamesToUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Connected to MongoDB");

    // Find all users without nicknames
    const usersWithoutNicknames = await UserModel.find({
      $or: [
        { nickname: { $exists: false } },
        { nickname: "" },
        { nickname: null }
      ]
    });

    console.log(`Found ${usersWithoutNicknames.length} users without nicknames`);

    if (usersWithoutNicknames.length === 0) {
      console.log("All users already have nicknames!");
      return;
    }

    // Get existing nicknames to avoid duplicates
    const existingNicknames = await UserModel.distinct("nickname", {
      nickname: { $ne: "", $ne: null, $exists: true }
    });
    
    const usedNicknames = new Set(existingNicknames);
    console.log(`Found ${existingNicknames.length} existing nicknames`);

    // Update users with random animal nicknames
    let updatedCount = 0;
    
    for (const user of usersWithoutNicknames) {
      try {
        const nickname = await generateUniqueNickname(usedNicknames);
        
        await UserModel.findByIdAndUpdate(
          user._id,
          { nickname: nickname },
          { new: true }
        );
        
        console.log(`Updated user ${user.username || user.email} with nickname: "${nickname}"`);
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update user ${user._id}:`, error.message);
      }
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Updated ${updatedCount} users with nicknames`);
    console.log(`🎯 Total users with nicknames: ${updatedCount + existingNicknames.length}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  addNicknamesToUsers()
    .then(() => {
      console.log("Migration script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

export default addNicknamesToUsers;