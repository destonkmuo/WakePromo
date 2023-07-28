let eventProcessed;

function OnNewVideo() {
    var searchQuery = this.location.search
    if (eventProcessed == searchQuery) { return } //Makes sure the URL is different from the last to prevent sending multiple request
    
    eventProcessed = searchQuery

    //Accesses the search query and looks for "?v=" and returns the video ID
    var endOfQuery = searchQuery.indexOf("&") > 0 && searchQuery.indexOf("&") || searchQuery.length;
    var videoId = decodeURIComponent(this.location.search.substring(searchQuery.indexOf("?v=") + 3, endOfQuery))

    //Scrapes through the body of the HTML file and accesses the transcript API
    var transcriptRegExp = new RegExp(/playerCaptionsTracklistRenderer.*?(youtube.com\/api\/timedtext.*?)"/);
    var transcriptURL = decodeURIComponent(JSON.parse(`"${transcriptRegExp.exec(document.body.innerHTML)[1] + "&fmt=json3"}"`));

    if (transcriptURL == null || videoId == null) { return }

    transcriptURL = transcriptURL.substring(12, transcriptURL.length);

    var getJSON = async url => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        return data;
    }

    //Fetches the videos description using youtubes API

    console.log(transcriptURL);

    fetch(transcriptURL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(jsonData => {
      // Process the JSON data here
      console.log(jsonData);
    })
    .catch(error => {
      console.error('Error:', error.message);
    });
        

    getJSON(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyDYT9crIFi_OXGxtdr4gkfe2gRKykgFuyU`).then(attributes => {
        console.log(attributes.items[0].snippet.description)
    })
}


//Whenever the user changes the video update the attributes of the page
window.addEventListener('yt-update-title', OnNewVideo);