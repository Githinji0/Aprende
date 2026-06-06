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
 * Assesses the user's answer spelling against the key
 * @param {string} userInput
 * @param {string} answerKey
 * @returns {object} { success: boolean, partial: boolean, warning?: string, score: number }
 */
export const checkSpelling = (userInput, answerKey) => {
  const cleanInput = userInput.trim().toLowerCase();
  const cleanKey = answerKey.trim().toLowerCase();

  // 1. Exact Match (Case-insensitive)
  if (cleanInput === cleanKey) {
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

  if (noPunctInput === noPunctKey) {
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

  if (unaccentedInput === unaccentedKey) {
    return {
      success: true,
      partial: true,
      warning: "¡Casi! Pay attention to accents or minor typos.",
      score: 90,
    };
  }

  // 3. Typo distance check (Levenshtein distance of exactly 1)
  const distance = getLevenshteinDistance(unaccentedInput, unaccentedKey);
  if (distance === 1) {
    return {
      success: true,
      partial: true,
      warning: "¡Casi! Pay attention to accents or minor typos.",
      score: 80,
    };
  }

  // 4. Failure (Incorrect spelling)
  return {
    success: false,
    partial: false,
    score: 0,
  };
};
