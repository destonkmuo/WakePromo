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

            for (const sponsor in currentVideoData) {
                xValues.push(sponsor);
            }
    
            var yValues = [55, 49, 44, 24, 24];
            var barColors = 'white';
            
            Chart.defaults.global.defaultFontColor = "#fff";
    
            if (xValues.length != 0) {
                document.body.style.height = '500px';
                new Chart("chart", {
                    type: "bar",
                    data: {
                      labels: xValues,
                      datasets: [{
                        backgroundColor: barColors,
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