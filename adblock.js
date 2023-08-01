function blockAdsOnNewVideo() {
    setInterval(function() {
        var skipButton = document.getElementsByClassName("ytp-ad-skip-button");
        if(skipButton != undefined && skipButton.length > 0) {
            console.log("ad detected");
            skipButton[0].click();
        }
    }, 100)
}

window.addEventListener("yt-navigate-finish", blockAdsOnNewVideo);