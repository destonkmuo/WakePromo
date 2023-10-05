function blockAdsOnNewVideo() {
      // Move the setInterval inside the callback to ensure the result is available
      setInterval(function() {
        var skipButton = document.getElementsByClassName("ytp-ad-skip-button");
        if (skipButton != undefined && skipButton.length > 0) {
          skipButton[0].click();
        }
      }, 1);
  }
  
  chrome.storage.sync.get(['skipAdvertisements'], function(result) {
    if (result['skipAdvertisements'] === "true") {
        window.addEventListener("yt-navigate-finish", blockAdsOnNewVideo);
    }
  });