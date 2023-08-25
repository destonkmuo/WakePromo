var currentVideoName;
var currentVideoData;
var chart;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
	const activeTab = tabs[0];
	if (activeTab.url.includes('youtube.com')) {
		chrome.tabs.sendMessage(activeTab.id, { isPopupOpen: true });
	}
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, { isPopupOpen: false });
	});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'videoInfo') {
		console.log(message);

		function createChart() {
			currentVideoData = message.data;

			document.getElementById('copy-details').addEventListener("click", (event) => {
				console.log(message.responseData);
				navigator.clipboard.writeText(message.responseData);
			});

			var xValues = [];
			var yValues = [];

			for (const sponsor in currentVideoData) {
				xValues.push(sponsor);
				yValues.push(currentVideoData[sponsor].count);
			}

			Chart.defaults.global.defaultFontColor = '#fff';

			if (xValues.length != 0 && chart == undefined) {
				document.body.style.height = '500px';
				chart = new Chart('chart', {
					type: 'bar',
					data: {
						labels: xValues,
						datasets: [
							{
								backgroundColor: 'white',
								data: yValues,
							},
						],
					},
					options: {
						scales: {
							yAxes: [
								{
									ticks: {
										display: false,
										beginAtZero: true,
									},
								},
							],
						},
						legend: { display: false },
						title: {
							display: true,
							text: 'Potential Sponsors',
						},
					},
				});
			} else if (chart != undefined) {
                chart.options = {
					type: 'bar',
					data: {
						labels: xValues,
						datasets: [
							{
								backgroundColor: 'white',
								data: yValues,
							},
						],
					},
					options: {
						scales: {
							yAxes: [
								{
									ticks: {
										display: false,
										beginAtZero: true,
									},
								},
							],
						},
						legend: { display: false },
						title: {
							display: true,
							text: 'Potential Sponsors',
						},
					},
				}
                chart.update();
            }
		}

		if (currentVideoName != message.name) {
			createChart();
		}
		currentVideoName = message.name;
	}
});
