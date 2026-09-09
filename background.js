/**
 * background.js — Universal Video Screenshot Studio
 * Safari Web Extension Background Service
 */

const _browser = (typeof browser !== 'undefined') ? browser : chrome;

_browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') {
    sendResponse({ success: true, version: '2.1.0' });
    return false;
  }
  return false;
});
