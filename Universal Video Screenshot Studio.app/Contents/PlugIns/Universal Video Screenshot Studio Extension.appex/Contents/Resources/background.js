/**
 * background.js — Universal Video Screenshot Studio
 * Safari Web Extension Background Service
 */

const _browser = (typeof browser !== 'undefined') ? browser : chrome;

// Automatically inject content scripts into open tabs upon extension load or update
_browser.runtime.onInstalled.addListener(async () => {
  try {
    const tabs = await _browser.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const tab of tabs) {
      if (tab.id && _browser.scripting) {
        try {
          await _browser.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            files: ['utif.js', 'content.js']
          });
        } catch (e) {}
      }
    }
  } catch (e) {}
});

_browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') {
    sendResponse({ success: true, version: '2.1.0' });
    return false;
  }
  return false;
});
