# Implementation Guide: French E-Commerce Price Detection

## Quick Start Guide

This guide provides code snippets and practical implementation strategies for detecting and processing prices on French e-commerce websites.

---

## 1. Enhanced Currency Pattern for French Sites

Update your EUR pattern to handle French formatting:

```javascript
const CURRENCY_PATTERNS = {
  // Existing patterns...

  // Enhanced EUR pattern for French sites
  EUR: {
    // Pattern 1: Symbol before price (€ 1.234,56 or €1234,56)
    prefix: /€\s?(\d{1,3}(?:[\s.]\d{3})*(?:,\d{2})?)/g,

    // Pattern 2: Symbol after price (1.234,56 € or 1234,56€)
    suffix: /(\d{1,3}(?:[\s.]\d{3})*(?:,\d{2})?)\s?€/g,

    // Combined pattern
    combined: /(€\s?)?(\d{1,3}(?:[\s.]\d{3})*(?:,\d{2})?)(\s?€)?/g
  }
};
```

---

## 2. French-Specific Price Selector List

Extend your selector list with French e-commerce patterns:

```javascript
const FRENCH_PRICE_SELECTORS = [
  // Generic French
  '.prix',
  '.produit-prix',
  '.prix-actuel',
  '.prix-promo',
  '.prix-final',
  '.montant-prix',
  '.valeur-prix',

  // Site-specific: Fnac
  '.f-faPriceBox__price',
  '.userPrice',
  '.Article-price',

  // Site-specific: Cdiscount
  '.product-price',
  '.price-current',
  '.price-value',

  // Site-specific: Darty
  '.price-amount',
  '.price-final',
  '.price-block',

  // Site-specific: Boulanger
  '.product-price .price',
  '.standard-price',

  // Site-specific: Leclerc/Carrefour
  '.main-price',
  '.current-price',
  '.price-details',

  // Generic e-commerce (also used in France)
  '.price',
  '.product-price',
  '.offer-price',
  '.sale-price',
  '[data-price]',
  '[data-product-price]',
  '[itemprop="price"]'
];
```

---

## 3. Enhanced Price Normalization for French Format

Update your `normalizePrice` function to better handle French formatting:

```javascript
function normalizePrice(priceStr) {
  // Remove currency symbols and spaces
  priceStr = priceStr.replace(/[€$£]/g, '').trim();

  // Remove non-breaking spaces (common in French formatting)
  priceStr = priceStr.replace(/\u00A0/g, '').replace(/\s/g, '');

  // Handle French format: 1.234,56 -> 1234.56
  // Logic: If both . and , exist, the last separator is decimal
  if (priceStr.includes(',') && priceStr.includes('.')) {
    const lastComma = priceStr.lastIndexOf(',');
    const lastDot = priceStr.lastIndexOf('.');

    if (lastComma > lastDot) {
      // French format: 1.234,56
      priceStr = priceStr.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,234.56
      priceStr = priceStr.replace(/,/g, '');
    }
  }
  // Only comma present
  else if (priceStr.includes(',')) {
    // Check if comma is decimal separator (last 2 digits after comma)
    const parts = priceStr.split(',');
    const afterComma = parts[parts.length - 1];

    if (afterComma.length <= 2) {
      // Likely decimal: 99,99 -> 99.99
      priceStr = priceStr.replace(',', '.');
    } else {
      // Likely thousands: 1,234 -> 1234
      priceStr = priceStr.replace(/,/g, '');
    }
  }
  // Only dot present
  else if (priceStr.includes('.')) {
    const parts = priceStr.split('.');
    const afterDot = parts[parts.length - 1];

    if (afterDot.length <= 2) {
      // Decimal separator: keep as is
    } else {
      // Thousands separator: remove
      priceStr = priceStr.replace(/\./g, '');
    }
  }

  const parsed = parseFloat(priceStr);
  return isNaN(parsed) ? null : parsed;
}
```

---

## 4. Schema.org Price Detection

