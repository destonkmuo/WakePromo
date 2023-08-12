//On Open
var currentVideoName;
var currentVideoData;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if(activeTab.url.includes('youtube.com')) {
        chrome.tabs.sendMessage(activeTab.id, {isPopupOpen: true});
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { isPopupOpen: false});
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'video') {
        
        function createChart() {
            currentVideoData = message.data;
            
            var xValues = [];
            var yValues = [];

            for (const sponsor in currentVideoData) {
                xValues.push(sponsor);
                yValues.push(currentVideoData[sponsor].count * 10);
            }

            console.log(yValues);

            Chart.defaults.global.defaultFontColor = "#fff";
    
            if (xValues.length != 0) {
                document.body.style.height = '500px';
                new Chart("chart", {
                    type: "bar",
                    data: {
                      labels: xValues,
                      datasets: [{
                        backgroundColor: 'white',
                        data: yValues
                      }]
                    },
                    options: {
                      scales: {
                          yAxes: [{
                              ticks: {
                                  display: false
                              }
                          }]
                      },
                      legend: {display: false},
                      title: {
                        display: true,
                        text: "Potential Sponsors"
                      }
                    }
                  });
            }
        }

        if (currentVideoName != message.name) {
            createChart();
        }
        currentVideoName = message.name;
    }
});