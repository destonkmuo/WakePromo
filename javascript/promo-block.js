function OnNewVideo() {
  //ADD: Delete all created elements from an array

  var searchQuery = this.location.search

  //Accesses the search query and returns the video ID after "?v="
  var endOfQuery = searchQuery.indexOf("&") > 0 && searchQuery.indexOf("&") || searchQuery.length;
  var videoID = decodeURIComponent(this.location.search.substring(searchQuery.indexOf("?v=") + 3, endOfQuery))

  //Scrapes through the body of the HTML file and accesses the transcript API
  var transcriptRegExp = new RegExp(/playerCaptionsTracklistRenderer.*?(youtube.com\/api\/timedtext.*?)"/);

  var getInnerHTML = async _ => {
    const response = await fetch(searchQuery);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.text();
    return data;
  }

  var getJSON = async url => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data;
  }

  getInnerHTML().then(text => {
    //Guard condition
    if (transcriptRegExp.exec(text) == null || videoID == null || videoID == "") { return }

    //Formats and finalizes the transcript URL
    var transcriptURL = decodeURIComponent(JSON.parse(`"${transcriptRegExp.exec(text)[1] + "&fmt=json3"}"`));
    transcriptURL = transcriptURL.substring(12, transcriptURL.length);

    //NOTE: Before using any time skip fncs make sure that the video is present if not wait.

    timeSkipIndicator(10, 60);

    //NOTE: Train the model for sentences like "link in the description"
    getJSON(transcriptURL).then(transcriptJSON => {
        var transcript = [];
        var events = transcriptJSON.events;

        for (speechSegment in events) {
            var sentence = events[speechSegment].segs != null && events[speechSegment].segs || null;
            //Filters out sentences that return as null or new line text
            if (sentence == null || sentence[0].utf8 == "\n") { continue }
            //Pushes the sentence and time stamp to the transcript array
            transcript.push({ time: events[speechSegment].tStartMs / 1000, sentence: (sentence.map(word => word.utf8).join("")).replace('\n',"")});
        }
        console.log(transcript);
    })

    //Fetches the videos description using youtubes API
    getJSON(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=AIzaSyDYT9crIFi_OXGxtdr4gkfe2gRKykgFuyU`).then(videoJSON => {
        const attributes = videoJSON.items[0].snippet;
        var videoInfo = [{ description: attributes.description, title: attributes.title, channelTitle: attributes.channelTitle, tags: attributes.tags, category: attributes.categoryId}]
        console.log(videoInfo)
    })

    /* Once all data is collected and is useable:
    
    chrome.storage.sync.get(['skipAdvertisements'], function(result) {
        setInterval(function() {
        var video = document.getElementsByClassName('video-stream html5-main-video')[0];
        if (video.currentTime == promotionStartTime - 2 && result['skipAdvertisements] == "true"){
          videoSkipTo(promotionEndTime);
        } else if (video.currentTime == promotionStartTime - 5 && result['skipAdvertisements] == "false") {
          timeSkipSuggestion(promotionEndTime);
        }
    }, 500)
    }


    
     */
  })
}

//User changes video => update the attributes of the page
window.addEventListener("yt-navigate-finish", OnNewVideo);
