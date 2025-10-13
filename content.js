// Price Rounder Content Script - Modular Architecture

(function() {
  'use strict';

  // ============================================================================
  // CONFIG MODULE - Configuration and Constants
  // ============================================================================
  const Config = {
    // Currency patterns for price detection
    CURRENCY_PATTERNS: {
      USD: /\$\s?(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/g,
      EUR: /€?\s?(\d{1,3}(?:[\s.]?\d{3})*(?:,\d{2})?)\s?€?/g,
      GBP: /£\s?(\d{1,3}(?:,?\d{3})*(?:\.\d{2})?)/g,
    },

    // Currency symbols
    CURRENCY_SYMBOLS: {
      USD: '$',
      EUR: '€',
      GBP: '£',
    },

    // French e-commerce price selectors
    FRENCH_PRICE_SELECTORS: [
      '.prix', '.price', '.produit-prix', '.prix-actuel', '.prix-promo', '.prix-final',
      '.f-faPriceBox__price', '.userPrice', '.Article-price', // Fnac
      '.product-price', '.price-current', '.price-value', // Cdiscount
      '.price-amount', '.price-final', '.price-block', // Darty
      '.standard-price', // Boulanger
      '.main-price', '.current-price', '.price-details', // Leclerc/Carrefour
      '[data-price]', '[data-product-price]', '[data-prix]',
      '[itemprop="price"]'
    ],

    // Legacy/generic price selectors
    GENERIC_PRICE_SELECTORS: [
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '#priceblock_saleprice',
      '.offer-price',
      '.p13n-sc-price',
      '.priceLarge',
      '.a-color-price',
    ],

    // Site-specific price selectors
    SITE_SPECIFIC_SELECTORS: {
      amazon: '.a-price',
      fnac: '.f-faPriceBox__price',
      cdiscount: '.c-price, .c-price-s',
      google: '.VbBaOe, .a8Pemb, .e10twf, .HRLxBb, .dD87zc, [data-sh-or], .qptdjc',
    },

    // Data attributes used for price storage
    DATA_PRICE_ATTRIBUTES: [
      'data-price',
      'data-product-price',
      'data-price-value',
      'data-prix',
      'data-montant'
    ],

    // Container elements to skip
    CONTAINER_TAGS: ['LI', 'ARTICLE', 'SECTION'],

    // Maximum children count for a price element
    MAX_CHILDREN_COUNT: 3,

    // Threshold for detecting cents format
    CENTS_THRESHOLD: 1000,

    // Styling configuration
    STYLES: {
      roundedPrice: 'font-weight: bold; color: #2563eb;',
      originalPrice: 'font-size: 0.75em; color: #888;',
    },

    // Default settings
    DEFAULT_SETTINGS: {
      enabled: true,
      roundingMode: 'up',
      showOriginal: true,
      centsThreshold: 90
    },

    // Psychological pricing pattern
    PSYCHOLOGICAL_PRICING_PATTERN: /\.(9[0-9]|[0-9]9)$/,

    // Price format regex
    PRICE_FORMAT_REGEX: /([€$£])\s?(\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2})|(\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2})\s?([€$£])/,

    // European price format regex
    EUROPEAN_PRICE_REGEX: /(\d{1,3}(?:[\s.]\d{3})*[.,]\d{2})\s?€/
  };

  // ============================================================================
  // UTILS MODULE - Utility Functions
  // ============================================================================
  const Utils = {
    /**
     * Normalizes a price string to a float number
     */
    normalizePrice(priceStr) {
      try {
        // Remove currency symbols and trim
        priceStr = priceStr.replace(/[€$£]/g, '').trim();
        // Remove non-breaking spaces and regular spaces
        priceStr = priceStr.replace(/\u00A0/g, '').replace(/\s/g, '');

        // Handle mixed comma and dot (e.g., "1.234,56" or "1,234.56")
        if (priceStr.includes(',') && priceStr.includes('.')) {
          // If comma comes after dot, it's European format (1.234,56)
          if (priceStr.lastIndexOf(',') > priceStr.lastIndexOf('.')) {
            priceStr = priceStr.replace(/\./g, '').replace(',', '.');
          } else {
            // US format (1,234.56)
            priceStr = priceStr.replace(/,/g, '');
          }
        }
        // Only comma present
        else if (priceStr.includes(',')) {
          const parts = priceStr.split(',');
          const afterComma = parts[parts.length - 1];

          // If only 2 digits after comma, treat as decimal separator (399,99 → 399.99)
          if (afterComma.length === 2 && parts.length === 2) {
            priceStr = priceStr.replace(',', '.');
          }
          // If 1 digit after comma, might be decimal (9,5 → 9.5)
          else if (afterComma.length === 1 && parts.length === 2) {
            priceStr = priceStr.replace(',', '.');
          }
          // Otherwise, treat as thousands separator (1,234 → 1234)
          else {
            priceStr = priceStr.replace(/,/g, '');
          }
        }
        // Only dot present
        else if (priceStr.includes('.')) {
          const parts = priceStr.split('.');
          const afterDot = parts[parts.length - 1];

          // If more than 2 digits after dot, treat as thousands separator
          if (afterDot.length > 2) {
            priceStr = priceStr.replace(/\./g, '');
          }
          // Otherwise, treat as decimal separator
        }

        const parsed = parseFloat(priceStr);
        return isNaN(parsed) ? null : parsed;
      } catch (error) {
        console.error('[Price Rounder] Error normalizing price:', error);
        return null;
      }
    },

    /**
     * Rounds a price based on the specified rounding mode
     */
    roundPrice(price, mode = 'up') {
      try {
        switch(mode) {
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
      } catch (error) {
        console.error('[Price Rounder] Error rounding price:', error);
        return price;
      }
    },

    /**
     * Formats a price for display
     */
    formatPrice(price) {
      try {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return Math.round(numPrice).toString();
      } catch (error) {
        console.error('[Price Rounder] Error formatting price:', error);
        return price.toString();
      }
    },

    /**
     * Creates a styled price element
     */
    createStyledPrice(originalText, roundedText, currency = '', showOriginal = true) {
      try {
        const span = document.createElement('span');
        span.className = 'price-rounder-modified';

        if (showOriginal) {
          span.innerHTML = `<span style="${Config.STYLES.roundedPrice}">${currency}${roundedText}</span> <span style="${Config.STYLES.originalPrice}">(${originalText})</span>`;
        } else {
          span.innerHTML = `<span style="font-weight: bold;">${currency}${roundedText}</span>`;
        }

        return span;
      } catch (error) {
        console.error('[Price Rounder] Error creating styled price:', error);
        const span = document.createElement('span');
        span.textContent = roundedText;
        return span;
      }
    },

    /**
     * Checks if a price should be rounded based on cents threshold
     */
    shouldRoundPrice(price, centsThreshold = 90) {
      try {
        // If price is already a whole number, no need to round
        if (price % 1 === 0) {
          return false;
        }

        // Get the cents part (e.g., 51.49 → 49, 399.99 → 99)
        const cents = Math.round((price % 1) * 100);

        // Round if cents meet or exceed the threshold
        return cents >= centsThreshold;
      } catch (error) {
        console.error('[Price Rounder] Error checking if price should round:', error);
        return false;
      }
    },

    /**
     * Detects price from data attributes
     */
    detectDataAttributePrice(element) {
      try {
        for (const attr of Config.DATA_PRICE_ATTRIBUTES) {
          const value = element.getAttribute(attr);
          if (value) {
            let price = this.normalizePrice(value);
            if (price !== null) {
              if (price >= Config.CENTS_THRESHOLD && Number.isInteger(price)) {
                price = price / 100;
              }
              return { price, attribute: attr };
            }
          }
        }
        return null;
      } catch (error) {
        console.error('[Price Rounder] Error detecting data attribute price:', error);
        return null;
      }
    },

    /**
     * Checks if an element should be skipped
     */
    shouldSkipElement(element) {
      if (!element) return true;
      if (element.classList?.contains('price-rounder-modified')) return true;
      if (element.hasAttribute('data-price-rounded')) return true;
      if (!element.textContent?.trim()) return true;
      return false;
    },

    /**
     * Marks an element as processed
     */
    markAsProcessed(element) {
      try {
        element.classList.add('price-rounder-modified');
        element.setAttribute('data-price-rounded', 'true');
      } catch (error) {
        console.error('[Price Rounder] Error marking element:', error);
      }
    },

    /**
     * Removes processed markers
     */
    unmarkAsProcessed(element) {
      try {
        element.classList.remove('price-rounder-modified');
        element.removeAttribute('data-price-rounded');
      } catch (error) {
        console.error('[Price Rounder] Error unmarking element:', error);
      }
    },

    /**
     * Validates settings
     */
    validateSettings(settings) {
      const validModes = ['up', 'nearest', 'nearest5', 'nearest10'];
      const validThresholds = [0, 50, 80, 90, 95];
      return {
        enabled: typeof settings.enabled === 'boolean' ? settings.enabled : true,
        roundingMode: validModes.includes(settings.roundingMode) ? settings.roundingMode : 'up',
        showOriginal: typeof settings.showOriginal === 'boolean' ? settings.showOriginal : true,
        centsThreshold: validThresholds.includes(settings.centsThreshold) ? settings.centsThreshold : 90
      };
    }
  };

  // ============================================================================
  // HANDLERS MODULE - Site-Specific Price Handlers
  // ============================================================================

  /**
   * Base class for price handlers
   */
  class BasePriceHandler {
    constructor(settings) {
      this.settings = settings;
    }

    shouldSkip(element) {
      return Utils.shouldSkipElement(element);
    }

    markProcessing(element) {
      element.setAttribute('data-price-rounded', 'true');
    }

    processPrice(price, originalDisplay, currency) {
      try {
        if (!Utils.shouldRoundPrice(price, this.settings.centsThreshold)) {
          return null;
        }

        const roundedPrice = Utils.roundPrice(price, this.settings.roundingMode);

        if (roundedPrice !== price) {
          const formattedRounded = Utils.formatPrice(roundedPrice);
          const roundedText = formattedRounded + ' ' + currency;
          return Utils.createStyledPrice(originalDisplay, roundedText, '', this.settings.showOriginal);
        }

        return null;
      } catch (error) {
        console.error('[Price Rounder] Error processing price:', error);
        return null;
      }
    }
  }

  /**
   * Handler for Amazon prices
   */
  class AmazonPriceHandler extends BasePriceHandler {
    process(priceElement) {
      if (this.shouldSkip(priceElement)) return;
      this.markProcessing(priceElement);

      try {
        let priceStr = '';
        let currency = '';
        let offscreen = null;

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
          const price = Utils.normalizePrice(priceStr);
          const originalDisplay = priceStr.replace('.', ',') + ' ' + currency;
          const styledPrice = this.processPrice(price, originalDisplay, currency);

          if (styledPrice) {
            const visiblePrice = priceElement.querySelector('[aria-hidden="true"]');
            if (visiblePrice) visiblePrice.style.display = 'none';

            if (offscreen) {
              const formattedRounded = Utils.formatPrice(Utils.roundPrice(price, this.settings.roundingMode));
              offscreen.textContent = formattedRounded + ' ' + currency;
              offscreen.style.position = 'static';
              offscreen.style.clip = 'auto';
              offscreen.style.overflow = 'visible';
              offscreen.style.height = 'auto';
              offscreen.style.width = 'auto';
            }

            priceElement.appendChild(styledPrice);
            Utils.markAsProcessed(priceElement);
          }
        } else {
          Utils.unmarkAsProcessed(priceElement);
        }
      } catch (error) {
        console.error('[Price Rounder] Error in Amazon handler:', error);
        Utils.unmarkAsProcessed(priceElement);
      }
    }
  }

  /**
   * Handler for Cdiscount prices
   */
  class CdiscountPriceHandler extends BasePriceHandler {
    process(priceElement) {
      if (this.shouldSkip(priceElement)) return;
      this.markProcessing(priceElement);

      try {
        // Skip mention/comparison prices (Amazon prices, etc.)
        if (priceElement.classList.contains('c-price--mention')) {
          Utils.unmarkAsProcessed(priceElement);
          return;
        }

        // Handle structure like "16€<span itemprop='priceCurrency'>99</span>"
        const currencySpan = priceElement.querySelector('span[itemprop="priceCurrency"]');
        if (currencySpan && !currencySpan.textContent.match(/[€$£]/)) {
          // The currency span actually contains cents, not currency symbol
          const textNodes = Array.from(priceElement.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);

          if (textNodes.length > 0) {
            const wholeText = textNodes[0].textContent.trim();
            const centsText = currencySpan.textContent.trim();

            // Parse something like "16€" and "99"
            const wholeMatch = wholeText.match(/(\d+)€?/);
            if (wholeMatch && centsText.match(/^\d{2}$/)) {
              const priceStr = wholeMatch[1] + '.' + centsText;
              const price = Utils.normalizePrice(priceStr);
              const originalText = wholeMatch[1] + '€' + centsText;

              if (price !== null && Utils.shouldRoundPrice(price, this.settings.centsThreshold)) {
                const roundedPrice = Utils.roundPrice(price, this.settings.roundingMode);

                if (roundedPrice !== price) {
                  const formattedRounded = Utils.formatPrice(roundedPrice);

                  // Update in place with blue styling
                  const roundedSpan = document.createElement('span');
                  roundedSpan.style.color = '#2563eb';
                  roundedSpan.style.fontWeight = 'bold';
                  roundedSpan.textContent = formattedRounded + '€';

                  // Replace the text node with the styled span
                  textNodes[0].parentNode.replaceChild(roundedSpan, textNodes[0]);
                  currencySpan.style.display = 'none';

                  // Add original price if enabled
                  if (this.settings.showOriginal && !priceElement.querySelector('.price-rounder-original')) {
                    const originalIndicator = document.createElement('span');
                    originalIndicator.className = 'price-rounder-original';
                    originalIndicator.style.fontSize = '0.6em';
                    originalIndicator.style.color = '#888';
                    originalIndicator.style.fontWeight = 'normal';
                    originalIndicator.style.marginLeft = '4px';
                    originalIndicator.textContent = '(' + originalText + ')';
                    priceElement.appendChild(originalIndicator);
                  }

                  Utils.markAsProcessed(priceElement);
                  return;
                }
              }

              Utils.unmarkAsProcessed(priceElement);
              return;
            }
          }
        }

        // Handle the complex nested structure with separate whole and cents parts
        const ariaHidden = priceElement.querySelector('[aria-hidden="true"]');
        const displayPrice = priceElement.querySelector('#DisplayPrice, [id^="DisplayPrice"]');
        const displayCents = priceElement.querySelector('#DisplayPriceCent, [id^="DisplayPriceCent"]');

        if (displayPrice && displayCents && ariaHidden) {
          // This is a main price with complex structure - update the display elements directly
          const wholeText = displayPrice.textContent.trim();
          const centsText = displayCents.textContent.replace('€', '').trim();

          const priceStr = wholeText + '.' + centsText;
          const price = Utils.normalizePrice(priceStr);

          if (price !== null && Utils.shouldRoundPrice(price, this.settings.centsThreshold)) {
            const roundedPrice = Utils.roundPrice(price, this.settings.roundingMode);

            if (roundedPrice !== price) {
              const formattedRounded = Utils.formatPrice(roundedPrice);
              const originalText = wholeText + ',' + centsText + ' €';

              // Update the visible parts with styling
              displayPrice.textContent = formattedRounded;
              displayPrice.style.color = '#2563eb';
              displayPrice.style.fontWeight = 'bold';

              // Hide the cents part since rounded prices don't have cents
              const supElement = displayCents.parentElement;
              if (supElement && supElement.tagName === 'SUP') {
                supElement.style.display = 'none';
              }

              // Update the hidden accessible text
              const hiddenSpan = priceElement.querySelector('.u-visually-hidden');
              if (hiddenSpan) {
                if (this.settings.showOriginal) {
                  hiddenSpan.textContent = formattedRounded + ' € (original: ' + originalText + ')';
                } else {
                  hiddenSpan.textContent = formattedRounded + ' €';
                }
              }

              // Add original price indicator after the price if showOriginal is enabled
              if (this.settings.showOriginal && !ariaHidden.querySelector('.price-rounder-original')) {
                const originalIndicator = document.createElement('span');
                originalIndicator.className = 'price-rounder-original';
                originalIndicator.style.fontSize = '0.5em';
                originalIndicator.style.color = '#888';
                originalIndicator.style.fontWeight = 'normal';
                originalIndicator.style.marginLeft = '8px';
                originalIndicator.style.verticalAlign = 'middle';
                originalIndicator.textContent = '(' + originalText + ')';
                ariaHidden.appendChild(originalIndicator);
              }

              Utils.markAsProcessed(priceElement);
              return;
            }
          }

          Utils.unmarkAsProcessed(priceElement);
          return;
        }

        // Handle simple price text with <s> tag (strikethrough prices)
        const priceText = priceElement.textContent.trim();
        const match = priceText.match(/(\d{1,3}(?:[\s.]\d{3})*,\d{2})\s?€/);

        if (match) {
          const priceStr = match[1];
          const price = Utils.normalizePrice(priceStr);

          if (price !== null && Utils.shouldRoundPrice(price, this.settings.centsThreshold)) {
            const roundedPrice = Utils.roundPrice(price, this.settings.roundingMode);

            if (roundedPrice !== price) {
              const formattedRounded = Utils.formatPrice(roundedPrice);
              const originalText = match[0];

              const sTag = priceElement.querySelector('s');
              if (sTag) {
                // Keep the strikethrough, update content with muted styling
                if (this.settings.showOriginal) {
                  sTag.innerHTML = `<span style="font-weight: 600;">${formattedRounded} €</span> <span style="font-size: 0.85em; opacity: 0.7;">(${originalText})</span>`;
                } else {
                  sTag.innerHTML = `<span style="font-weight: 600;">${formattedRounded} €</span>`;
                }
                Utils.markAsProcessed(priceElement);
              } else {
                // No <s> tag, replace content but preserve the element structure
                const formattedRounded = Utils.formatPrice(roundedPrice);

                if (this.settings.showOriginal) {
                  priceElement.innerHTML = `<span style="font-weight: bold; color: #2563eb;">${formattedRounded} €</span> <span style="font-size: 0.75em; color: #888;">(${originalText})</span>`;
                } else {
                  priceElement.innerHTML = `<span style="font-weight: bold; color: #2563eb;">${formattedRounded} €</span>`;
                }
                Utils.markAsProcessed(priceElement);
              }
              return;
            }
          }
        }

        Utils.unmarkAsProcessed(priceElement);
      } catch (error) {
        console.error('[Price Rounder] Error in Cdiscount handler:', error);
        Utils.unmarkAsProcessed(priceElement);
      }
    }
  }

  /**
   * Handler for Fnac prices
   */
  class FnacPriceHandler extends BasePriceHandler {
    process(priceElement) {
      if (this.shouldSkip(priceElement)) return;
      this.markProcessing(priceElement);

      try {
        const priceText = priceElement.textContent.trim();
        const match = priceText.match(/(\d{1,3}(?:[\s.]\d{3})*[.,]\d{2})\s?€/);

        if (match) {
          const priceStr = match[1];
          const price = Utils.normalizePrice(priceStr);

          const styledPrice = this.processPrice(price, priceText, '€');

          if (styledPrice) {
            priceElement.style.display = 'none';
            priceElement.parentNode.insertBefore(styledPrice, priceElement);
            Utils.markAsProcessed(priceElement);
          }
        } else {
          Utils.unmarkAsProcessed(priceElement);
        }
      } catch (error) {
        console.error('[Price Rounder] Error in Fnac handler:', error);
        Utils.unmarkAsProcessed(priceElement);
      }
    }
  }

  /**
   * Handler for Google Shopping prices
   */
  class GooglePriceHandler extends BasePriceHandler {
    process(priceElement) {
      if (this.shouldSkip(priceElement)) return;
      this.markProcessing(priceElement);

      try {
        // Get text content and handle non-breaking spaces
        let priceText = priceElement.textContent.trim().replace(/\u00A0/g, ' ');

        if (!priceText) {
          Utils.unmarkAsProcessed(priceElement);
          return;
        }

        // Match various Google Shopping price formats
        // e.g., "399,99 €", "€399.99", "$399.99", "500 €", "399.99"
        const match = priceText.match(/([€$£])\s?(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,2})?)|(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,2})?)\s?([€$£])?/);

        if (match) {
          const currency = match[1] || match[4] || '€'; // Default to € if no currency found
          let priceStr = match[2] || match[3];

          if (!priceStr) {
            Utils.unmarkAsProcessed(priceElement);
            return;
          }

          const price = Utils.normalizePrice(priceStr);

          if (price === null || price === 0) {
            Utils.unmarkAsProcessed(priceElement);
            return;
          }

          const originalDisplay = priceText;
          const styledPrice = this.processPrice(price, originalDisplay, currency);

          if (styledPrice) {
            // Replace the element's content with styled price
            priceElement.innerHTML = '';
            priceElement.appendChild(styledPrice);
            Utils.markAsProcessed(priceElement);
          } else {
            Utils.unmarkAsProcessed(priceElement);
          }
        } else {
          Utils.unmarkAsProcessed(priceElement);
        }
      } catch (error) {
        console.error('[Price Rounder] Error in Google handler:', error);
        Utils.unmarkAsProcessed(priceElement);
      }
    }
  }

  /**
   * Handler for simple prices
   */
  class SimplePriceHandler extends BasePriceHandler {
    process(priceElement) {
      if (this.shouldSkip(priceElement)) return;

      try {
        if (Config.CONTAINER_TAGS.includes(priceElement.tagName)) return;
        if (priceElement.children.length > Config.MAX_CHILDREN_COUNT) return;

        if (priceElement.querySelector('.a-price')) return;
        if (priceElement.querySelector('.c-price, .c-price-s')) return;
        if (priceElement.querySelector('.f-faPriceBox__price')) return;
        if (priceElement.querySelector('.price-rounder-modified')) return;

        let parent = priceElement.parentElement;
        while (parent) {
          if (parent.classList?.contains('c-price') || parent.classList?.contains('c-price-s')) return;
          if (parent.classList?.contains('a-price')) return;
          if (parent.classList?.contains('f-faPriceBox__price')) return;
          parent = parent.parentElement;
        }

        const text = priceElement.textContent.trim();
        const match = text.match(Config.PRICE_FORMAT_REGEX);

        let price, currency, originalDisplay;

        if (match) {
          currency = match[1] || match[4];
          const priceStr = match[2] || match[3];
          price = Utils.normalizePrice(priceStr);
          originalDisplay = match[0];
        } else {
          const dataPrice = Utils.detectDataAttributePrice(priceElement);
          if (dataPrice) {
            price = dataPrice.price;
            currency = '€';
            const priceMatch = text.match(Config.EUROPEAN_PRICE_REGEX);
            if (priceMatch) {
              originalDisplay = priceMatch[0];
            } else {
              originalDisplay = price.toFixed(2).replace('.', ',') + ' €';
            }
          } else {
            return;
          }
        }

        if (price === null) return;

        const styledPrice = this.processPrice(price, originalDisplay, currency);

        if (styledPrice) {
          priceElement.innerHTML = '';
          priceElement.appendChild(styledPrice);
          Utils.markAsProcessed(priceElement);
        }
      } catch (error) {
        console.error('[Price Rounder] Error in Simple handler:', error);
      }
    }
  }

  // ============================================================================
  // MAIN MODULE - Extension Entry Point
  // ============================================================================

  let settings = { ...Config.DEFAULT_SETTINGS };
  let handlers = null;

  /**
   * Initializes the extension
   */
  function initialize() {
    chrome.storage.sync.get(['enabled', 'roundingMode', 'showOriginal', 'centsThreshold'], function(result) {
      settings = Utils.validateSettings({
        enabled: result.enabled,
        roundingMode: result.roundingMode,
        showOriginal: result.showOriginal,
        centsThreshold: result.centsThreshold
      });

      handlers = {
        amazon: new AmazonPriceHandler(settings),
        cdiscount: new CdiscountPriceHandler(settings),
        fnac: new FnacPriceHandler(settings),
        google: new GooglePriceHandler(settings),
        simple: new SimplePriceHandler(settings)
      };

      if (settings.enabled) {
        processPage();
      }
    });
  }

  /**
   * Processes text nodes for price patterns
   */
  function processTextNode(node) {
    if (node.nodeType !== Node.TEXT_NODE) return;

    try {
      let parent = node.parentElement;
      while (parent && parent !== document.body) {
        if (parent.classList?.contains('a-price')) return;
        if (parent.classList?.contains('c-price') || parent.classList?.contains('c-price-s')) return;
        if (parent.classList?.contains('c-buybox__price')) return; // Cdiscount buybox
        if (parent.classList?.contains('f-faPriceBox__price')) return;
        if (parent.classList?.contains('price-rounder-modified')) return;
        if (parent.classList?.contains('VbBaOe')) return; // Google Shopping prices
        if (parent.hasAttribute?.('data-price-rounded')) return;
        // Skip if parent is a strikethrough price (often old prices on Amazon)
        if (parent.tagName === 'S' || parent.classList?.contains('a-text-strike')) return;
        // Skip Cdiscount specific containers
        if (parent.classList?.contains('c-buybox__block')) return;
        parent = parent.parentElement;
      }

      let text = node.textContent;
      let modified = false;
      let newContent = document.createDocumentFragment();
      let lastIndex = 0;

      for (const [currencyName, pattern] of Object.entries(Config.CURRENCY_PATTERNS)) {
        const regex = new RegExp(pattern);
        let match;

        while ((match = regex.exec(text)) !== null) {
          const originalPrice = match[1];
          const price = Utils.normalizePrice(originalPrice);

          if (price !== null && Utils.shouldRoundPrice(price, settings.centsThreshold)) {
            const roundedPrice = Utils.roundPrice(price, settings.roundingMode);

            if (roundedPrice !== price) {
              modified = true;

              if (match.index > lastIndex) {
                newContent.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
              }

              const currencySymbol = match[0].charAt(0);
              const formattedRounded = Utils.formatPrice(roundedPrice);
              newContent.appendChild(Utils.createStyledPrice(
                match[0],
                formattedRounded,
                currencySymbol,
                settings.showOriginal
              ));

              lastIndex = match.index + match[0].length;
            }
          }
        }
      }

      if (modified) {
        if (lastIndex < text.length) {
          newContent.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        node.parentNode.replaceChild(newContent, node);
      }
    } catch (error) {
      console.error('[Price Rounder] Error processing text node:', error);
    }
  }

  /**
   * Processes a DOM element
   */
  function processElement(element) {
    try {
      if (element.tagName === 'SCRIPT' ||
          element.tagName === 'STYLE' ||
          element.classList?.contains('price-rounder-modified')) {
        return;
      }

      const amazonPrices = element.querySelectorAll ? element.querySelectorAll(Config.SITE_SPECIFIC_SELECTORS.amazon) : [];
      amazonPrices.forEach(el => handlers.amazon.process(el));

      const fnacPrices = element.querySelectorAll ? element.querySelectorAll(Config.SITE_SPECIFIC_SELECTORS.fnac) : [];
      fnacPrices.forEach(el => handlers.fnac.process(el));

      const cdiscountPrices = element.querySelectorAll ? element.querySelectorAll(Config.SITE_SPECIFIC_SELECTORS.cdiscount) : [];
      cdiscountPrices.forEach(el => handlers.cdiscount.process(el));

      const googlePrices = element.querySelectorAll ? element.querySelectorAll(Config.SITE_SPECIFIC_SELECTORS.google) : [];
      googlePrices.forEach(el => handlers.google.process(el));

      const allSelectors = [...Config.GENERIC_PRICE_SELECTORS, ...Config.FRENCH_PRICE_SELECTORS];

      allSelectors.forEach(selector => {
        const elements = element.querySelectorAll ? element.querySelectorAll(selector) : [];
        elements.forEach(el => handlers.simple.process(el));
      });

      if (element.classList?.contains('a-price')) {
        handlers.amazon.process(element);
      } else if (element.id && ['priceblock_ourprice', 'priceblock_dealprice', 'priceblock_saleprice'].includes(element.id)) {
        handlers.simple.process(element);
      } else if (element.classList && ['offer-price', 'p13n-sc-price', 'priceLarge', 'a-color-price'].some(c => element.classList.contains(c))) {
        handlers.simple.process(element);
      }

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
    } catch (error) {
      console.error('[Price Rounder] Error processing element:', error);
    }
  }

  /**
   * Processes the entire page
   */
  function processPage() {
    try {
      processElement(document.body);
    } catch (error) {
      console.error('[Price Rounder] Error processing page:', error);
    }
  }

  /**
   * Observes DOM changes
   */
  const observer = new MutationObserver(function(mutations) {
    if (!settings.enabled) return;

    try {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList?.contains('price-rounder-modified')) return;
            processElement(node);
          }
        });
      });
    } catch (error) {
      console.error('[Price Rounder] Error in mutation observer:', error);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  /**
   * Listens for settings changes
   */
  chrome.storage.onChanged.addListener(function(changes) {
    try {
      if (changes.enabled) {
        settings.enabled = changes.enabled.newValue;
        if (settings.enabled) {
          location.reload();
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
      if (changes.centsThreshold) {
        settings.centsThreshold = changes.centsThreshold.newValue;
        location.reload();
      }
    } catch (error) {
      console.error('[Price Rounder] Error handling settings change:', error);
    }
  });

  // Initialize
  initialize();
})();
