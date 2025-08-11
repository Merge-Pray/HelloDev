import mongoose from "mongoose";
import "dotenv/config";

export default {
  connect: async () => {
    mongoose.connection.on("connected", () =>
      console.log(
        `Connection with "${mongoose.connection.name}" DB established 🤖.`
      )
    );
    mongoose.connection.on("disconnected", () =>
      console.log(`Disconnected from "${mongoose.connection.name}" DB 🔌.`)
    );
    mongoose.connection.on("error", (error) =>
      console.log(`🚨 "${mongoose.connection.name}" DB Error:`, error)
    );
    await mongoose.connect(process.env.MONGO_DB_URI);
  },
  close: async () => {
    await mongoose.disconnect();
  },
};
