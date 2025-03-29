
// Background script for DevBuddy Boost
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_ELEMENT') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      function: captureElement,
      args: [message.selector]
    }).then(results => {
      sendResponse({ success: true, data: results[0].result });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Indicates async response
  }
  
  if (message.type === 'LOG_REQUEST') {
    console.log('Request logged:', message.data);
    // Store in local storage for history
    chrome.storage.local.get(['requestLogs'], (result) => {
      const logs = result.requestLogs || [];
      logs.push({
        ...message.data,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ requestLogs: logs.slice(-100) }); // Keep last 100 logs
    });
  }
});

function captureElement(selector) {
  const element = document.querySelector(selector);
  if (!element) return null;
  
  // Get computed styles
  const styles = window.getComputedStyle(element);
  const box = element.getBoundingClientRect();
  
  return {
    tagName: element.tagName,
    id: element.id,
    classList: Array.from(element.classList),
    attributes: Array.from(element.attributes).map(attr => ({
      name: attr.name,
      value: attr.value
    })),
    styles: {
      width: styles.width,
      height: styles.height,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      margin: styles.margin,
      padding: styles.padding,
      position: styles.position,
      display: styles.display,
      zIndex: styles.zIndex,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize
    },
    box: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      top: box.top,
      right: box.right,
      bottom: box.bottom,
      left: box.left
    }
  };
}
