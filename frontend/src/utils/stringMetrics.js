/**
 * String Metrics & Levenshtein Distance for Spelling Assessment
 */

/**
 * Strips Spanish accent marks (á, é, í, ó, ú, ñ, etc.) from a string
 * Note: Keeps 'ñ' as 'n' or leaves it? Generally, in accent checks,
 * stripping ñ to n is helpful but optional. Let's do standard normalization
 * which converts á -> a, é -> e, etc. but leaves ñ if we can, or converts ñ to n
 * to capture all typos. Standard NFD normalization strips all diacritics including tilde over n.
 * Let's normalize NFD and remove diacritics.
 * @param {string} str
 * @returns {string}
 */
export const stripAccents = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Standard Levenshtein Distance Algorithm
 * Returns the minimum number of single-character edits (insertions, deletions or substitutions)
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export const getLevenshteinDistance = (a, b) => {
  const matrix = [];

  // Clean strings
  const strA = a.toLowerCase().trim();
  const strB = b.toLowerCase().trim();

  // Increment along the first column of each row
  for (let i = 0; i <= strB.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= strA.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= strB.length; i++) {
    for (let j = 1; j <= strA.length; j++) {
      if (strB.charAt(i - 1) === strA.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1  // deletion
          )
        );
      }
    }
  }

  return matrix[strB.length][strA.length];
};

/**
 * Checks if a clean input matches a clean key that may contain bracketed placeholders like [Your Name]
 * @param {string} cleanInput
 * @param {string} cleanKey
 * @returns {boolean}
 */
export const matchWithPlaceholders = (cleanInput, cleanKey) => {
  if (cleanKey.includes('[') && cleanKey.includes(']')) {
    try {
      // Escape special regex characters except square brackets
      const escapedKey = cleanKey.replace(/[-\/\\^$*+?.()|{}]/g, '\\$&');
      // Replace [anything] placeholders with a wildcard regex capture group (.+)
      const regexStr = '^' + escapedKey.replace(/\[.*?\]/g, '(.+)') + '$';
      const regex = new RegExp(regexStr);
      return regex.test(cleanInput);
    } catch (e) {
      console.error("Error matching placeholders:", e);
      return false;
    }
  }
  return cleanInput === cleanKey;
};

export const getSubjectPronoun = (str) => {
  const match = str.match(/^(yo|tú|tu|él|el|ella|ellos|ellas|nosotros|nosotras|vosotros|vosotras|usted|ustedes)(?:\s+|$)/i);
  return match ? match[1].toLowerCase() : null;
};

export const stripSubjectPronoun = (str) => {
  return str.replace(/^(yo|tú|tu|él|el|ella|ellos|ellas|nosotros|nosotras|vosotros|vosotras|usted|ustedes)\s+/i, '').trim();
};

export const pronounsMatch = (p1, p2) => {
  if (p1 === p2) return true;
  const classes = [
    ['tú', 'tu'],
    ['él', 'el'],
    ['nosotros', 'nosotras'],
    ['vosotros', 'vosotras'],
    ['ellos', 'ellas']
  ];
  for (const cls of classes) {
    if (cls.includes(p1) && cls.includes(p2)) return true;
  }
  return false;
};

export const areStringsEquivalent = (a, b) => {
  const pA = getSubjectPronoun(a);
  const pB = getSubjectPronoun(b);
  if (pA !== null && pB !== null && !pronounsMatch(pA, pB)) {
    return false;
  }
  const sa = stripSubjectPronoun(a);
  const sb = stripSubjectPronoun(b);
  return sa === sb || matchWithPlaceholders(sa, sb);
};

/**
 * Assesses the user's answer spelling against the key
 * @param {string} userInput
 * @param {string} answerKey
 * @returns {object} { success: boolean, partial: boolean, warning?: string, score: number }
 */
export const checkSpelling = (userInput, answerKey) => {
  const cleanInput = userInput.trim().toLowerCase();
  const cleanKey = answerKey.trim().toLowerCase();

  // 1. Exact Match / Placeholder Match / Pronoun-equivalent Exact Match
  if (areStringsEquivalent(cleanInput, cleanKey)) {
    return {
      success: true,
      partial: false,
      score: 100,
    };
  }

  // Remove punctuation like inverted question marks/exclamations for comparative checks
  const removePunctuation = (str) => str.replace(/[¿?¡!.,]/g, '').trim();
  const noPunctInput = removePunctuation(cleanInput);
  const noPunctKey = removePunctuation(cleanKey);

  if (areStringsEquivalent(noPunctInput, noPunctKey)) {
    return {
      success: true,
      partial: true,
      warning: "¡Casi! Pay attention to punctuation marks like ¿ or ¡.",
      score: 95,
    };
  }

  // 2. Accent-Insensitive Match
  const unaccentedInput = stripAccents(noPunctInput);
  const unaccentedKey = stripAccents(noPunctKey);

  if (areStringsEquivalent(unaccentedInput, unaccentedKey)) {
    return {
      success: true,
      partial: true,
      warning: "¡Casi! Pay attention to accents or minor typos.",
      score: 90,
    };
  }

  // 3. Typo distance check (Levenshtein distance of exactly 1 on the verb/noun core)
  const pA = getSubjectPronoun(unaccentedInput);
  const pB = getSubjectPronoun(unaccentedKey);
  const sa = stripSubjectPronoun(unaccentedInput);
  const sb = stripSubjectPronoun(unaccentedKey);

  if (pA === null || pB === null || pronounsMatch(pA, pB)) {
    const distance = getLevenshteinDistance(sa, sb);
    if (distance === 1) {
      return {
        success: true,
        partial: true,
        warning: "¡Casi! Pay attention to accents or minor typos.",
        score: 80,
      };
    }
  }

  // 4. Failure (Incorrect spelling)
  return {
    success: false,
    partial: false,
    score: 0,
  };
};
