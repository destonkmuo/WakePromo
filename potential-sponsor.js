function loadDictionary(data) {
  try {
    return data.split('\n').map(word => word.trim().toLowerCase());
  } catch (error) {
    console.error('Error loading dictionary:', error.message);
    return [];
  }
}

const dictionaryFilePath = 'https://raw.githubusercontent.com/dwyl/english-words/master/words.txt';

var fetchDictionary = async url => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);
  const data = await response.text();
  return data;
}

function potentialSponsors(inputText) {
  fetchDictionary(dictionaryFilePath).then(dictionaryData => {
    const dictionary = loadDictionary(dictionaryData);
  
      function isWordValid(word) {
        return dictionary.includes(word.toLowerCase());
      }
      
      function removeNonDomain(word) {
        if (word.includes('https')) { word = word.replace('https', '') };
        if (word.includes('www')) { word = word.replace('www', '') };
        if (word.includes('com')) { word = word.substring(0, word.indexOf('com')) };
        return word;
      }
  
      function spellCheck(text) {
        const description = text.split(/\s+/);
        const result = new Set();
  
        for (const word of description) {
          const trimmedWord = (word.replace(/[^a-zA-Z]/g, '')).toLowerCase();
          if (trimmedWord.length > 0 && !isWordValid(trimmedWord)) {
            result.add(removeNonDomain(trimmedWord));
          }
        }
        return result
      }
  
      const potentialSponsors1 = spellCheck(inputText);

      console.log(potentialSponsors1);

      fetch('https://raw.githubusercontent.com/destonkmuo/Wake-Promo-Extension/main/static/companies.json').then(response => response.json()).then(companies => {
        console.log(companies);
      })


      return potentialSponsors;
  });
}
