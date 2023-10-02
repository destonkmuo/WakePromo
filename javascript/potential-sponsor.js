async function loadDictionary() {
	try {
		const response = await fetch(
			'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt',
		);
		if (!response.ok) throw new Error(response.statusText);
		const data = await response.text();
		return data.split('\n').map((word) => word.trim().toLowerCase());
	} catch (error) {
		console.error('Error loading dictionary:', error.message);
		return [];
	}
}

var getRequest = async (url) => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(response.statusText);
	return response;
};

//Make a 'compile' fnc that loops through this.sponsor and passes through the individual fncs
class PotentialSponsor {
	constructor({
		description,
		title,
		channelTitle,
		tags,
		category,
		duration,
		transcript,
	}) {
		this.description = description;
		this.descriptionSentences = this.description
			.split('\n')
			.filter((sentence) => sentence.length > 1);
		this.descriptionWords = this.description.split(/\s+/);
		this.title = title.replace(/[^a-zA-Z]/g, ' ').split(/\s+/);
		this.channelTitle = channelTitle.replace(/[^a-zA-Z]/g, ' ').split(/\s+/);
		this.tags = tags != undefined ? tags : [];
		this.category = category;
		this.duration = duration;
		this.transcript = transcript;
		this.sponsorClusters = {};
		this.PotentialSponsors = {};
		this.sponsors = {};
		this.keyTerms = [
			'sponsor',
			'sponsoring',
			'sponsorship',
			'promotion',
			'promo',
			'advert',
			'advertise',
			'advertisement',
			'%',
			'trial',
			'$',
			'partner',
			'sign',
			'learn',
			'thanks',
			'save',
			'code',
			'you',
			'sale',
			'checkout',
			'slash',
			'brought',
			'purchase'
		];
		this.ignore = new Set([
			'code',
			'shipping',
			'free',
			'channel',
			'wifi',
			'http',
			'https',
			'video',
			'podcast',
			'referals',
			'vlog',
			'watch',
			'youtube',
			'twitter',
			'twitch',
			'discord',
			'your',
			'tech',
			'store'
		]);
	}

	//ACTIONS
	cleanClusters() {
		for (const sponsor in this.sponsorClusters) {
			if (this.sponsorClusters[sponsor].endTime - this.sponsorClusters[sponsor].startTime < 5)
				delete this.sponsorClusters[sponsor];	
		}
	}

	generateTimeStamps() {
		for (const sponsor in this.sponsorClusters) {
			createTimeStamp(
				this.sponsorClusters[sponsor].startTime,
				this.sponsorClusters[sponsor].endTime,
				this.duration,
			);
		}
	}


	incSponsorFrequency(set, weight, sponsorSet) {
		set.forEach((element) => {
			if (sponsorSet[element] == null) sponsorSet[element] = 0;
			sponsorSet[element] += weight;
		});
	}

	cleanSponsorFrequency() {
		const context = new Set();

		//Generate Context
		const videoAttributes = [
			this.title,
			this.channelTitle,
			//this.tags,
		];

		videoAttributes.forEach((attribute) => {
			attribute.forEach((word) => {
				if (word.length > 2) context.add(word.toLowerCase());
			});
		});

		context.forEach((context) => {
			for (const sponsor in this.PotentialSponsors) {
				//Remove context and low threshold elements
				if (sponsor.includes(context) ||
					this.PotentialSponsors[sponsor] <= 5 ||
					sponsor.length <= 3 ||
					!isNaN(sponsor) ||
					this.ignore.has(sponsor)) {
					delete this.PotentialSponsors[sponsor];
				}
			}
		});
	}

	//Potential Sponsors
	async spellCheck() {
		const description = this.descriptionWords;
		const dictionary = await loadDictionary();
		var result = new Set();

		function isWordValid(word) {
			return dictionary.includes(word.toLowerCase());
		}

		description.forEach((word) => {
			const descRegExp = new RegExp(/\b[\w\d]+\b/g);
			const trimmedWord =
				word.match(descRegExp) != null ?
				word.match(descRegExp)[0].toLowerCase() :
				'';
			if (trimmedWord.length >= 3 && !isWordValid(trimmedWord)) {
				result.add(trimmedWord);
			}
		});

		this.incSponsorFrequency(result, 7, this.PotentialSponsors);
		return result;
	}

	capitalCheck() {
		const description = this.descriptionWords;
		var result = new Set();

		description.forEach((word) => {
			const descRegExp = new RegExp(/\d+|([A-Z])\w+/g);
			const trimmedWord =
				word.match(descRegExp) != null ?
				word.match(descRegExp)[0].toLowerCase() :
				'';
			if (trimmedWord.length >= 3) {
				result.add(trimmedWord);
			}
		});

		//ADDITION: If 2 or more words are within close proximity join them with a space instead of individuals

		this.incSponsorFrequency(result, 2, this.PotentialSponsors);
		return result;
	}

