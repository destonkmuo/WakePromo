const settingArray = ['suggestSkipTimeSwitch']; // Add settings toggles here

function toggleSetting(settingID) {
    localStorage.getItem(settingID) == "false" ? localStorage.setItem(settingID, true) : localStorage.setItem(settingID, false);
}

window.addEventListener('load', function() {
    document.body.style.height = '500px';
    function loadSettings(setting) {
        var element = document.getElementById(setting);

        if (localStorage.getItem(setting) == null) { localStorage.setItem(setting, false) }

        localStorage.getItem(setting) == "false" ? element.checked = false : element.checked = true;

        element.addEventListener("click", function() { toggleSetting(setting) });
    }
    settingArray.forEach(setting => loadSettings(setting)); 
});
