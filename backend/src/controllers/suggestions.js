import Suggestion from '../models/Suggestion.js';
import { normalizeText } from '../utils/textNormalization.js';

export const getPopularSuggestions = async (req, res) => {
  try {
    const { category } = req.params;
    let limit = 10;
    
    if (category === 'languages' || category === 'otherInterests') {
      limit = 5;
    }
    
    const suggestions = await Suggestion.find({ category })
      .sort({ usageCount: -1 })
      .limit(limit)
      .select('value usageCount');
    
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular suggestions' });
  }
};

export const searchSuggestions = async (req, res) => {
  try {
    const { category } = req.params;
    const { q } = req.query;
    
    if (!q || q.length < 2) return res.json({ suggestions: [] });
    
    const searchTerm = q.toLowerCase().trim();
    
    const allSuggestions = await Suggestion.find({ category })
      .select('value aliases usageCount')
      .lean();
    
    const matchedSuggestions = allSuggestions
      .filter(item => {
        const value = item.value.toLowerCase();
        const aliases = item.aliases.map(alias => alias.toLowerCase());
        
        return value.startsWith(searchTerm) || 
               aliases.some(alias => alias.startsWith(searchTerm));
      })
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
    
    res.json({ 
      suggestions: matchedSuggestions.map(item => ({
        value: item.value,
        usageCount: item.usageCount
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
};

export const addSuggestion = async (req, res) => {
  try {
    const { category, value } = req.body;
    const normalizedValue = normalizeText(value);
    
    await Suggestion.findOneAndUpdate(
      { category, normalizedValue },
      { $inc: { usageCount: 1 }, $set: { value } },
      { upsert: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add suggestion' });
  }
};