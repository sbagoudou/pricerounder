// Popup script for Price Rounder extension

// Firefox compatibility: use browser namespace if available, otherwise use chrome
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Load saved settings
browserAPI.storage.sync.get(['enabled', 'roundingMode', 'showOriginal', 'centsThreshold'], function(result) {
  document.getElementById('enabled').checked = result.enabled !== undefined ? result.enabled : true;
  document.getElementById('roundingMode').value = result.roundingMode || 'up';
  document.getElementById('showOriginal').checked = result.showOriginal !== undefined ? result.showOriginal : true;
  document.getElementById('centsThreshold').value = result.centsThreshold !== undefined ? result.centsThreshold : '90';
});

// Save settings when changed
function saveSettings() {
  const settings = {
    enabled: document.getElementById('enabled').checked,
    roundingMode: document.getElementById('roundingMode').value,
    showOriginal: document.getElementById('showOriginal').checked,
    centsThreshold: parseInt(document.getElementById('centsThreshold').value)
  };

  browserAPI.storage.sync.set(settings, function() {
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
document.getElementById('centsThreshold').addEventListener('change', saveSettings);