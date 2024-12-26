/// <reference types="chrome"/>

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        isEnabled: false,
        storedElements: []
    });
});

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
    port.onDisconnect.addListener(() => {
        // Handle disconnection
    });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Return true to indicate we'll respond asynchronously
    return true;
});
