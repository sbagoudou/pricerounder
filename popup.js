// Popup script for Price Rounder extension

// Load saved settings
chrome.storage.sync.get(['enabled', 'roundingMode', 'showOriginal'], function(result) {
  document.getElementById('enabled').checked = result.enabled !== undefined ? result.enabled : true;
  document.getElementById('roundingMode').value = result.roundingMode || 'up';
  document.getElementById('showOriginal').checked = result.showOriginal !== undefined ? result.showOriginal : true;
});

// Save settings when changed
function saveSettings() {
  const settings = {
    enabled: document.getElementById('enabled').checked,
    roundingMode: document.getElementById('roundingMode').value,
    showOriginal: document.getElementById('showOriginal').checked
  };
  
  chrome.storage.sync.set(settings, function() {
    // Show saved status
    const status = document.getElementById('status');
    status.classList.add('show');
    setTimeout(() => {
      status.classList.remove('show');
    }, 2000);
  });
}

// Add event listeners
document.getElementById('enabled').addEventListener('change', saveSettings);
document.getElementById('roundingMode').addEventListener('change', saveSettings);
document.getElementById('showOriginal').addEventListener('change', saveSettings);