Add support for Schema.org structured data (common on French sites):

```javascript
function detectSchemaOrgPrice() {
  const results = [];

  // Method 1: JSON-LD
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  jsonLdScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);

      // Handle single product
      if (data['@type'] === 'Product' && data.offers) {
        const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
        if (offer.price) {
          results.push({
            price: parseFloat(offer.price),
            currency: offer.priceCurrency || 'EUR',
            type: 'schema-jsonld',
            element: script
          });
        }
      }

      // Handle product list
      if (data['@type'] === 'ItemList' && data.itemListElement) {
        data.itemListElement.forEach(item => {
          if (item.offers?.price) {
            results.push({
              price: parseFloat(item.offers.price),
              currency: item.offers.priceCurrency || 'EUR',
              type: 'schema-jsonld-list'
            });
          }
        });
      }
    } catch (e) {
      // Invalid JSON, skip
    }
  });

  // Method 2: Microdata
  const microdataPrices = document.querySelectorAll('[itemprop="price"]');
  microdataPrices.forEach(priceElem => {
    const priceValue = priceElem.getAttribute('content') || priceElem.textContent;
    const price = normalizePrice(priceValue);

    if (price !== null) {
      // Find currency
      let currency = 'EUR';
      let parent = priceElem.closest('[itemscope]');
      if (parent) {
        const currencyElem = parent.querySelector('[itemprop="priceCurrency"]');
        if (currencyElem) {
          currency = currencyElem.getAttribute('content') || currencyElem.textContent;
        }
      }

      results.push({
        price: price,
        currency: currency,
        type: 'schema-microdata',
        element: priceElem
      });
    }
  });

  return results;
}
```

---

## 5. Data Attribute Detection

Many French sites use data attributes:

```javascript
function detectDataAttributePrice(element) {
  const dataAttrs = [
    'data-price',
    'data-product-price',
    'data-price-value',
    'data-prix',
    'data-montant'
  ];

  for (const attr of dataAttrs) {
    const value = element.getAttribute(attr);
    if (value) {
      const price = normalizePrice(value);
      if (price !== null) {
        return {
          price: price,
          attribute: attr,
          element: element
        };
      }
    }
  }

  return null;
}
```

---

## 6. Comprehensive Price Detection Strategy

Combine all methods with priority order:

```javascript
function detectPrice(element) {
  // Priority 1: Data attributes (most reliable)
  const dataPrice = detectDataAttributePrice(element);
  if (dataPrice) {
    return { ...dataPrice, method: 'data-attribute' };
  }

  // Priority 2: Schema.org microdata on or near element
  if (element.hasAttribute('itemprop') && element.getAttribute('itemprop') === 'price') {
    const priceValue = element.getAttribute('content') || element.textContent;
    const price = normalizePrice(priceValue);
    if (price !== null) {
      return { price, method: 'schema-microdata', element };
    }
  }

  // Priority 3: Check if element matches known selectors
  for (const selector of FRENCH_PRICE_SELECTORS) {
    if (element.matches(selector)) {
      const price = normalizePrice(element.textContent);
      if (price !== null) {
        return { price, method: 'css-selector', selector, element };
      }
    }
  }

  // Priority 4: Pattern matching in text content
  const text = element.textContent.trim();
  const patterns = CURRENCY_PATTERNS.EUR;

  // Try suffix pattern (most common in France)
  const suffixMatch = patterns.suffix.exec(text);
  if (suffixMatch) {
    const price = normalizePrice(suffixMatch[1]);
    if (price !== null) {
      return { price, method: 'pattern-suffix', element };
    }
  }

  // Try prefix pattern
  const prefixMatch = patterns.prefix.exec(text);
  if (prefixMatch) {
    const price = normalizePrice(prefixMatch[1]);
    if (price !== null) {
      return { price, method: 'pattern-prefix', element };
    }
  }

  return null;
}
```

---

## 7. Site-Specific Handlers

