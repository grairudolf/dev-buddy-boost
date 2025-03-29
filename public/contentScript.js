
// Content script for DevBuddy Boost

// Global state to track active functionality
let state = {
  inspectorActive: false,
  pickerActive: false,
  selectedElement: null,
  highlightOverlay: null
};

// Setup message listener for commands from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'TOGGLE_INSPECTOR':
      toggleInspector(message.value);
      sendResponse({ success: true });
      break;
      
    case 'TOGGLE_COLOR_PICKER':
      toggleColorPicker(message.value);
      sendResponse({ success: true });
      break;
      
    case 'GET_LOCAL_STORAGE':
      const storage = getLocalStorage();
      sendResponse({ success: true, data: storage });
      break;
      
    case 'SET_LOCAL_STORAGE':
      setLocalStorageItem(message.key, message.value);
      sendResponse({ success: true });
      break;
      
    case 'GET_ELEMENT_INFO':
      if (state.selectedElement) {
        const info = getElementInfo(state.selectedElement);
        sendResponse({ success: true, data: info });
      } else {
        sendResponse({ success: false, message: 'No element selected' });
      }
      break;
  }
  return true; // Keep connection open for async response
});

// Toggle DOM Inspector mode
function toggleInspector(active) {
  state.inspectorActive = active;
  
  if (active) {
    document.addEventListener('mousemove', handleInspectorMouseMove);
    document.addEventListener('click', handleInspectorClick, true);
    
    // Create highlight overlay if it doesn't exist
    if (!state.highlightOverlay) {
      const overlay = document.createElement('div');
      overlay.id = 'devbuddy-highlight';
      overlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 999999;
        background: rgba(98, 0, 238, 0.2);
        border: 2px solid #6200ee;
        box-shadow: 0 0 0 2px rgba(98, 0, 238, 0.5);
        display: none;
      `;
      document.body.appendChild(overlay);
      state.highlightOverlay = overlay;
    }
  } else {
    document.removeEventListener('mousemove', handleInspectorMouseMove);
    document.removeEventListener('click', handleInspectorClick, true);
    
    if (state.highlightOverlay) {
      state.highlightOverlay.style.display = 'none';
    }
  }
}

// Handle mouse movement for inspector
function handleInspectorMouseMove(e) {
  if (!state.inspectorActive) return;
  
  // Prevent highlighting the overlay itself
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const element = elements.find(el => el.id !== 'devbuddy-highlight');
  
  if (element) {
    const rect = element.getBoundingClientRect();
    const overlay = state.highlightOverlay;
    
    overlay.style.display = 'block';
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
  }
}

// Handle click for inspector
function handleInspectorClick(e) {
  if (!state.inspectorActive) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const element = elements.find(el => el.id !== 'devbuddy-highlight');
  
  if (element) {
    state.selectedElement = element;
    const info = getElementInfo(element);
    chrome.runtime.sendMessage({
      type: 'ELEMENT_SELECTED',
      data: info
    });
  }
  
  // Deactivate inspector after selection
  toggleInspector(false);
  return false;
}

// Toggle color picker functionality
function toggleColorPicker(active) {
  state.pickerActive = active;
  
  if (active) {
    document.addEventListener('mousemove', handlePickerMouseMove);
    document.addEventListener('click', handlePickerClick, true);
    
    // Create color preview
    if (!document.getElementById('devbuddy-color-preview')) {
      const preview = document.createElement('div');
      preview.id = 'devbuddy-color-preview';
      preview.style.cssText = `
        position: fixed;
        z-index: 999999;
        width: 100px;
        height: 50px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        padding: 5px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        pointer-events: none;
        display: none;
      `;
      
      const colorBox = document.createElement('div');
      colorBox.id = 'devbuddy-color-box';
      colorBox.style.cssText = `
        flex: 1;
        margin-bottom: 5px;
      `;
      
      const colorText = document.createElement('div');
      colorText.id = 'devbuddy-color-text';
      colorText.style.cssText = `
        text-align: center;
      `;
      
      preview.appendChild(colorBox);
      preview.appendChild(colorText);
      document.body.appendChild(preview);
    }
  } else {
    document.removeEventListener('mousemove', handlePickerMouseMove);
    document.removeEventListener('click', handlePickerClick, true);
    
    const preview = document.getElementById('devbuddy-color-preview');
    if (preview) {
      preview.style.display = 'none';
    }
  }
}

// Handle mouse movement for color picker
function handlePickerMouseMove(e) {
  if (!state.pickerActive) return;
  
  const preview = document.getElementById('devbuddy-color-preview');
  const colorBox = document.getElementById('devbuddy-color-box');
  const colorText = document.getElementById('devbuddy-color-text');
  
  if (preview && colorBox && colorText) {
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const element = elements.find(el => el.id !== 'devbuddy-color-preview');
    
    if (element) {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.backgroundColor;
      
      colorBox.style.backgroundColor = color;
      colorText.textContent = color;
      
      preview.style.display = 'flex';
      preview.style.top = (e.clientY + 20) + 'px';
      preview.style.left = (e.clientX + 20) + 'px';
    }
  }
}

// Handle click for color picker
function handlePickerClick(e) {
  if (!state.pickerActive) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const elements = document.elementsFromPoint(e.clientX, e.clientY);
  const element = elements.find(el => el.id !== 'devbuddy-color-preview');
  
  if (element) {
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.backgroundColor;
    
    chrome.runtime.sendMessage({
      type: 'COLOR_PICKED',
      data: { 
        color,
        element: element.tagName.toLowerCase() + 
          (element.id ? `#${element.id}` : '') + 
          (element.className ? `.${element.className.replace(/\s+/g, '.')}` : '')
      }
    });
  }
  
  // Deactivate color picker after selection
  toggleColorPicker(false);
  return false;
}

