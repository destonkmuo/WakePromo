const settingArray = ['showPromotionDuration', 'skipAdvertisements', 'skipPromotions']; // Add settings toggles here

function toggleSetting(settingID) {
    chrome.storage.sync.get([`${settingID}`], function(result) {
        var value = result[settingID];
        value == "false" ? chrome.storage.sync.set({[`${settingID}`]: "true"}) : chrome.storage.sync.set({[`${settingID}`]: "false"});   
    });
}

window.addEventListener('load', function() {
    document.body.style.height = '320px';
    function loadSettings(settingID)  {
        var element = document.getElementById(settingID);

        chrome.storage.sync.get([`${settingID}`], function(result) {
            var value = result[settingID];

            if (value == undefined) { 
                value = "true"; 
                chrome.storage.sync.set({[`${settingID}`]: 'true'});
            }

            value == "false" ? element.checked = false : element.checked = true;
            });
        element.addEventListener("click", function() { toggleSetting(settingID) }); 
    }
    settingArray.forEach(settingID => loadSettings(settingID));
});