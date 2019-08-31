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
