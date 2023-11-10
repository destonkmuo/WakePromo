function blockAdsOnNewVideo() {
    // Move the setInterval inside the callback to ensure the result is available
    setInterval(function() {
      var skipButton = document.getElementsByClassName("ytp-ad-skip-button");
      var video = document.getElementsByClassName("video-stream html5-main-video");
      var adShowing = document.getElementsByClassName("ad-showing");
      var surveyShowing = document.getElementsByClassName("ytp-ad-survey");

      try {
        if (adShowing[0] != undefined) {
          video[0].currentTime = video[0].duration;
          console.log("Skipped ad");
        }
        else if (surveyShowing[0] != undefined)
        {
          console.log("Skipped survey");
        }
        if (skipButton[0] != undefined)
        {
          skipButton[0].click();
          console.log("Skipping the button");
        }
      } catch(error) {}
    });
}

blockAdsOnNewVideo();

chrome.storage.sync.get(['skipAdvertisements'], function(result) {
  if (result['skipAdvertisements'] === "true")
  {
    window.addEventListener("yt-navigate-start", blockAdsOnNewVideo);
  } 
});