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
    let form = document.getElementById('form-container');
    
    // show the import form, hide all options
    form.classList.toggle('hidden');
    document.getElementById('options').classList.add('hidden');

    document.getElementById('import-button').addEventListener('click', function() {
        getAllLinksCurrentlyOpened(function(data) {
            let input = JSON.parse(document.getElementById('links-box').value);
            chrome.runtime.sendMessage({taskName: 'importJSON', links: input.links});
        });
    });

    document.getElementById('back-import').addEventListener('click', function(e) {
        // e.stopPropagation();
        document.getElementById('import-form').classList.toggle('hidden');
        document.getElementById('options').classList.remove('hidden');
    });
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
