const fs = require('fs');

function loadDictionary(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return data.split('\n').map(word => word.trim().toLowerCase());
  } catch (error) {
    console.error('Error loading dictionary:', error.message);
    return [];
  }
}

const dictionaryFilePath = 'words_alpha.txt.txt'; //english word dictionary
const dictionary = loadDictionary(dictionaryFilePath);

function isWordValid(word) {
  return dictionary.includes(word.toLowerCase());
}

function spellCheck(text) {
  const words = text.split(/\s+/);
  const result = [];

  for (const word of words) {
    const trimmedWord = word.replace(/[^a-zA-Z]/g, ''); // Remove non-alphabetic characters
    if (trimmedWord.length > 0) {
      if (isWordValid(trimmedWord)) {
        result.push(trimmedWord);
      } else {
        result.push(`[ ${trimmedWord} ]`);
      }
    } else {
      result.push(word); // Preserve non-alphabetic characters as is
    }
  }

  return result.join(' ');
}

// Example usage
const inputText = "I like appple and bananana."; // "apple" and "banana" are misspelled.
const checkedText = spellCheck(inputText);
console.log(checkedText);
