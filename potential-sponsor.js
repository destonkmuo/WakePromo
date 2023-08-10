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

var getRequest = async url => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);
  return response;
}

async function potentialSponsors(videoInfo) {
  //STEP 1: CHOOSE POTENTIAL SPONSOR WORDS
  const dictionaryData = await fetchDictionary(dictionaryFilePath)
  const dictionary = loadDictionary(dictionaryData);

  //Context from title

  //Potential Sponsors
  function spellCheck(text) {
      const description = text.split(/\s+/);
      const result = new Set();

      function isWordValid(word) {
        return dictionary.includes(word.toLowerCase());
      }

      for (const word of description) {
          const descRegExp = new RegExp(/[a-zA-Z]+/g);
          const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
          if (trimmedWord.length > 2 && !isWordValid(trimmedWord)) {
              result.add(trimmedWord);
          }
      }
      return result
  }

  function capitalCheck(text) {
    const description = text.split(/\s+/);
    const result = new Set();

    for (const word of description) {
        const descRegExp = new RegExp(/([A-Z])\w+/g);
        const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
        if (trimmedWord.length > 2) {
            result.add(trimmedWord);
        }
    }

    return result
  }

  function extractedLinksCheck(text) {
    const description = text.split(/\s+/);
    const result = new Set();

    function removeNonDomainName(word) {
      if (word.includes('//')) { word = word.substring(word.indexOf('//')+2, word.length) };
      if (word.includes('www.')) { word = word.replace('www.', '') };
      if (word.includes('.')) { word = word.substring(0, word.indexOf('.')) };

      return word;
    }

    for (const word of description) {
        const descRegExp = new RegExp(/^(http.+)/g);
        var trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0] : "";
        trimmedWord = removeNonDomainName(trimmedWord);
        if (trimmedWord.length > 2)
          result.add(trimmedWord);
    }

    return result
  }

  //Top of the Description priority
  function firstBreadth(text) {
    const sentences = text.split('\n');
    const sentenceResult = [];
    //Get length and retrieve the first 1/4;
    for (var sentenceIndex = 0; sentenceIndex < Math.ceil(sentences.length/4); sentenceIndex++){ 
      sentenceResult.push(sentences[sentenceIndex]);
    }

    const result = new Set();
    sentenceResult.forEach(sentence => {
      var words = sentence.split(/\s+/);
      words.forEach(word => {
        const descRegExp = new RegExp(/[a-zA-Z]+/g);
        const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
        if (trimmedWord.length > 2) {
          result.add(trimmedWord);
        }
      })
    })
    return result;
  }

  function orgRecog(text) {
    var description = nlp(text).topics().organizations().text();
    const descRegExp = new RegExp(/([A-Z])\w+/g);
    const match = description.match(descRegExp) != null ? description.match(descRegExp) : "";
    const result = new Set();

    match.forEach(element => {
      result.add(element.toLowerCase());
    });
    return result;
  }

  commonSocials = ['twitter', 'tiktok', 'facebook', 'instagram', 'youtube', 'itunes', 'snapchat', 'reddit', 'discord', 'twitch', 'geni', 'lmg', 'youtu', 'spoti'];
  
  //remove common socials
  function removeSocials(set) {
    set.forEach(element => {
      if (commonSocials.includes(element))
        set.delete(element);
    })
    return set;
  }

  const potentialSponsors1 = removeSocials(spellCheck(videoInfo.description));
  const potentialSponsors2 = removeSocials(capitalCheck(videoInfo.description));
  const potentialSponsors3 = removeSocials(extractedLinksCheck(videoInfo.description));
  const potentialSponsors4 = removeSocials(firstBreadth(videoInfo.description));
  const potentialSponsors5 = orgRecog(videoInfo.description);

  console.log(potentialSponsors1,potentialSponsors2,potentialSponsors3, potentialSponsors4, potentialSponsors5)

  //Filters
  var potentialSponsorsList = [{}];


  //Link withing 5-10 words
  function proximityToLink() {

  }

  //Proximity to synonym
  function proximityToSynonym() {

  }

  //context


  const companiesJSON = await (await getRequest('https://raw.githubusercontent.com/destonkmuo/Wake-Promo-Extension/main/static/companies.json')).json();

  //STEP 2: QUERY TRANSCRIPT (Check if it is includes it or has a levenshtein distance >= 65%)

  console.log(similarity('twitch', 'switch'));

  //STEP 3: GATHER DATA

  return potentialSponsors;

}