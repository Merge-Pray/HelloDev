import mongoose from "mongoose";
import ChatModel from "../models/Chat.js";
import MessageModel from "../models/Message.js";
import "dotenv/config";

const migrateDuplicateChats = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const allChats = await ChatModel.find({}).populate("participants");
    const chatGroups = new Map();

    for (const chat of allChats) {
      if (chat.participants.length === 2) {
        const sortedParticipants = chat.participants
          .map(p => p._id.toString())
          .sort()
          .join(",");

        if (!chatGroups.has(sortedParticipants)) {
          chatGroups.set(sortedParticipants, []);
        }
        chatGroups.get(sortedParticipants).push(chat);
      }
    }

    let mergedCount = 0;
    for (const [participants, chats] of chatGroups) {
      if (chats.length > 1) {
        console.log(`Found ${chats.length} duplicate chats for participants: ${participants}`);
        
        const keepChat = chats[0];
        const duplicateChats = chats.slice(1);

        for (const duplicateChat of duplicateChats) {
          await MessageModel.updateMany(
            { chat: duplicateChat._id },
            { chat: keepChat._id }
          );

          await ChatModel.findByIdAndDelete(duplicateChat._id);
          mergedCount++;
        }

        const sortedParticipantIds = participants.split(",");
        await ChatModel.findByIdAndUpdate(keepChat._id, {
          participants: sortedParticipantIds
        });
      }
    }

    console.log(`Migration completed. Merged ${mergedCount} duplicate chats.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateDuplicateChats();