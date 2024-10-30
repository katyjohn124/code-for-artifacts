// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getScriptContent') {
        const scriptPath = message.scriptPath;
        fetch(chrome.runtime.getURL(scriptPath))
            .then(response => response.text())
            .then(scriptContent => {
                sendResponse({ success: true, content: scriptContent });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.toString() });
            });
        return true; // Keeps the messaging channel open for sendResponse
    }
});
