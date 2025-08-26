import mongoose from 'mongoose';

const SimilaritySchema = new mongoose.Schema({
  term1: { type: String, required: true },
  term2: { type: String, required: true },
  category: { type: String, required: true },
  similarity: { type: Number, min: 0, max: 100 },
  occurrences: { type: Number, default: 1 }
});

SimilaritySchema.index({ term1: 1, term2: 1, category: 1 }, { unique: true });

export default mongoose.model('Similarity', SimilaritySchema);