	extractedLinksCheck() {
		var result = new Set();

		//Get the end of links as well
		function removeNonDomainName(url) {
			if (url.includes('//')) {
				url = url.substring(url.indexOf('//') + 2, url.length);
			}
			if (url.includes('/')) {
				url = url.substring(0, url.indexOf('/'));
			}
			return url.match(/\b[\w\d]+\b/g);
		}

		function removeNonPath(url) {
			if (url.includes('//')) {
				url = url.substring(url.indexOf('//') + 2, url.length);
			}
			if (url.includes('/')) {
				url = url.substring(url.indexOf('/') + 1, url.length);
			}
			return url;
		}

		const descRegExp = new RegExp(/(http.+)/g);
		const urls =
			this.description.match(descRegExp) != null ?
			this.description.match(descRegExp) : [];

		urls.forEach((url) => {
			var nonDomain = removeNonDomainName(url);
			removeNonDomainName(url) != null ?
				nonDomain.forEach((domainPart) => {
					if (domainPart.length >= 3) result.add(domainPart.toLowerCase());
				}) :
				'';
			const removeNonPathRegex = removeNonPath(url).match(/\d+|([a-zA-Z])\w+/);
			const nonPath = removeNonPathRegex != null ? removeNonPathRegex : [];

			nonPath.forEach((pathElement) => {
				if (pathElement != undefined && pathElement.length >= 3)
					result.add(pathElement.toLowerCase());
			});
		});

		this.incSponsorFrequency(result, 8, this.PotentialSponsors);
		return result;
	}

	nounsRecog() {
		var result = new Set();
		const nlpSentences = nlp(this.description)
			.match('#ProperNoun')
			.out('array');

		nlpSentences.forEach((sentence) => {
			const words = sentence.split(/\s+/);

			words.forEach((word) => {
				const descRegExp = new RegExp(/\b[\w\d]+\b/g);
				const trimmedWord =
					word.match(descRegExp) != null ?
					word.match(descRegExp)[0].toLowerCase() :
					'';
				if (trimmedWord.length >= 3) result.add(trimmedWord);
			});
		});
		this.incSponsorFrequency(result, 3, this.PotentialSponsors);
		return result;
	}
	//Guaranteed filter
	async companyRecog() {
		var result = new Set();
		const description = this.descriptionWords;
		const companies = await (
			await getRequest(
				'https://raw.githubusercontent.com/destonkmuo/Wake-Promo-Extension/main/static/companies.json',
			)
		).json();

		description.forEach((word) => {
			for (const company in companies) {
				const descRegExp = new RegExp(/\b[\w\d]+\b/g);
				const trimmedWord =
					word.match(descRegExp) != null ?
					word.match(descRegExp)[0].toLowerCase() :
					'';
				if (
					trimmedWord.length >= 3 &&
					similarity(companies[company].toLowerCase(), trimmedWord) >
					0.85
				) {
					result.add(trimmedWord);
				}
			}
		});

		this.incSponsorFrequency(result, 7, this.PotentialSponsors);
		return result;
	}

	//Filters
	firstBreadth() {
		var result = new Set();
		const descRegExp = new RegExp(/\b[\w\d]+\b/g);
		const shortDesc = this.descriptionSentences
			.filter((sentence) => this.descriptionSentences.indexOf(sentence) < 5)
			.join(' ')
			.match(descRegExp)
			.join(' ')
			.toLowerCase();

		for (const potentialSponsor in this.PotentialSponsors) {
			if (shortDesc.includes(potentialSponsor)) result.add(potentialSponsor);
		}

		this.incSponsorFrequency(result, 5, this.sponsors);
		return result;
	}

	//Proximity to Links
	proximityToLink() {
		var result = new Set();

		this.descriptionSentences.forEach((sentence) => {
			if (sentence.includes('http')) {
				for (const potentialSponsor in this.PotentialSponsors) {
					if (sentence.toLowerCase().includes(potentialSponsor)) {
						result.add(potentialSponsor);
					}
				}
			}
		});

		this.incSponsorFrequency(result, 5, this.sponsors);
		return result;
	}

	//Proximity to Key Words
	proximityToRelevance() {
		var result = new Set();

		this.descriptionSentences.forEach((sentence) => {
			sentence = sentence.toLowerCase();
			this.keyTerms.forEach((term) => {
				if (sentence.includes(term)) {
					for (const potentialSponsor in this.PotentialSponsors) {
						if (sentence.includes(potentialSponsor))
							result.add(potentialSponsor);
					}
				}
			});
		});

		this.incSponsorFrequency(result, 3, this.sponsors);
		return result;
	}

	//NOTE: We can also determine if they're still promting the sponsor by using keywords
	transcriptProximityToRelevance() {
		var result = new Set();

		this.transcript.forEach((element) => {
			const sentence = element.sentence;
			const words = sentence.split(/\s/);

			this.keyTerms.forEach((term) => {
				if (sentence.includes(term)) {
					words.forEach((word) => {
						if (word.length >= 3) {
							for (const potentialSponsor in this.PotentialSponsors) {
								if (
									similarity(word, potentialSponsor) > 0.7 ||
									word.includes(potentialSponsor) ||
									potentialSponsor.includes(word)
								)
									result.add(potentialSponsor);
							}
						}
					});
				}
			});
		});

		this.incSponsorFrequency(result, 5, this.sponsors);
		return result;
	}
	//User can input a chat gpt api key and I will handle the prompts
	async gptAnalysis() {
		const gpt_prompt = ``;
		try {
			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${gtk}`,
				},
				body: JSON.stringify({
					model: 'gpt-3.5-turbo',
					messages: [{ role: 'user', content: gpt_prompt }],
					temperature: 1.0,
					top_p: 0.7,
					n: 1,
					stream: false,
					presence_penalty: 0,
					frequency_penalty: 0,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				return JSON.parse(data.choices[0].message.content);
			} else {
				throw new Error('Unable to process your request.');
			}
		} catch (error) {
			console.error(error);
		}
	}
}