Add specialized handlers for major French sites:

```javascript
const SITE_HANDLERS = {
  'amazon.fr': {
    selectors: ['.a-price', '#priceblock_ourprice'],
    handler: processAmazonPrice // Your existing function
  },

  'fnac.com': {
    selectors: ['.f-faPriceBox__price', '.userPrice', '.Article-price'],
    handler: function(element) {
      const price = normalizePrice(element.textContent);
      if (price !== null && price > 0) {
        return { price, currency: 'EUR' };
      }
    }
  },

  'cdiscount.com': {
    selectors: ['.product-price', '.price-current', '[data-price]'],
    handler: function(element) {
      // Try data attribute first
      const dataPrice = element.getAttribute('data-price');
      if (dataPrice) {
        return { price: parseFloat(dataPrice), currency: 'EUR' };
      }
      // Fallback to text
      const price = normalizePrice(element.textContent);
      if (price !== null) {
        return { price, currency: 'EUR' };
      }
    }
  },

  'darty.com': {
    selectors: ['.product-price', '.price-amount', '.price-final'],
    handler: function(element) {
      const price = normalizePrice(element.textContent);
      if (price !== null) {
        return { price, currency: 'EUR' };
      }
    }
  },

  'boulanger.com': {
    selectors: ['.product-price .price', '[data-price]'],
    handler: function(element) {
      const dataPrice = element.getAttribute('data-price');
      if (dataPrice) {
        return { price: parseFloat(dataPrice), currency: 'EUR' };
      }
      const price = normalizePrice(element.textContent);
      if (price !== null) {
        return { price, currency: 'EUR' };
      }
    }
  },

  'leclercdrive.fr': {
    selectors: ['.product-price', '.main-price', '.price-details'],
    handler: function(element) {
      const price = normalizePrice(element.textContent);
      if (price !== null) {
        return { price, currency: 'EUR' };
      }
    }
  },

  'carrefour.fr': {
    selectors: ['[data-price]', '.product-price', '[itemprop="price"]'],
    handler: function(element) {
      // Try data attribute
      const dataPrice = element.getAttribute('data-price');
      if (dataPrice) {
        return { price: parseFloat(dataPrice), currency: 'EUR' };
      }
      // Try schema.org
      if (element.hasAttribute('itemprop')) {
        const priceValue = element.getAttribute('content') || element.textContent;
        const price = normalizePrice(priceValue);
        if (price !== null) {
          return { price, currency: 'EUR' };
        }
      }
      // Fallback to text
      const price = normalizePrice(element.textContent);
      if (price !== null) {
        return { price, currency: 'EUR' };
      }
    }
  }
};

function getSiteHandler() {
  const hostname = window.location.hostname;
  for (const [domain, config] of Object.entries(SITE_HANDLERS)) {
    if (hostname.includes(domain)) {
      return config;
    }
  }
  return null;
}
```

---

## 8. Enhanced Format Preservation

Maintain French formatting in rounded prices:

```javascript
function formatPrice(price, originalFormat, currency = '€') {
  // Detect original format style
  const hasSpace = originalFormat.includes(' ');
  const hasCommaDecimal = originalFormat.includes(',');
  const hasThousandsSep = /\d[\s.]\d{3}/.test(originalFormat);
  const currencyFirst = originalFormat.trim().startsWith(currency);

  // Format the number
  let formatted;

  if (hasThousandsSep) {
    // Format with thousands separator
    const parts = price.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const decimalPart = parts[1];

    if (hasCommaDecimal) {
      formatted = `${integerPart},${decimalPart}`;
    } else {
      formatted = `${integerPart}.${decimalPart}`;
    }
  } else {
    // Simple format
    formatted = price.toFixed(2);
    if (hasCommaDecimal) {
      formatted = formatted.replace('.', ',');
    }
  }

  // Add currency in correct position
  if (currencyFirst) {
    return hasSpace ? `${currency} ${formatted}` : `${currency}${formatted}`;
  } else {
    return hasSpace ? `${formatted} ${currency}` : `${formatted}${currency}`;
  }
}

// Examples:
// formatPrice(1234.99, "1 234,99 €") => "1 235,00 €"
// formatPrice(99.99, "€99,99") => "€100,00"
// formatPrice(1234.99, "€ 1.234,99") => "€ 1.235,00"
```

