/* I18n by replacing __MSG_***__ meta tags */
function i18nHtmlPage() {
    let objects = document.getElementsByTagName('html');
    for (let j = 0; j < objects.length; j++) {
        let obj = objects[j];
        let valStrH = obj.innerHTML.toString();
        let valNewH = valStrH.replace(/__MSG_(\w+)__/g, function (match, v1) {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });
        if (valNewH != valStrH) {
            obj.innerHTML = valNewH;
        }
    }
}

i18nHtmlPage();
