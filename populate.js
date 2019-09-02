'use strict';

document.getElementById('export-json-btn').addEventListener('click', exportLinks);
document.getElementById('copy-clipboard-btn').addEventListener('click', copyLinks);
document.getElementById('import-json-btn').addEventListener('click', importLinks);


function exportLinks() {
    getAllLinksCurrentlyOpened(function(data) {
        downloadObjectAsJSON(data, 'links', function() {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/tabs_export16.png',
                title: 'TabsExport',
                message: 'Successfully exported as JSON!'
            });
        })
    });
}

function copyLinks() {
    getAllLinksCurrentlyOpened(function(data) {
        copyToClipBoard(data.links, function() {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/tabs_export16.png',
                title: 'TabsExport',
                message: 'Links copied!'
            });
        });
    });
}

function importLinks() {
    const importInput = document.getElementById('import-input');
    importInput.addEventListener('change', function(e) {
        let file = importInput.files[0];
        if (file.type.match('application\/json')) {

            let reader = new FileReader();

            reader.onload = function(e) {
                let contentAsJSON = JSON.parse(reader.result);
                let open_tabs = confirm(`Found ${contentAsJSON.links.length} links to be opened. Proceed?`);
                if (open_tabs) {
                    openLinksInTabs(contentAsJSON.links, function() {
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: 'icons/tabs_export16.png',
                            title: 'TabsExport',
                            message: `Successfully imported ${contentAsJSON.links.length} links!`
                        });
                    });
                }
            }

            reader.readAsText(file);
            
        } else {
            alert('Unsupported file')
        }
    });
    importInput.click();
}

function getAllLinksCurrentlyOpened(callback) {
    let result = {links: []};
    chrome.windows.getAll({populate: true}, (windows) => {
        for (let openWindow of windows) {
            for (let openTab of openWindow.tabs) {
                if (!(openTab.url in result.links)) {
                    result.links.push({title: openTab.title, url: openTab.url});
                }
            }
        }
        callback(result);
    });
}

function  downloadObjectAsJSON(exportObejct, exportName, callback) {
    const dataURIScheme = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObejct, null, 4));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataURIScheme);
    downloadAnchorNode.setAttribute('download', exportName+'.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    callback();
}

function copyToClipBoard(links, callback) {
    const copyArea = document.createElement('textarea');
    document.body.appendChild(copyArea);
    copyArea.value = links.map(function(link) {
        return link.url
    }).join('\n');
    copyArea.select();
    document.execCommand('copy');
    document.body.removeChild(copyArea);
    callback();
}

function openLinksInTabs(links, callback) {
    chrome.windows.create({
        url: links.map(function(link) {
            return link.url;
        })
    });
    callback();
}