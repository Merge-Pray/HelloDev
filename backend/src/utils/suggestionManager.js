import Suggestion from '../models/Suggestion.js';
import { normalizeText, generateAliases } from './textNormalization.js';

export async function updateSuggestionsFromProfile(user) {
  const updates = [];
  
  if (user.programmingLanguages?.length) {
    for (const lang of user.programmingLanguages) {
      const langName = Array.isArray(lang) ? lang[0] : lang;
      if (langName) {
        updates.push(updateSuggestion('programmingLanguages', langName));
      }
    }
  }
  
  if (user.techStack?.length) {
    for (const tech of user.techStack) {
      updates.push(updateSuggestion('techStack', tech));
    }
  }
  
  if (user.techArea?.length) {
    for (const area of user.techArea) {
      updates.push(updateSuggestion('techArea', area));
    }
  }
  
  if (user.languages?.length) {
    for (const lang of user.languages) {
      updates.push(updateSuggestion('languages', lang));
    }
  }
  
  if (user.otherInterests?.length) {
    for (const interest of user.otherInterests) {
      updates.push(updateSuggestion('otherInterests', interest));
    }
  }
  
  if (user.favoriteDrinkWhileCoding) {
    updates.push(updateSuggestion('favoriteDrinkWhileCoding', user.favoriteDrinkWhileCoding));
  }
  
  if (user.musicGenreWhileCoding) {
    updates.push(updateSuggestion('musicGenreWhileCoding', user.musicGenreWhileCoding));
  }
  
  if (user.favoriteShowMovie) {
    updates.push(updateSuggestion('favoriteShowMovie', user.favoriteShowMovie));
  }
  
  await Promise.all(updates);
}

async function updateSuggestion(category, value) {
  if (!value || !value.trim()) return;
  
  const normalizedValue = normalizeText(value);
  const aliases = generateAliases(value);
  
  try {
    await Suggestion.findOneAndUpdate(
      { category, normalizedValue },
      {
        $set: {
          value: value.trim(),
          normalizedValue,
          aliases,
          lastUsed: new Date()
        },
        $inc: { usageCount: 1 },
        $setOnInsert: {
          isPopular: false,
          isVerified: false,
          createdAt: new Date()
        }
      },
      { 
        upsert: true,
        new: true
      }
    );
  } catch (error) {
    console.error('Error updating suggestion:', error);
  }
}

export async function recalculatePopularRankings() {
  const categories = [
    'programmingLanguages',
    'techStack',
    'techArea',
    'languages',
    'otherInterests'
  ];
  
  for (const category of categories) {
    const limit = ['programmingLanguages', 'techStack', 'techArea'].includes(category) ? 10 : 5;
    
    await Suggestion.updateMany(
      { category },
      { $set: { isPopular: false, popularRank: null } }
    );
    
    const topSuggestions = await Suggestion.find({ category })
      .sort({ usageCount: -1 })
      .limit(limit);
    
    for (let i = 0; i < topSuggestions.length; i++) {
      await Suggestion.findByIdAndUpdate(topSuggestions[i]._id, {
        isPopular: true,
        popularRank: i + 1
      });
    }
  }
}