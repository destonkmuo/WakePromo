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
		this.title = videoInfo.title;
		this.channelTitle = videoInfo.channelTitle;
		this.tags = videoInfo.tags;
		this.category = videoInfo.category;
		this.duration = videoInfo.duration;
		this.commonSocials = ['twitter', 'tiktok', 'facebook', 'instagram', 'youtube', 'itunes', 'snapchat', 'reddit', 'discord', 'twitch', 'geni', 'lmg', 'youtu', 'spoti', 'soundcloud'];
	}

	//NOTE: Find context and their synonyms and don't apply

	//remove common socials
	removeSocials(set) {
		set.forEach(element => {
			if (this.commonSocials.includes(element))
				set.delete(element);
		})
		return set;
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
			if (trimmedWord.length > 4 && !isWordValid(trimmedWord)) {
				result.add(trimmedWord);
			}
		});
		return this.removeSocials(result);
	}

	capitalCheck() {
		const description = this.description.split(/\s+/);
		const result = new Set();

		description.forEach(word => {
			const descRegExp = new RegExp(/\d([A-Z])\w+/g);
			const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
			if (trimmedWord.length > 4) {
				result.add(trimmedWord);
			}
		});
		return this.removeSocials(result)
	}

	extractedLinksCheck() {
		const description = this.description.split(/\s+/);
		const result = new Set();

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
			if (trimmedWord.length > 4)
				result.add(trimmedWord);
		})

		return this.removeSocials(result);
	}

	//Top of the Description priority
	firstBreadth() {
		const sentences = this.description.split('\n');
		const sentenceResult = [];
		//Get length and retrieve the first 1/4;
		for (var sentenceIndex = 0; sentenceIndex < Math.ceil(sentences.length / 4); sentenceIndex++) {
			sentenceResult.push(sentences[sentenceIndex]);
		}

		const result = new Set();
		sentenceResult.forEach(sentence => {
			var words = sentence.split(/\s+/);
			words.forEach(word => {
				const descRegExp = new RegExp(/\b[\w\d]+\b/g);
				const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
				if (trimmedWord.length > 4)
					result.add(trimmedWord);
			})
		})
		return this.removeSocials(result);
	}

	orgRecog() {
		var sentences = nlp(this.description).topics().organizations().out('array');

		var result = new Set();

		sentences.forEach(sentence => {
			const words = sentence.split(/\s+/);

			words.forEach(word => {
				const descRegExp = new RegExp(/\b[\w\d]+\b/g);
				const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
				if (trimmedWord.length > 4)
					result.add(trimmedWord);
			})
		})
		return this.removeSocials(result);
	}

	nounsRecog() {
		var sentences = nlp(this.description).nouns().out('array');

		var result = new Set();

		sentences.forEach(sentence => {
			const words = sentence.split(/\s+/);

			words.forEach(word => {
				const descRegExp = new RegExp(/\b[\w\d]+\b/g);
				const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
				if (trimmedWord.length > 4)
					result.add(trimmedWord);
			})
		})
		return this.removeSocials(result);
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
console.log(similarity('twitch', 'switch'));