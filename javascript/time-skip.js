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
			if (result && result['showPromotionDuration'] == 'false') return;
			
			var ul = document.createElement('ul');

			ul.style.position = 'absolute';
			ul.style.width = '100%';
			ul.style.pointerEvents = 'none';
			ul.style.height = '100%';
			ul.style.transform = 'scaleY(.6) translateY(-30%) translateY(1.5px)';
			ul.style.zIndex = '42';
			ul.style.overflow = 'visible';
			ul.style.padding = '0px';
			ul.style.margin = '0px';
			ul.style.transition = 'transform 0.1s cubic-bezier(0, 0, 0.2, 1) 0s';
			ul.style.bottom = '0';

			var div = document.createElement('div');

			div.style.width =
				(100 * (promotionEndTime - promotionStartTime)) / videoDuration + '%'; // proportion of the diff to the duration of the vid
			div.style.height = '100%';
			div.style.background = 'black';
			div.style.marginLeft = (100 * promotionStartTime) / videoDuration + '%'; // Proportion of start pos
			div.style.transition = 'all 200ms ease-in-out';
			div.style.opacity = '100%';
			div.style.position = 'absolute';

			ul.appendChild(div);
			document.getElementsByClassName("ytp-progress-bar")[0].appendChild(ul);
			document.getElementsByClassName("ytp-progress-bar")[0].addEventListener('mouseover', function() { ul.style.transform = 'scaleY(1)'; })
			document.getElementsByClassName("ytp-progress-bar")[0].addEventListener('mouseout', function() { ul.style.transform = 'scaleY(.6)'; })
			createdElements.push(ul);
			console.log(ul);
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

//NOTE: ADD a feature that saves all videos on users page. For it to recall if they accidentally refreshed