// Get detailed element information
function getElementInfo(element) {
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
    innerHTML: element.innerHTML,
    outerHTML: element.outerHTML,
    textContent: element.textContent.trim().substring(0, 100),
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

// Get all local storage data
function getLocalStorage() {
  const items = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      // Try to parse as JSON
      items[key] = JSON.parse(localStorage.getItem(key));
    } catch (e) {
      // If not JSON, store as string
      items[key] = localStorage.getItem(key);
    }
  }
  return items;
}

// Set local storage item
function setLocalStorageItem(key, value) {
  try {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
    return true;
  } catch (e) {
    console.error('Error setting localStorage item:', e);
    return false;
  }
}

// Monitor and log network requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0] instanceof Request ? args[0].url : args[0];
  const options = args[0] instanceof Request ? {} : args[1] || {};
  
  const startTime = performance.now();
  
  // Call the original fetch
  return originalFetch.apply(this, args)
    .then(response => {
      const duration = performance.now() - startTime;
      
      // Clone the response to leave the original intact
      const clone = response.clone();
      
      // Log the request details
      chrome.runtime.sendMessage({
        type: 'LOG_REQUEST',
        data: {
          url,
          method: options.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          headers: Array.from(response.headers.entries()),
          duration: duration.toFixed(2),
          contentType: response.headers.get('content-type')
        }
      });
      
      return response;
    })
    .catch(error => {
      const duration = performance.now() - startTime;
      
      // Log the failed request
      chrome.runtime.sendMessage({
        type: 'LOG_REQUEST',
        data: {
          url,
          method: options.method || 'GET',
          status: 0,
          statusText: error.message,
          duration: duration.toFixed(2),
          error: true
        }
      });
      
      throw error;
    });
};

// Intercept XMLHttpRequest
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  this._devbuddyMethod = method;
  this._devbuddyUrl = url;
  this._devbuddyStartTime = 0;
  return originalXHROpen.apply(this, [method, url, ...rest]);
};

XMLHttpRequest.prototype.send = function(...args) {
  this._devbuddyStartTime = performance.now();
  
  const onLoadEnd = () => {
    const duration = performance.now() - this._devbuddyStartTime;
    
    // Log the request
    chrome.runtime.sendMessage({
      type: 'LOG_REQUEST',
      data: {
        url: this._devbuddyUrl,
        method: this._devbuddyMethod,
        status: this.status,
        statusText: this.statusText,
        headers: this.getAllResponseHeaders().split('\r\n').filter(Boolean).map(line => {
          const [name, value] = line.split(': ');
          return [name, value];
        }),
        duration: duration.toFixed(2),
        contentType: this.getResponseHeader('content-type'),
        error: this.status === 0
      }
    });
  };
  
  this.addEventListener('loadend', onLoadEnd);
  return originalXHRSend.apply(this, args);
};
