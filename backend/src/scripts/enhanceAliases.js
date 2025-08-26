import "dotenv/config";
import db from "../db/db.js";
import Similarity from "../models/Similarity.js";
import Suggestion from "../models/Suggestion.js";
import { normalizeText } from "../utils/textNormalization.js";

async function enhanceAliases() {
  try {
    console.log("🔍 Finding high similarity matches...");
    
    const similarities = await Similarity.find({ 
      similarity: { $gte: 85 },
      occurrences: { $gte: 3 }
    });
    
    console.log(`Found ${similarities.length} high similarity matches`);
    
    for (const sim of similarities) {
      const suggestion1 = await Suggestion.findOne({ 
        category: sim.category, 
        normalizedValue: normalizeText(sim.term1) 
      });
      const suggestion2 = await Suggestion.findOne({ 
        category: sim.category, 
        normalizedValue: normalizeText(sim.term2) 
      });
      
      if (suggestion1 && suggestion2) {
        const higherUsage = suggestion1.usageCount >= suggestion2.usageCount ? suggestion1 : suggestion2;
        const lowerUsage = suggestion1.usageCount < suggestion2.usageCount ? suggestion1 : suggestion2;
        
        if (!higherUsage.aliases.includes(lowerUsage.normalizedValue)) {
          await Suggestion.findByIdAndUpdate(higherUsage._id, {
            $addToSet: { aliases: lowerUsage.normalizedValue }
          });
          console.log(`✅ Added alias "${lowerUsage.normalizedValue}" to "${higherUsage.value}"`);
        }
      }
    }
    
    console.log("🎉 Alias enhancement complete!");
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error enhancing aliases:", error);
    await db.close();
    process.exit(1);
  }
}

async function runEnhancement() {
  await db.connect();
  await enhanceAliases();
}

runEnhancement();