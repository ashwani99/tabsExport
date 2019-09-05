'use strict';

chrome.runtime.onInstalled.addListener(() => {
    // show the page action
    chrome.declarativeContent.onPageChanged.addRules([
        {
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {schemes: ['http', 'https']}
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }
    ]);
})


// listening to messages for import tasks
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.taskName == 'importJSON') {
        let open_tabs = confirm(`Found ${request.links.length} links to be opened. Proceed?`);
        if (open_tabs) 
            openLinksInTabs(request.links, notify);
    }
});


function openLinksInTabs(links, callback) {
    chrome.windows.create({
        url: links.map(function(link) {
            return link.url;
        })
    });
    callback();
}

function notify() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/tabs_export16.png',
        title: 'TabsExport',
        message: `Successfully imported tabs!`
    });
}
