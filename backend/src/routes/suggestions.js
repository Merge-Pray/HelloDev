import express from 'express';
import Suggestion from '../models/Suggestion.js';
import { fuzzyMatch } from '../utils/textNormalization.js';

const router = express.Router();

router.get('/popular/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const popular = await Suggestion.find({ 
      category,
      isPopular: true 
    })
    .sort({ popularRank: 1 })
    .limit(10)
    .select('value usageCount popularRank')
    .lean();

    res.json({ 
      success: true,
      popular: popular.map(item => ({
        id: item._id,
        value: item.value,
        usageCount: item.usageCount,
        rank: item.popularRank
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular suggestions' });
  }
});

router.get('/search/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const allSuggestions = await Suggestion.find({
      category
    })
    .select('value usageCount aliases isPopular')
    .lean();

    const matchedSuggestions = allSuggestions
      .map(suggestion => ({
        ...suggestion,
        score: fuzzyMatch(q, suggestion.value, suggestion.aliases)
      }))
      .filter(suggestion => suggestion.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.isPopular !== b.isPopular) return a.isPopular ? 1 : -1;
        return b.usageCount - a.usageCount;
      })
      .slice(0, 10);

    res.json({ 
      success: true,
      suggestions: matchedSuggestions.map(item => ({
        id: item._id,
        value: item.value,
        usageCount: item.usageCount,
        score: item.score
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;