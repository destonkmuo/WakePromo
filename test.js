const axios = require('axios');
const fs = require('fs');

function loadDictionary(data) {
  try {
    return data.split('\n').map(word => word.trim().toLowerCase());
  } catch (error) {
    console.error('Error loading dictionary:', error.message);
    return [];
  }
}

async function fetchDictionary(filePath) {
  try {
    const response = await axios.get(filePath);
    return response.data;
  } catch (error) {
    console.error('Error fetching dictionary:', error.message);
    return '';
  }
}

(async () => {
  const dictionaryFilePath = 'https://raw.githubusercontent.com/dwyl/english-words/master/words.txt';

  try {
    // Fetch the dictionary data from the URL
    const dictionaryData = await fetchDictionary(dictionaryFilePath);

    // Load the dictionary and perform spell-checking
    const dictionary = loadDictionary(dictionaryData);

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
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
