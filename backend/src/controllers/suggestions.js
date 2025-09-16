import Suggestion from '../models/Suggestion.js';
import { normalizeText } from '../utils/textNormalization.js';
import jaroWinkler from 'jaro-winkler';

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
        const normalizedValue = item.normalizedValue || '';
        const normalizedSearch = normalizeText(searchTerm);
        const aliases = item.aliases.map(alias => alias.toLowerCase());
        
        return value.startsWith(searchTerm) || 
               value.includes(searchTerm) ||
               normalizedValue.startsWith(normalizedSearch) ||
               normalizedValue.includes(normalizedSearch) ||
               aliases.some(alias => alias.startsWith(searchTerm)) ||
               aliases.some(alias => alias.includes(searchTerm));
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
    
    let existing = await Suggestion.findOne({ category, normalizedValue });
    if (existing) {
      await Suggestion.findByIdAndUpdate(existing._id, { $inc: { usageCount: 1 } });
      return res.json({ success: true, action: 'incremented' });
    }
    
    const allSuggestions = await Suggestion.find({ category });
    for (const suggestion of allSuggestions) {
      const similarity = jaroWinkler(normalizedValue, suggestion.normalizedValue);
      if (similarity > 0.85) {
        await Suggestion.findByIdAndUpdate(suggestion._id, {
          $addToSet: { aliases: normalizedValue },
          $inc: { usageCount: 1 }
        });
        return res.json({ 
          success: true, 
          action: 'merged', 
          mergedInto: suggestion.value 
        });
      }
    }
    
    await Suggestion.create({ 
      category, 
      value, 
      normalizedValue, 
      usageCount: 1,
      aliases: []
    });
    
    res.json({ success: true, action: 'created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add suggestion' });
  }
};