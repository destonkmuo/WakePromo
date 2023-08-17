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

class PotentialSponsor {

    constructor(videoInfo) {
        this.description = videoInfo.description;
        this.title = videoInfo.title.replace(/[^a-zA-Z]/g, ' ').split(/\s+/);
        this.channelTitle = videoInfo.channelTitle.replace(/[^a-zA-Z]/g, ' ').split(/\s+/);
        this.tags = videoInfo.tags != undefined ? videoInfo.tags : [];
        this.category = videoInfo.category;
        this.duration = videoInfo.duration;
        this.sponsorClusters = {};
        this.sponsors = {};
    }

    //NOTE: Find context and their synonyms and don't apply

    //ACTIONS
	cleanClusters() {
        for (const sponsor in this.sponsorClusters) {
            if (this.sponsorClusters[sponsor].startTime == this.sponsorClusters[sponsor].endTime) {
                delete this.sponsorClusters[sponsor];
            }
        }
    }

    generateTimeStamps() {
        for (const sponsor in this.sponsorClusters) {
			createTimeStamp(this.sponsorClusters[sponsor].startTime, this.sponsorClusters[sponsor].endTime, this.duration);
        }
    }

	incSponsorFrequency(set, weight) {
        set.forEach(element => {
            if (this.sponsors[element] == null) this.sponsors[element] = 0;
            this.sponsors[element] += weight;
        })
    }

    cleanSponsorFrequency() {
        const context = new Set();

		const videoAttributes = [this.title, this.channelTitle, this.tags];

		//Generate Context
		videoAttributes.forEach(attribute => {
			attribute.forEach(word => {
				if (word.length > 2) context.add(word.toLowerCase())
			});
		})

        context.forEach(context => {
            for (const sponsor in this.sponsors) {
				//Remove context and low threshold elements
                if (similarity(sponsor, context) > .7 || this.sponsors[sponsor] < 4) {
					delete this.sponsors[sponsor];
				}
            }
        })
    }

	firstBreadth() {
		const sentences = this.description.split('\n').filter(sentence => sentence.length > 1);
		const sentenceResult = [];

		for (var sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex++) {
			if (sentences[sentenceIndex].length < 1) delete sentences[sentenceIndex];
			
			sentenceResult.push(sentences[sentenceIndex]);

			if (sentenceIndex == 4) break;
		}

		return sentenceResult.join('\n');
	}

	//SPONSOR FIN
    async spellCheck() {
        const description = this.firstBreadth().split(/\s+/);
        const dictionary = await loadDictionary();
        var result = new Set();

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
        this.incSponsorFrequency(result, 1);
        return result;
    }

    capitalCheck() {
        const description = this.firstBreadth().split(/\s+/);
        var result = new Set();

        description.forEach(word => {
            const descRegExp = new RegExp(/\d+|([A-Z])\w+/g);
            const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
            if (trimmedWord.length >= 4) {
                result.add(trimmedWord);
            }
        })
        this.incSponsorFrequency(result, 1);
        return result;
    }

    extractedLinksCheck() {
        const description = this.firstBreadth();
        var result = new Set();

        //Get the end of links as well
        function removeNonDomainName(url) {
            if (url.includes('//')) {
                url = url.substring(url.indexOf('//') + 2, url.length);
            }
            if (url.includes('www.')) {
                url = url.replace('www.', '');
            }
            if (url.includes('.')) {
                url = url.substring(0, url.indexOf('.'));
            }

            return url;
        }

		function removeNonPath(url) {
			if (url.includes('//')) {
                url = url.substring(url.indexOf('//') + 2, url.length);
            };
			if (url.includes('/')) {
				url = url.substring(url.indexOf('/') + 1, url.length);
			}
			return url;
		}

		const descRegExp = new RegExp(/(http.+)/g);
		var urls = description.match(descRegExp) != null ? description.match(descRegExp) : [];
		urls.forEach(url => {
			var nonDomain = removeNonDomainName(url);
			if (nonDomain.length > 3) result.add(nonDomain.toLowerCase());
			
			var nonPath = removeNonPath(url).match(new RegExp(/\d+|([a-zA-Z])\w+/)) != null ? removeNonPath(url).match(new RegExp(/\d+|([a-zA-Z])\w+/)) : [];
			nonPath.forEach(pathElement => {
				if (pathElement.length > 3) result.add(pathElement.toLowerCase());
			})
		})
        
        this.incSponsorFrequency(result, 3)
        return result;
    }

    nounsRecog() {
		const description = this.firstBreadth();

		var result = new Set();
        //Get length and retrieve the first 1/4;
        var nlpSentences = nlp(description).match('#ProperNoun').out('array');

        nlpSentences.forEach(sentence => {
            const words = sentence.split(/\s+/);

            words.forEach(word => {
                const descRegExp = new RegExp(/\b[\w\d]+\b/g);
                const trimmedWord = word.match(descRegExp) != null ? word.match(descRegExp)[0].toLowerCase() : "";
                if (trimmedWord.length >= 4)
                    result.add(trimmedWord);
            })
        })
        this.incSponsorFrequency(result, 1);
        return result;
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