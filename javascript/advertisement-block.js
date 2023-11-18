function blockAdsOnNewVideo() {
    // Move the setInterval inside the callback to ensure the result is available
    setInterval(function() {
      var skipButton1 = document.getElementsByClassName("ytp-ad-skip-button-text");
      var skipButton2 = document.getElementsByClassName("ytp-ad-skip-button-modern");
      var video = document.getElementsByClassName("video-stream html5-main-video");
      var adShowing = document.getElementsByClassName("ad-showing");
      var surveyShowing = document.getElementsByClassName("ytp-ad-survey");

      try {
        if (adShowing[0] != undefined) 
          video[0].currentTime = video[0].duration;
        else if (surveyShowing[0] != undefined)
          console.log("Skipped survey");
        
        if (skipButton1[0] != undefined)
          skipButton1[0].click();
        elseif(skipButton2[0] != undefined)
          skipButton2[0].click();
        
        document.getElementsById("player-ads").remove();
      } catch(error) {}
    });
    
    //ytp-play-progress
}

blockAdsOnNewVideo();

chrome.storage.sync.get(['skipAdvertisements'], function(result) {
  if (result['skipAdvertisements'] === "true")
  {
    window.addEventListener("yt-navigate-start", blockAdsOnNewVideo);
  } 
});