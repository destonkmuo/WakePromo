function blockAdsOnNewVideo() {
      // Move the setInterval inside the callback to ensure the result is available
      setInterval(function() {
        var skipButton = document.getElementsByClassName("ytp-ad-skip-button");
        var video = document.getElementsByClassName("video-stream html5-main-video");
        var adShowing = document.getElementsByClassName("ad-showing");
        if (adShowing[0] != undefined) {
          video[0].currentTime = video[0].duration;
          skipButton[0].click();
          console.log("skipped ad");
        }
      }, 1);
  }
  
  chrome.storage.sync.get(['skipAdvertisements'], function(result) {
    if (result['skipAdvertisements'] === "true") {
        window.addEventListener("yt-navigate-finish", blockAdsOnNewVideo);
    }
  });