---

## 9. Avoiding Unit Prices and Special Cases

Filter out non-product prices:

```javascript
function shouldProcessPrice(element, price) {
  // Skip very low prices (likely unit prices like €/kg)
  if (price < 1.0) {
    return false;
  }

  // Skip elements with unit price indicators
  const text = element.textContent.toLowerCase();
  const unitPriceIndicators = [
    '/kg', '/l', '/m²', '/unité', '/pièce',
    'le kg', 'le litre', 'la pièce',
    'au kilo', 'au litre'
  ];

  for (const indicator of unitPriceIndicators) {
    if (text.includes(indicator)) {
      return false;
    }
  }

  // Skip elements inside unit price containers
  const unitPriceClasses = [
    'unit-price', 'prix-unitaire', 'prix-au-kilo',
    'price-per-unit', 'unit-pricing'
  ];

  let parent = element.parentElement;
  while (parent) {
    if (parent.classList) {
      for (const className of unitPriceClasses) {
        if (parent.classList.contains(className)) {
          return false;
        }
      }
    }
    parent = parent.parentElement;
  }

  return true;
}
```

---

## 10. Integration with Existing Code

Update your `processElement` function:

```javascript
function processElement(element) {
  // Skip already processed elements
  if (element.tagName === 'SCRIPT' ||
      element.tagName === 'STYLE' ||
      element.classList?.contains('price-rounder-modified') ||
      element.hasAttribute('data-price-rounded')) {
    return;
  }

  // Check if site has specific handler
  const siteHandler = getSiteHandler();

  if (siteHandler) {
    // Use site-specific selectors
    siteHandler.selectors.forEach(selector => {
      const elements = element.querySelectorAll ?
        element.querySelectorAll(selector) : [];
      elements.forEach(priceElem => {
        const result = siteHandler.handler(priceElem);
        if (result && shouldProcessPrice(priceElem, result.price)) {
          processPriceElement(priceElem, result.price, result.currency);
        }
      });
    });
  }

  // Also use generic detection for fallback
  FRENCH_PRICE_SELECTORS.forEach(selector => {
    try {
      const elements = element.querySelectorAll ?
        element.querySelectorAll(selector) : [];
      elements.forEach(priceElem => {
        if (!priceElem.hasAttribute('data-price-rounded')) {
          const result = detectPrice(priceElem);
          if (result && shouldProcessPrice(priceElem, result.price)) {
            processPriceElement(priceElem, result.price, result.currency || 'EUR');
          }
        }
      });
    } catch (e) {
      // Invalid selector, skip
    }
  });

  // Schema.org detection (page-level)
  if (element === document.body) {
    const schemaResults = detectSchemaOrgPrice();
    schemaResults.forEach(result => {
      if (result.element && shouldProcessPrice(result.element, result.price)) {
        processPriceElement(result.element, result.price, result.currency);
      }
    });
  }
}

function processPriceElement(element, price, currency) {
  // Mark as processed
  element.setAttribute('data-price-rounded', 'true');

  // Check if should round
  const shouldRound = /\.(9[0-9]|[0-9]9)$/.test(price.toFixed(2));

  if (shouldRound) {
    const roundedPrice = roundPrice(price);

    if (roundedPrice !== price) {
      const originalText = element.textContent;
      const formattedRounded = formatPrice(roundedPrice, originalText, currency);
      const styledPrice = createStyledPrice(originalText, formattedRounded, '');

      // Hide original
      element.style.display = 'none';

      // Insert new price
      element.parentNode.insertBefore(styledPrice, element);
      element.classList.add('price-rounder-modified');
    }
  }
}
```

