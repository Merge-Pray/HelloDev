import Similarity from '../models/Similarity.js';

export async function storeSimilarity(term1, term2, category, similarity) {
  if (similarity < 70) return;
  
  const [sortedTerm1, sortedTerm2] = [term1, term2].sort();
  
  await Similarity.findOneAndUpdate(
    { term1: sortedTerm1, term2: sortedTerm2, category },
    { 
      $set: { similarity },
      $inc: { occurrences: 1 }
    },
    { upsert: true }
  );
}