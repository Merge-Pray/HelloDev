import mongoose from 'mongoose';

const SuggestionSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    trim: true
  },
  normalizedValue: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'programmingLanguages',
      'techStack', 
      'techArea',
      'languages',
      'otherInterests',
      'favoriteDrinkWhileCoding',
      'musicGenreWhileCoding',
      'favoriteShowMovie'
    ],
    index: true
  },
  usageCount: {
    type: Number,
    default: 1,
    min: 0
  },
  isPopular: {
    type: Boolean,
    default: false,
    index: true
  },
  popularRank: {
    type: Number,
    min: 1,
    max: 10
  },
  aliases: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
});

SuggestionSchema.index({ category: 1, usageCount: -1 });
SuggestionSchema.index({ category: 1, isPopular: 1, popularRank: 1 });
SuggestionSchema.index({ 
  category: 1, 
  normalizedValue: 'text',
  aliases: 'text' 
}, {
  weights: { normalizedValue: 10, aliases: 5 }
});

export default mongoose.model('Suggestion', SuggestionSchema);