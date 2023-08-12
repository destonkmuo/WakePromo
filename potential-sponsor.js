async function loadDictionary() {
	try {
		const response = await fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words.txt');
		if (!response.ok) throw new Error(response.statusText);
		const data = await response.text();
		return data.split('\n').map(word => word.trim().toLowerCase());
	} catch (error) {
		console.error('Error loading dictionary:', error.message);
		return [];
	}
}

var getRequest = async url => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(response.statusText);
	return response;
}

class YoutubeVideo {

	constructor(videoInfo) {
		this.description = videoInfo.description;
		this.title = videoInfo.title.split(/\s+/);
		this.channelTitle = videoInfo.channelTitle.split(/\s+/);
		this.tags = videoInfo.tags != undefined ? videoInfo.tags : [];
		this.category = videoInfo.category;
		this.duration = videoInfo.duration;
		this.sponsorClusters = {};
    	this.sponsors = {};
	}

	//NOTE: Find context and their synonyms and don't apply

	//remove common socials
	removeRedundant(set) {
		set.forEach(element => {
			if (commonRedundancies.includes(element))
				set.delete(element);
		})
		return set;
	}

  cleanSponsorFrequency() {
    const context = new Set();
    this.title.forEach(word => {if (word.length > 3) context.add(word.toLowerCase())});
    this.channelTitle.forEach(word => {if (word.length > 3) context.add(word.toLowerCase())});
    this.tags.forEach(word => {if (word.length > 3) context.add(word.toLowerCase())});

    context.forEach(context => {
      for (const sponsor in this.sponsors) {
        if (sponsor.includes(context)) {
          delete this.sponsors[sponsor];
        }
      }
    })
    for (const sponsor in this.sponsors) {
      if (this.sponsors[sponsor] < 3) // Threshold
        delete this.sponsors[sponsor];
    }
  }

  incSponsorFrequency(set, weight) {
    set = this.removeRedundant(set);
    set.forEach(element => {
      if (this.sponsors[element] == null) 
        this.sponsors[element] = 0;
      this.sponsors[element] += weight;
    })
  }

	//STEP 1: CHOOSE POTENTIAL SPONSOR WORDS
	async spellCheck() {
		const description = this.description.split(/\s+/);
		const dictionary = await loadDictionary();
		const result = new Set();

		function isWordValid(word) {
			return dictionary.includes(word.toLowerCase());
		}

		description.forEach(word => {
			const descRegExp = new RegExp(/\b[\w\d]+\b/g);
			const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
			if (trimmedWord.length >= 4 && !isWordValid(trimmedWord)) {
				result.add(trimmedWord);
			}
		})
    this.incSponsorFrequency(result,3);
		return this.removeRedundant(result);
	}

	capitalCheck() {
		const description = this.description.split(/\s+/);
		const result = new Set();

		description.forEach(word => {
			const descRegExp = new RegExp(/\d+|([A-Z])\w+/g);
			const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
      if (trimmedWord.length >= 4) {
				result.add(trimmedWord);
			}
		})
    this.incSponsorFrequency(result,1);
		return this.removeRedundant(result)
	}

	extractedLinksCheck() {
		const description = this.description.split(/\s+/);
		const result = new Set();

    //Get the end of links as well
		function removeNonDomainName(word) {
			if (word.includes('//')) {
				word = word.substring(word.indexOf('//') + 2, word.length)
			};
			if (word.includes('www.')) {
				word = word.replace('www.', '')
			};
			if (word.includes('.')) {
				word = word.substring(0, word.indexOf('.'))
			};

			return word;
		}

		description.forEach(word => {
			const descRegExp = new RegExp(/^(http.+)/g);
			var trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0] : "";
			trimmedWord = removeNonDomainName(trimmedWord);
			if (trimmedWord.length >= 4)
				result.add(trimmedWord);
		})
    this.incSponsorFrequency(result,1);
		return this.removeRedundant(result);
	}

	//Top of the Description priority
	firstBreadth() {
		const sentences = this.description.split('\n');
		const sentenceResult = [];
		//Get length and retrieve the first 1/4;
		const result = new Set();
		if(sentences.length < 4) { return result }
		for (var sentenceIndex = 0; sentenceIndex < 4; sentenceIndex++) {
			sentenceResult.push(sentences[sentenceIndex]);
		}

		sentenceResult.forEach(sentence => {
			var words = sentence.split(/\s+/);
			words.forEach(word => {
				const descRegExp = new RegExp(/\b[\w\d]+\b/g);
				const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
				if (trimmedWord.length >= 4)
					result.add(trimmedWord);
			})
		})
    this.incSponsorFrequency(result,1);
		return this.removeRedundant(result);
	}

	orgRecog() {
		var sentences = nlp(this.description).topics().organizations().out('array');

		var result = new Set();

		sentences.forEach(sentence => {
			const words = sentence.split(/\s+/);

			words.forEach(word => {
				const descRegExp = new RegExp(/\b[\w\d]+\b/g);
				const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
				if (trimmedWord.length >= 4)
					result.add(trimmedWord);
			})
		})
    this.incSponsorFrequency(result,1);
		return this.removeRedundant(result);
	}

	nounsRecog() {
		const sentences = this.description.split('\n');
		const sentenceResult = [];
		//Get length and retrieve the first 1/4;
		if(sentences.length < 4) { return result }
		for (var sentenceIndex = 0; sentenceIndex < 4; sentenceIndex++) {
			sentenceResult.push(sentences[sentenceIndex]);
		}
		var nlpSentences = nlp(sentenceResult.join(" ")).nouns().out('array');

		var result = new Set();

		nlpSentences.forEach(sentence => {
			const words = sentence.split(/\s+/);

			words.forEach(word => {
				const descRegExp = new RegExp(/\b[\w\d]+\b/g);
				const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
				if (trimmedWord.length >= 4)
					result.add(trimmedWord);
			})
		})
    this.incSponsorFrequency(result,1);
		return this.removeRedundant(result);
	}


	cleanClusters() {
		for (const sponsor in this.sponsorClusters) {
			if (this.sponsorClusters[sponsor].startTime == this.sponsorClusters[sponsor].endTime) {
				console.log(sponsor)
			delete this.sponsorClusters[sponsor];
			}
		}
	}

	generateTimeStamps() {
		for (const sponsor in this.sponsorClusters) {
			console.log(this.sponsorClusters[sponsor].startTime, this.sponsorClusters[sponsor].endTime);
			createTimeStamp(this.sponsorClusters[sponsor].startTime, this.sponsorClusters[sponsor].endTime, this.duration);	
		}
	}

	//Filters

	//Link withing 5-10 words
	proximityToLink() {

	}

	//Proximity to synonym
	proximityToSynonym() {

	}

	//context


	getCompanies() {
		return getRequest('https://raw.githubusercontent.com/destonkmuo/Wake-Promo-Extension/main/static/companies.json');
	}
	//STEP 2: QUERY TRANSCRIPT (Check if it is includes it or has a levenshtein distance >= 65%)
}