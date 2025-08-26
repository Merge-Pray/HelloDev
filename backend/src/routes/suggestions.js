import express from 'express';
import { getPopularSuggestions, searchSuggestions, addSuggestion } from '../controllers/suggestions.js';

const router = express.Router();

router.get('/popular/:category', getPopularSuggestions);
router.get('/search/:category', searchSuggestions);
router.post('/add', addSuggestion);

export default router;