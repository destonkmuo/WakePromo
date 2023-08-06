/* NOTES
  //transform it using the ratio of (time of promo)/(video duration) to (pixel amount)/(width of progress bar)
  // The indicators shouldn't be hoverable or clickable and they should be semi transparent
  // full screen implementation
  //mainVideo.currentTime = 60;
*/

var createdElements = [];

function timeSkipIndicator(promotionStartTime, promotionDuration) {
    // Check if the extension context is still valid before proceeding
    chrome.storage.sync.get(['showPromotionDuration'], function(result) {
        if (result && result['showPromotionDuration'] == "false") { return; }

        var video = document.getElementsByClassName('video-stream html5-main-video')[0];

        function addTimeSkip() {
            var progressBar = document.getElementsByClassName('ytp-timed-markers-container')[0];
            var videoDuration = video.duration;
            var div = document.createElement("div");
    
            div.style.width = 100 * promotionDuration/videoDuration+"%"; // proportion of the diff to the duration of the vid
            div.style.height = "101%";
            div.style.background = "black";
            div.style.borderRadius = "1px";
            div.style.marginLeft = 100 * promotionStartTime/videoDuration+"%"; // Proportion of start pos
            div.style.transition = 'all 200ms ease-in-out';
            div.style.opacity = "50%";
            progressBar.addEventListener("mouseenter", function() { 
                div.style.opacity = "90%";
            })
            progressBar.addEventListener("mouseleave", function() { 
                div.style.opacity = "50%";
            })
        
            progressBar.appendChild(div);
            createdElements.push(div);   
        }

        if (!isNaN(video.duration)) {
            addTimeSkip();
        } else {
            video.oncanplay = addTimeSkip();
        }
    });
}

function videoSkipTo(promotionEndTime) {
    var video = document.getElementsByClassName('video-stream html5-main-video')[0];
    video.currentTime = promotionEndTime;
}

function timeSkipSuggestion(promotionEndTime) {
    videoSkipTo(promotionEndTime);// btn on click invoke this fnc
}

window.addEventListener("yt-navigate-start", function() {
    createdElements.forEach(element => element.remove());
});