---

## 11. Testing Commands

Test your extension on French sites:

```javascript
// Console testing snippets

// Test price detection
console.log('Schema.org prices:', detectSchemaOrgPrice());

// Test normalization
console.log(normalizePrice('1 234,56')); // Should return 1234.56
console.log(normalizePrice('99,99 €')); // Should return 99.99
console.log(normalizePrice('€ 1.234,99')); // Should return 1234.99

// Test formatting
console.log(formatPrice(1234.99, '1 234,56 €')); // Should preserve format

// Find all price elements on page
const allPrices = FRENCH_PRICE_SELECTORS.flatMap(sel => {
  try {
    return [...document.querySelectorAll(sel)];
  } catch {
    return [];
  }
});
console.log('Found price elements:', allPrices.length);
allPrices.forEach(el => console.log(el.textContent, el.className));
```

---

## 12. Performance Considerations

Optimize for French e-commerce sites:

```javascript
// Cache site handler
let cachedSiteHandler = null;
function getSiteHandlerCached() {
  if (cachedSiteHandler === null) {
    cachedSiteHandler = getSiteHandler();
  }
  return cachedSiteHandler;
}

// Debounce mutation observer for dynamic sites
let mutationTimer = null;
const observer = new MutationObserver(function(mutations) {
  if (!settings.enabled) return;

  clearTimeout(mutationTimer);
  mutationTimer = setTimeout(() => {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === Node.ELEMENT_NODE &&
            !node.classList?.contains('price-rounder-modified')) {
          processElement(node);
        }
      });
    });
  }, 100); // Debounce by 100ms
});
```

---

## Quick Implementation Checklist

- [ ] Add French price selectors to your selector list
- [ ] Update EUR currency pattern for French formatting
- [ ] Enhance normalizePrice() for comma decimal separator
- [ ] Update formatPrice() to preserve French formatting
- [ ] Add Schema.org detection (JSON-LD and microdata)
- [ ] Add data-attribute detection
- [ ] Implement site-specific handlers for major French sites
- [ ] Add filtering for unit prices (€/kg, €/L)
- [ ] Test on Amazon.fr, Fnac, Cdiscount, Darty, Carrefour
- [ ] Handle dynamically loaded prices (AJAX/React)
- [ ] Add performance optimizations (caching, debouncing)

---

## Example: Complete Enhanced Detection

Here's a complete example combining all techniques:

```javascript
function findAndProcessFrenchPrices() {
  // 1. Try site-specific handler first
  const siteHandler = getSiteHandlerCached();
  if (siteHandler) {
    siteHandler.selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.hasAttribute('data-price-rounded')) {
          const result = siteHandler.handler(el);
          if (result && shouldProcessPrice(el, result.price)) {
            processPriceElement(el, result.price, result.currency);
          }
        }
      });
    });
  }

  // 2. Try Schema.org
  detectSchemaOrgPrice().forEach(result => {
    if (result.element && !result.element.hasAttribute('data-price-rounded')) {
      if (shouldProcessPrice(result.element, result.price)) {
        processPriceElement(result.element, result.price, result.currency);
      }
    }
  });

  // 3. Try data attributes
  document.querySelectorAll('[data-price], [data-product-price]').forEach(el => {
    if (!el.hasAttribute('data-price-rounded')) {
      const result = detectDataAttributePrice(el);
      if (result && shouldProcessPrice(el, result.price)) {
        processPriceElement(el, result.price, 'EUR');
      }
    }
  });

  // 4. Try French selectors
  FRENCH_PRICE_SELECTORS.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.hasAttribute('data-price-rounded')) {
          const result = detectPrice(el);
          if (result && shouldProcessPrice(el, result.price)) {
            processPriceElement(el, result.price, 'EUR');
          }
        }
      });
    } catch (e) {
      // Invalid selector
    }
  });
}
```

---

**Last Updated**: 2025-10-10
