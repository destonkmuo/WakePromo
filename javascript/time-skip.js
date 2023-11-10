/* NOTES
  //transform it using the ratio of (time of promo)/(video duration) to (pixel amount)/(width of progress bar)
  // The indicators shouldn't be hoverable or clickable and they should be semi transparent
  // full screen implementation
  //mainVideo.currentTime = 60;
*/

var createdElements = [];

function createTimeStamp(promotionStartTime, promotionEndTime, videoDuration) {
	try {
		chrome.storage.sync.get(['showPromotionDuration'], function (result) {
			if (result && result['showPromotionDuration'] == 'false') {
				return;
			}

			var div = document.createElement('div');

			div.style.width =
				(100 * (promotionEndTime - promotionStartTime)) / videoDuration + '%'; // proportion of the diff to the duration of the vid
			div.style.height = '100%';
			div.style.background = 'black';
			div.style.borderRadius = '1px';
			div.style.marginLeft = (100 * promotionStartTime) / videoDuration + '%'; // Proportion of start pos
			div.style.transition = 'all 200ms ease-in-out';
			div.style.opacity = '100%';
			div.style.position = 'absolute';

			document.getElementById("previewbar").appendChild(div);
			createdElements.push(div);
		});
	} catch (error) {}
}

function videoSkipTo(promotionEndTime) {
	var video = document.getElementsByClassName('video-stream html5-main-video')[0];
	video.currentTime = promotionEndTime;
}

function timeSkipSuggestion(promotionEndTime) {
	//videoSkipTo(promotionEndTime);// btn on click invoke this fnc
}

window.addEventListener('yt-navigate-start', function () {
	createdElements.forEach((element) => element.remove());
});
