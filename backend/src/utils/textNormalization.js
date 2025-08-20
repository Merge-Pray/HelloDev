export function normalizeText(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(js|javascript)\b/g, 'javascript')
    .replace(/\b(ts|typescript)\b/g, 'typescript')
    .replace(/\b(py|python)\b/g, 'python')
    .replace(/\b(cpp|c\+\+)\b/g, 'cplusplus')
    .replace(/\b(cs|csharp|c#)\b/g, 'csharp')
    .replace(/\b(nodejs|node\.js)\b/g, 'nodejs')
    .replace(/\b(reactjs|react\.js)\b/g, 'react')
    .replace(/\b(vuejs|vue\.js)\b/g, 'vuejs');
}

export function generateAliases(value) {
  const aliases = [];
  const normalized = normalizeText(value);
  
  const aliasMap = {
    'javascript': ['js', 'ecmascript'],
    'typescript': ['ts'],
    'python': ['py'],
    'cplusplus': ['cpp', 'c++'],
    'csharp': ['cs', 'c#'],
    'nodejs': ['node.js', 'node'],
    'react': ['reactjs', 'react.js'],
    'vuejs': ['vue.js', 'vue'],
    'angular': ['angularjs'],
    'postgresql': ['postgres'],
    'mongodb': ['mongo'],
    'express': ['expressjs'],
    'nextjs': ['next.js'],
    'nuxtjs': ['nuxt.js']
  };
  
  if (aliasMap[normalized]) {
    aliases.push(...aliasMap[normalized]);
  }
  
  return aliases;
}

export function fuzzyMatch(searchTerm, targetValue, aliases = []) {
  const normalizedSearch = normalizeText(searchTerm);
  const normalizedTarget = normalizeText(targetValue);
  
  if (normalizedSearch === normalizedTarget) return 100;
  
  if (normalizedTarget.startsWith(normalizedSearch)) return 90;
  
  if (normalizedTarget.includes(normalizedSearch)) return 80;
  
  for (const alias of aliases) {
    const normalizedAlias = normalizeText(alias);
    if (normalizedAlias === normalizedSearch) return 85;
    if (normalizedAlias.startsWith(normalizedSearch)) return 75;
    if (normalizedAlias.includes(normalizedSearch)) return 70;
  }
  
  const distance = levenshteinDistance(normalizedSearch, normalizedTarget);
  const maxLength = Math.max(normalizedSearch.length, normalizedTarget.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return similarity > 60 ? similarity : 0;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}