// Price Rounder Content Script
(function() {
  'use strict';

  // Currency symbols and their regex patterns
  const CURRENCY_PATTERNS = {
    USD: /\$\s?(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/g,
    EUR: /€?\s?(\d{1,3}(?:[\s.]?\d{3})*(?:,\d{2})?)\s?€?/g,
    GBP: /£\s?(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/g,
    // Add more currencies as needed
  };

  // French-specific price selectors
  const FRENCH_PRICE_SELECTORS = [
    '.prix', '.produit-prix', '.prix-actuel', '.prix-promo', '.prix-final',
    '.f-faPriceBox__price', '.userPrice', '.Article-price', // Fnac
    '.product-price', '.price-current', '.price-value', // Cdiscount
    '.price-amount', '.price-final', '.price-block', // Darty
    '.standard-price', // Boulanger
    '.main-price', '.current-price', '.price-details', // Leclerc/Carrefour
    '[data-price]', '[data-product-price]', '[data-prix]',
    '[itemprop="price"]'
  ];

  // Get user settings
  let settings = {
    enabled: true,
    roundingMode: 'up', // 'up', 'nearest', 'nearest5', 'nearest10'
    showOriginal: true
  };

  // Load settings from storage
  chrome.storage.sync.get(['enabled', 'roundingMode', 'showOriginal'], function(result) {
    settings = {
      enabled: result.enabled !== undefined ? result.enabled : true,
      roundingMode: result.roundingMode || 'up',
      showOriginal: result.showOriginal !== undefined ? result.showOriginal : true
    };
    
    if (settings.enabled) {
      processPage();
    }
  });

  function normalizePrice(priceStr) {
    // Remove currency symbols
    priceStr = priceStr.replace(/[€$£]/g, '').trim();
    // Remove non-breaking spaces and regular spaces
    priceStr = priceStr.replace(/\u00A0/g, '').replace(/\s/g, '');

    // Handle European format (1.234,56 -> 1234.56)
    if (priceStr.includes(',') && priceStr.includes('.')) {
      if (priceStr.lastIndexOf(',') > priceStr.lastIndexOf('.')) {
        // French format: 1.234,56
        priceStr = priceStr.replace(/\./g, '').replace(',', '.');
      } else {
        // US format: 1,234.56
        priceStr = priceStr.replace(/,/g, '');
      }
    } else if (priceStr.includes(',')) {
      // Check if comma is decimal separator
      const parts = priceStr.split(',');
      const afterComma = parts[parts.length - 1];
      if (afterComma.length <= 2) {
        // Decimal: 99,99 -> 99.99
        priceStr = priceStr.replace(',', '.');
      } else {
        // Thousands: 1,234 -> 1234
        priceStr = priceStr.replace(/,/g, '');
      }
    } else if (priceStr.includes('.')) {
      const parts = priceStr.split('.');
      const afterDot = parts[parts.length - 1];
      if (afterDot.length > 2) {
        // Thousands separator: remove
        priceStr = priceStr.replace(/\./g, '');
      }
    }

    const parsed = parseFloat(priceStr);
    return isNaN(parsed) ? null : parsed;
  }

  function roundPrice(price) {
    switch(settings.roundingMode) {
      case 'up':
        return Math.ceil(price);
      case 'nearest':
        return Math.round(price);
      case 'nearest5':
        return Math.ceil(price / 5) * 5;
      case 'nearest10':
        return Math.ceil(price / 10) * 10;
      default:
        return Math.ceil(price);
    }
  }

  function formatPrice(price) {
    // Always return whole numbers for rounded prices
    return Math.round(price).toString();
  }

  function createStyledPrice(originalText, roundedText, currency) {
    const span = document.createElement('span');
    span.className = 'price-rounder-modified';

    if (settings.showOriginal) {
      // Show original in small parentheses
      span.innerHTML = `<span style="font-weight: bold; color: #2563eb;">${currency}${roundedText}</span> <span style="font-size: 0.75em; color: #888;">(${originalText})</span>`;
    } else {
      span.innerHTML = `<span style="font-weight: bold;">${currency}${roundedText}</span>`;
    }

    return span;
  }

  function processTextNode(node) {
    if (node.nodeType !== Node.TEXT_NODE) return;

    // Skip text nodes inside site-specific price elements (handled by dedicated handlers)
    let parent = node.parentElement;
    while (parent && parent !== document.body) {
      if (parent.classList?.contains('a-price')) return; // Amazon
      if (parent.classList?.contains('c-price') || parent.classList?.contains('c-price-s')) return; // Cdiscount
      if (parent.classList?.contains('f-faPriceBox__price')) return; // Fnac
      if (parent.classList?.contains('price-rounder-modified')) return;
      if (parent.hasAttribute?.('data-price-rounded')) return;
      parent = parent.parentElement;
    }

    let text = node.textContent;
    let modified = false;
    let newContent = document.createDocumentFragment();
    let lastIndex = 0;

    // Process each currency pattern
    for (const [currency, pattern] of Object.entries(CURRENCY_PATTERNS)) {
      const regex = new RegExp(pattern);
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        const originalPrice = match[1];
        const price = normalizePrice(originalPrice);
        
        // Only round if price ends with .99, .95, .90, or similar psychological pricing
        const shouldRound = /\.(9[0-9]|[0-9]9)$/.test(price.toFixed(2)) || 
                           (price % 1 === 0 && price > 0);
        
        if (shouldRound) {
          const roundedPrice = roundPrice(price);
          
          // Only modify if rounding actually changes the price
          if (roundedPrice !== price) {
            modified = true;
            
            // Add text before the match
            if (match.index > lastIndex) {
              newContent.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            
            // Add styled price
            const currencySymbol = match[0].charAt(0);
            const formattedRounded = formatPrice(roundedPrice);
            newContent.appendChild(createStyledPrice(match[0], formattedRounded, currencySymbol));
            
            lastIndex = match.index + match[0].length;
          }
        }
      }
    }

    // Replace the text node if we made modifications
    if (modified) {
      if (lastIndex < text.length) {
        newContent.appendChild(document.createTextNode(text.substring(lastIndex)));
      }
      node.parentNode.replaceChild(newContent, node);
    }
  }

  function processAmazonPrice(priceElement) {
    if (priceElement.classList?.contains('price-rounder-modified')) return;
    if (priceElement.hasAttribute('data-price-rounded')) return;

    // Mark as being processed immediately to prevent re-entry
    priceElement.setAttribute('data-price-rounded', 'true');

    let priceStr = '';
    let currency = '';
    let offscreen = null;

    // Check for offscreen price first (most accurate)
    offscreen = priceElement.querySelector('.a-offscreen');
    if (offscreen) {
      const priceText = offscreen.textContent.trim();
      if (priceText) {
        const match = priceText.match(/(\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2})\s*([€$£])/);
        if (match) {
          priceStr = match[1];
          currency = match[2];
        }
      }
    }

    // If offscreen didn't work or was empty, parse from visible elements
    if (!priceStr) {
      const whole = priceElement.querySelector('.a-price-whole');
      const fraction = priceElement.querySelector('.a-price-fraction');
      const symbol = priceElement.querySelector('.a-price-symbol');

      if (whole && symbol) {
        const wholeText = whole.textContent.replace(/[.,\s]/g, '');
        const fractionText = fraction ? fraction.textContent : '00';
        priceStr = wholeText + '.' + fractionText;
        currency = symbol.textContent.trim();
      } else {
        // Try parsing from aria-hidden plain text
        const ariaHidden = priceElement.querySelector('[aria-hidden="true"]');
        if (ariaHidden && ariaHidden.textContent.trim()) {
          const text = ariaHidden.textContent.trim();
          const match = text.match(/(\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2})\s*([€$£])|([€$£])\s*(\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2})/);
          if (match) {
            priceStr = match[1] || match[4];
            currency = match[2] || match[3];
          }
        }
      }
    }

    if (priceStr && currency) {
      const price = normalizePrice(priceStr);
      const shouldRound = /\.(9[0-9]|[0-9]9)$/.test(price.toFixed(2));

      if (shouldRound) {
        const roundedPrice = roundPrice(price);
        if (roundedPrice !== price) {
          const formattedRounded = formatPrice(roundedPrice);
          const originalDisplay = priceStr.replace('.', ',') + ' ' + currency;
          const styledPrice = createStyledPrice(originalDisplay, formattedRounded + ' ' + currency, '');

          // Hide the visible price
          const visiblePrice = priceElement.querySelector('[aria-hidden="true"]');
          if (visiblePrice) visiblePrice.style.display = 'none';

          // If there's an offscreen element, update it too
          if (offscreen) {
            offscreen.textContent = formattedRounded + ' ' + currency;
            offscreen.style.position = 'static';
            offscreen.style.clip = 'auto';
            offscreen.style.overflow = 'visible';
            offscreen.style.height = 'auto';
            offscreen.style.width = 'auto';
          }

          priceElement.appendChild(styledPrice);
          priceElement.classList.add('price-rounder-modified');
        }
      }
    } else {
      // No valid price found, remove the marker
      priceElement.removeAttribute('data-price-rounded');
    }
  }

  function detectDataAttributePrice(element) {
    const dataAttrs = ['data-price', 'data-product-price', 'data-price-value', 'data-prix', 'data-montant'];

    for (const attr of dataAttrs) {
      const value = element.getAttribute(attr);
      if (value) {
        const price = normalizePrice(value);
        if (price !== null) {
          return { price, attribute: attr };
        }
      }
    }
    return null;
  }

  function processCdiscountPrice(priceElement) {
    // Cdiscount uses .c-price with two formats:
    // 1. Split format: "949€" + span with "99"
    // 2. Standard format: "999,99€" inside <s> or direct text
    if (priceElement.classList?.contains('price-rounder-modified')) return;
    if (priceElement.hasAttribute('data-price-rounded')) return;

    priceElement.setAttribute('data-price-rounded', 'true');

    // Try split price format first
    const textNodes = Array.from(priceElement.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
    const spanNodes = priceElement.querySelectorAll('span[itemprop="priceCurrency"]');

    if (textNodes.length > 0 && spanNodes.length > 0) {
      const wholeText = textNodes[0].textContent.trim(); // e.g., "949€"
      const centsText = spanNodes[0].textContent.trim(); // e.g., "99"

      const wholeMatch = wholeText.match(/(\d+)€?/);
      if (wholeMatch && centsText.match(/^\d{2}$/)) {
        const priceStr = wholeMatch[1] + '.' + centsText;
        const price = normalizePrice(priceStr);
        const originalDisplay = wholeText + centsText;

        if (price && /\.(9[0-9]|[0-9]9)$/.test(price.toFixed(2))) {
          const roundedPrice = roundPrice(price);
          if (roundedPrice !== price) {
            const formattedRounded = formatPrice(roundedPrice);
            const styledPrice = createStyledPrice(originalDisplay, formattedRounded + ' €', '');

            priceElement.style.display = 'none';
            priceElement.parentNode.insertBefore(styledPrice, priceElement);
            priceElement.classList.add('price-rounder-modified');
            return;
          }
        }
      }
    }

    // Try standard format (with comma decimal)
    const priceText = priceElement.textContent.trim();
    const match = priceText.match(/(\d{1,3}(?:[\s.]\d{3})*,\d{2})\s?€/);

    if (match) {
      const priceStr = match[1];
      const price = normalizePrice(priceStr);

      if (price && /\.(9[0-9]|[0-9]9)$/.test(price.toFixed(2))) {
        const roundedPrice = roundPrice(price);
        if (roundedPrice !== price) {
          const formattedRounded = formatPrice(roundedPrice);
          const styledPrice = createStyledPrice(match[0], formattedRounded + ' €', '');

          // Find and replace the <s> tag or direct price text, keep other children visible
          const sTag = priceElement.querySelector('s');
          if (sTag) {
            // Replace the <s> tag content with our styled price
            sTag.replaceWith(styledPrice);
          } else {
            // If no <s> tag, hide entire element
            priceElement.style.display = 'none';
            priceElement.parentNode.insertBefore(styledPrice, priceElement);
          }

          priceElement.classList.add('price-rounder-modified');
          return;
        }
      }
    }

    // If no format matched, remove the marker
    priceElement.removeAttribute('data-price-rounded');
  }

  function processFnacPrice(priceElement) {
    // Fnac uses .f-faPriceBox__price with specific structure
    if (priceElement.classList?.contains('price-rounder-modified')) return;
    if (priceElement.hasAttribute('data-price-rounded')) return;

    priceElement.setAttribute('data-price-rounded', 'true');

    const priceText = priceElement.textContent.trim();
    const match = priceText.match(/(\d{1,3}(?:[\s.]\d{3})*[.,]\d{2})\s?€/);

    if (match) {
      const priceStr = match[1];
      const price = normalizePrice(priceStr);

      if (price && /\.(9[0-9]|[0-9]9)$/.test(price.toFixed(2))) {
        const roundedPrice = roundPrice(price);
        if (roundedPrice !== price) {
          const formattedRounded = formatPrice(roundedPrice);
          const styledPrice = createStyledPrice(priceText, formattedRounded + ' €', '');

          priceElement.style.display = 'none';
          priceElement.parentNode.insertBefore(styledPrice, priceElement);
          priceElement.classList.add('price-rounder-modified');
        }
      }
    } else {
      priceElement.removeAttribute('data-price-rounded');
    }
  }

  function processSimplePrice(priceElement) {
    if (priceElement.classList?.contains('price-rounder-modified')) return;
    if (priceElement.hasAttribute('data-price-rounded')) return;
    if (!priceElement.textContent.trim()) return;

    // Skip if this element contains site-specific price children (already handled)
    if (priceElement.querySelector('.a-price')) return;
    if (priceElement.querySelector('.c-price, .c-price-s')) return;
    if (priceElement.querySelector('.f-faPriceBox__price')) return;
    if (priceElement.querySelector('.price-rounder-modified')) return;

    // Skip if parent is a site-specific price element
    let parent = priceElement.parentElement;
    while (parent) {
      if (parent.classList?.contains('c-price') || parent.classList?.contains('c-price-s')) return;
      if (parent.classList?.contains('a-price')) return;
      if (parent.classList?.contains('f-faPriceBox__price')) return;
      parent = parent.parentElement;
    }

    // Try data attributes first (most reliable)
    const dataPrice = detectDataAttributePrice(priceElement);
    let price, currency, originalDisplay;

    if (dataPrice) {
      price = dataPrice.price;
      currency = '€'; // Default to EUR for French sites
      originalDisplay = priceElement.textContent.trim();
    } else {
      // Fall back to text content parsing
      const text = priceElement.textContent.trim();
      const match = text.match(/([€$£])\s?(\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2})|(\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2})\s?([€$£])/);

      if (!match) return;

      currency = match[1] || match[4];
      const priceStr = match[2] || match[3];
      price = normalizePrice(priceStr);
      originalDisplay = text;
    }

    if (price === null) return;

    const shouldRound = /\.(9[0-9]|[0-9]9)$/.test(price.toFixed(2));

    if (shouldRound) {
      const roundedPrice = roundPrice(price);
      if (roundedPrice !== price) {
        const formattedRounded = formatPrice(roundedPrice);
        const styledPrice = createStyledPrice(originalDisplay, formattedRounded + ' ' + currency, '');

        priceElement.style.display = 'none';
        priceElement.parentNode.insertBefore(styledPrice, priceElement);
        priceElement.classList.add('price-rounder-modified');
        priceElement.setAttribute('data-price-rounded', 'true');
      }
    }
  }

  function processElement(element) {
    // Skip script, style, and already processed elements
    if (element.tagName === 'SCRIPT' ||
        element.tagName === 'STYLE' ||
        element.classList?.contains('price-rounder-modified')) {
      return;
    }

    // Handle Amazon-specific price elements
    const amazonPrices = element.querySelectorAll ? element.querySelectorAll('.a-price') : [];
    amazonPrices.forEach(processAmazonPrice);

    // Handle Fnac-specific price elements
    const fnacPrices = element.querySelectorAll ? element.querySelectorAll('.f-faPriceBox__price') : [];
    fnacPrices.forEach(processFnacPrice);

    // Handle Cdiscount-specific price elements
    const cdiscountPrices = element.querySelectorAll ? element.querySelectorAll('.c-price, .c-price-s') : [];
    cdiscountPrices.forEach(processCdiscountPrice);

    // Handle simple price elements (legacy and other patterns)
    const simplePriceSelectors = [
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '#priceblock_saleprice',
      '.offer-price',
      '.p13n-sc-price',
      '.priceLarge',
      '.a-color-price',
      ...FRENCH_PRICE_SELECTORS
    ];

    simplePriceSelectors.forEach(selector => {
      const elements = element.querySelectorAll ? element.querySelectorAll(selector) : [];
      elements.forEach(processSimplePrice);
    });

    // Also check if element itself is an Amazon price or simple price
    if (element.classList?.contains('a-price')) {
      processAmazonPrice(element);
    } else if (element.id && ['priceblock_ourprice', 'priceblock_dealprice', 'priceblock_saleprice'].includes(element.id)) {
      processSimplePrice(element);
    } else if (element.classList && ['offer-price', 'p13n-sc-price', 'priceLarge', 'a-color-price'].some(c => element.classList.contains(c))) {
      processSimplePrice(element);
    }

    // Process text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let currentNode;
    while (currentNode = walker.nextNode()) {
      textNodes.push(currentNode);
    }

    textNodes.forEach(processTextNode);
  }

  function processPage() {
    processElement(document.body);
  }

  // Observe DOM changes for dynamically loaded content
  const observer = new MutationObserver(function(mutations) {
    if (!settings.enabled) return;

    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Skip if this is one of our own modifications
          if (node.classList?.contains('price-rounder-modified')) return;
          processElement(node);
        }
      });
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Listen for settings changes
  chrome.storage.onChanged.addListener(function(changes) {
    if (changes.enabled) {
      settings.enabled = changes.enabled.newValue;
      if (settings.enabled) {
        location.reload(); // Reload to apply changes
      }
    }
    if (changes.roundingMode) {
      settings.roundingMode = changes.roundingMode.newValue;
      location.reload();
    }
    if (changes.showOriginal) {
      settings.showOriginal = changes.showOriginal.newValue;
      location.reload();
    }
  });
})();