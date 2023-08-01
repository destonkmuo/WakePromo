function blockAdsOnNewVideo() {
    setInterval(function() {
        var skipButton = document.getElementsByClassName("ytp-ad-skip-button");
        if(skipButton != undefined && skipButton.length > 0 && localStorage.getItem("blockAdvertisements") == "true") {
            skipButton[0].click();
        }
    }, 100)
}

window.addEventListener("yt-navigate-finish", blockAdsOnNewVideo);