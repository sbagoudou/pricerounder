# French E-Commerce Price HTML Structures Analysis

## Executive Summary

This document analyzes the HTML structures used for displaying prices on major French e-commerce websites. The analysis is based on web scraping documentation, Schema.org implementations, and common patterns found in French online retail.

**Top 10 French E-Commerce Sites (2024-2025):**
1. Amazon.fr (155.69M monthly visits)
2. E.Leclerc (22.64M monthly visits)
3. Fnac (20.89M monthly visits)
4. Vinted (20.57M monthly visits)
5. Temu (20.56M monthly visits)
6. Carrefour (19.44M monthly visits)
7. Booking.com (19.25M monthly visits)
8. Cdiscount (Major retailer)
9. Darty (Electronics specialist)
10. Boulanger (Electronics/appliances)

---

## Common French E-Commerce Price Patterns

### Currency Format
- **Symbol**: € (Euro)
- **Format**: `1 234,56 €` or `1.234,56€` or `€1234.56`
- **Decimal separator**: Comma (,) is standard in France
- **Thousands separator**: Space or period (.)
- **Currency position**: Can appear before or after the amount

### Common CSS Class Naming Patterns

French e-commerce sites commonly use these class name patterns:

```
.price, .prix
.product-price, .produit-prix
.price-value, .prix-valeur
.current-price, .prix-actuel
.sale-price, .prix-promo
.old-price, .prix-barre
.price-amount, .montant-prix
.offer-price, .prix-offre
.unit-price, .prix-unitaire
```

---

## Site-Specific Price Structures

### 1. Amazon.fr

**Context**: Product listings, detail pages, cart, checkout

**HTML Structure** (based on Amazon's global pattern):
```html
<!-- Modern Amazon price structure -->
<span class="a-price" data-a-size="xl" data-a-color="base">
    <span class="a-offscreen">89,99 €</span>
    <span aria-hidden="true">
        <span class="a-price-symbol">€</span>
        <span class="a-price-whole">89<span class="a-price-decimal">,</span></span>
        <span class="a-price-fraction">99</span>
    </span>
</span>

<!-- Legacy Amazon price IDs -->
<span id="priceblock_ourprice">89,99 €</span>
<span id="priceblock_dealprice">89,99 €</span>
<span id="priceblock_saleprice">89,99 €</span>

<!-- Search results -->
<span class="a-color-price">89,99 €</span>
<span class="p13n-sc-price">89,99 €</span>
```

**Key Selectors**:
- `.a-price` - Main price container
- `.a-offscreen` - Screen reader accessible price (most accurate)
- `.a-price-whole` - Euro amount
- `.a-price-fraction` - Cent amount
- `.a-price-symbol` - Currency symbol
- `#priceblock_ourprice`, `#priceblock_dealprice` - Legacy selectors

**Framework**: Custom React-based framework
**Data Attributes**: `data-a-size`, `data-a-color`

---

### 2. Fnac.com

**Context**: Product listings, detail pages, multimedia and books

**HTML Structure** (based on scraping documentation):
```html
<!-- Product listing price -->
<span class="f-faPriceBox__price userPrice checked">89,99 €</span>

<!-- Alternative structures -->
<div class="Article-price">
    <span class="price-value">89,99</span>
    <span class="price-currency">€</span>
</div>

<!-- With strikethrough original price -->
<div class="price-container">
    <span class="price-old">99,99 €</span>
    <span class="price-new">89,99 €</span>
</div>
```

**Key Selectors**:
- `.f-faPriceBox__price` - Main price class (BEM naming convention)
- `.userPrice` - User-facing price
- `.Article-price` - Article/product price container
- `.price-value` - Numeric value
- `.price-currency` - Currency symbol

**Framework**: Custom JavaScript with BEM CSS methodology
**Protection**: Custom WAF (Web Application Firewall), geo-blocking

---

### 3. Cdiscount.com

**Context**: Product listings, flash sales, marketplace

**HTML Structure** (inferred from common patterns):
```html
<!-- Product card price -->
<div class="price">
    <span class="price-current">89,99€</span>
    <span class="price-old">99,99€</span>
</div>

<!-- Alternative structure -->
<div class="product-price">
    <span class="price-value" data-price="89.99">89,99 €</span>
</div>

<!-- Marketplace seller price -->
<div class="seller-price">
    <span class="amount">89,99</span>
    <span class="currency">€</span>
</div>
```

**Key Selectors**:
- `.price`, `.product-price` - Price containers
- `.price-current`, `.price-value` - Current price
- `.price-old` - Original/crossed-out price
- `[data-price]` - Data attribute with numeric value

**Framework**: Custom JavaScript
**Protection**: JavaScript challenge/verification on initial load

---

### 4. Darty.com

**Context**: Electronics and appliances

**HTML Structure** (inferred from scraping references):
```html
<!-- Product price -->
<div class="product-price">
    <span class="price-amount">89,99</span>
    <span class="price-symbol">€</span>
</div>

<!-- With discount -->
<div class="price-block">
    <div class="price-regular">
        <span class="amount">99,99 €</span>
    </div>
    <div class="price-final">
        <span class="amount">89,99 €</span>
    </div>
</div>

<!-- Installment pricing -->
<div class="price-installment">
    <span class="monthly-payment">14,99 €/mois</span>
</div>
```

**Key Selectors**:
- `.product-price`, `.price-block` - Price containers
- `.price-amount`, `.amount` - Numeric value
- `.price-final` - Final/discounted price
- `.price-installment` - Payment plan pricing

---

### 5. Boulanger.com

**Context**: Electronics and home appliances

**HTML Structure** (based on Mirakl marketplace platform):
```html
<!-- Product listing -->
<div class="product-price">
    <span class="price" data-price="89.99">
        <span class="value">89,99</span>
        <span class="currency">€</span>
    </span>
</div>

<!-- Price with loyalty program -->
<div class="price-container">
    <div class="standard-price">89,99 €</div>
    <div class="loyalty-price">85,49 € avec la carte</div>
</div>
```

**Key Selectors**:
- `.product-price` - Main container
- `.price[data-price]` - Price element with data attribute
- `.value`, `.currency` - Price components
- `.loyalty-price` - Special member pricing

**Platform**: Mirakl marketplace integration

---

### 6. E.Leclerc / LeclercDrive.fr

**Context**: Grocery delivery, drive pickup, supermarket

**HTML Structure** (inferred from grocery e-commerce patterns):
```html
<!-- Product price -->
<div class="product-price">
    <span class="price-euros">89</span>
    <span class="price-cents">,99</span>
    <span class="price-currency">€</span>
</div>

<!-- Unit price (common for groceries) -->
<div class="price-details">
    <div class="main-price">89,99 €</div>
    <div class="unit-price">(4,50 €/kg)</div>
</div>

<!-- Promotion banner -->
<div class="promo-price">
    <span class="old-price">99,99 €</span>
    <span class="promo-badge">-10%</span>
    <span class="new-price">89,99 €</span>
</div>
```

**Key Selectors**:
- `.product-price` - Main price
- `.price-euros`, `.price-cents` - Split price display
- `.unit-price` - Per-unit pricing (legal requirement in France)
- `.promo-price` - Promotional pricing

**Notes**:
- Must display unit pricing per French law (€/kg, €/L, etc.)
- Drive system with 690 stores

---

### 7. Carrefour.fr

**Context**: Supermarket, grocery delivery, general retail

**HTML Structure** (based on scraping API data):
```html
<!-- Product card with structured data -->
<div class="product-card" itemscope itemtype="https://schema.org/Product">
    <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <meta itemprop="priceCurrency" content="EUR">
        <span itemprop="price" content="89.99">89,99 €</span>
        <link itemprop="availability" href="https://schema.org/InStock">
    </div>
</div>

<!-- Simpler structure -->
<div class="product-price" data-price="89.99" data-currency="EUR">
    <span class="price-amount">89,99 €</span>
</div>

<!-- With regular price -->
<div class="price-info">
    <span class="regular-price" data-regular-price="99">99,00 €</span>
    <span class="current-price" data-price="89">89,99 €</span>
</div>
```

**Key Selectors**:
- `.product-price[data-price]` - Price with data attribute
- `[itemprop="price"]` - Schema.org microdata
- `[itemprop="priceCurrency"]` - Currency in structured data
- `.price-amount`, `.current-price` - Display price

**Data Attributes**:
- `data-price` - Numeric price value
- `data-currency` - Currency code (EUR)
- `data-regular-price` - Original price

---

### 8. Vinted.fr

**Context**: Second-hand fashion marketplace

**HTML Structure** (peer-to-peer marketplace):
```html
<!-- Item listing price -->
<div class="item-price">
    <span class="price-text">89,99 €</span>
</div>

<!-- With shipping -->
<div class="price-container">
    <div class="item-price">89,99 €</div>
    <div class="shipping-price">+ 5,00 € de frais de port</div>
    <div class="total-price">Total: 94,99 €</div>
</div>
```

**Key Selectors**:
- `.item-price` - Item price
- `.price-text` - Price display
- `.shipping-price` - Shipping cost
- `.total-price` - Total cost

---

## Schema.org Structured Data (Common Across Sites)

Many French e-commerce sites implement Schema.org markup for SEO:

```html
<!-- JSON-LD format (preferred) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Product Name",
  "offers": {
    "@type": "Offer",
    "price": "89.99",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "url": "https://example.fr/product"
  }
}
</script>

<!-- Microdata format -->
<div itemscope itemtype="https://schema.org/Product">
  <span itemprop="name">Product Name</span>
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <meta itemprop="priceCurrency" content="EUR">
    <span itemprop="price" content="89.99">89,99 €</span>
  </div>
</div>
```

---

## Additional Common Patterns

### 1. Price Range (Min-Max)
```html
<div class="price-range">
    <span class="min-price">89,99 €</span>
    <span class="separator"> - </span>
    <span class="max-price">129,99 €</span>
</div>
```

### 2. Dynamic Pricing (JavaScript loaded)
```html
<div class="product-price" data-product-id="12345">
    <span class="price-loader">Chargement...</span>
</div>

<!-- Populated via JavaScript -->
<div class="product-price" data-product-id="12345">
    <span class="price">89,99 €</span>
</div>
```

### 3. Member/Loyalty Pricing
```html
<div class="price-members">
    <div class="public-price">89,99 €</div>
    <div class="member-price">Prix adhérent: 85,49 €</div>
</div>
```

### 4. Bundle Pricing
```html
<div class="bundle-price">
    <div class="individual-price">Prix séparé: 150,00 €</div>
    <div class="bundle-discount">En lot: 129,99 €</div>
    <div class="savings">Économisez: 20,01 €</div>
</div>
```

---

## Detection Strategies for Your Extension

### Priority 1: Structured Data
Look for Schema.org markup first - most reliable:
```javascript
// JSON-LD
const jsonLd = document.querySelector('script[type="application/ld+json"]');

// Microdata
const priceElements = document.querySelectorAll('[itemprop="price"]');
const currency = document.querySelector('[itemprop="priceCurrency"]');
```

### Priority 2: Common Class Patterns
```javascript
const priceSelectors = [
  // French-specific
  '.prix', '.produit-prix', '.prix-actuel',

  // Generic e-commerce
  '.price', '.product-price', '.price-value',
  '.current-price', '.sale-price', '.offer-price',

  // Site-specific (Amazon)
  '.a-price', '.a-offscreen',

  // Site-specific (Fnac)
  '.f-faPriceBox__price',

  // Generic with data attributes
  '[data-price]', '[data-product-price]'
];
```

### Priority 3: Data Attributes
```javascript
const dataAttrSelectors = [
  '[data-price]',
  '[data-product-price]',
  '[data-price-value]',
  '[data-regular-price]',
  '[data-currency]'
];
```

### Priority 4: ID-based Selectors
```javascript
const idSelectors = [
  '#price',
  '#priceblock_ourprice',
  '#priceblock_dealprice',
  '#product-price'
];
```

---

## French-Specific Considerations

### 1. Legal Requirements
- **Unit pricing mandatory**: Must show €/kg, €/L, €/m² for comparable products
- **Total price display**: Must show total including all taxes (TTC - Toutes Taxes Comprises)
- **Discount rules**: Must show previous price if claiming discount

### 2. Price Format Variations
```javascript
// Common French price formats
const frenchPricePatterns = [
  /(\d{1,3}(?:\s\d{3})*),(\d{2})\s?€/,      // 1 234,56 €
  /€\s?(\d{1,3}(?:\s\d{3})*),(\d{2})/,       // € 1 234,56
  /(\d{1,3}(?:\.\d{3})*),(\d{2})\s?€/,       // 1.234,56 €
  /(\d+),(\d{2})\s?€/,                        // 99,99 €
  /€(\d+),(\d{2})/                            // €99,99
];
```

### 3. Special Price Types to Handle

#### Prix barré (Crossed-out price)
```html
<span class="prix-barre">99,99 €</span>
<span class="prix-promo">89,99 €</span>
```

#### Prix au kilo (Unit price)
```html
<span class="prix-unitaire">(8,99 €/kg)</span>
```

#### Prix mensuel (Monthly installment)
```html
<span class="prix-mensuel">14,99 €/mois</span>
```

---

## Testing Checklist

To ensure your extension works on French e-commerce sites:

- [ ] Amazon.fr - Test search results, product pages, cart
- [ ] Fnac.com - Test books, electronics, marketplace items
- [ ] Cdiscount.com - Test deals, marketplace, various categories
- [ ] Darty.com - Test electronics with installment plans
- [ ] Boulanger.com - Test appliances, loyalty pricing
- [ ] E.Leclerc/LeclercDrive - Test groceries with unit pricing
- [ ] Carrefour.fr - Test grocery and general merchandise
- [ ] Handle comma decimal separator (French standard)
- [ ] Preserve euro symbol position (before or after)
- [ ] Detect Schema.org structured data
- [ ] Handle dynamically loaded prices (AJAX/React)
- [ ] Respect already processed elements (avoid double processing)

---

## Recommended Implementation Updates

Based on this analysis, consider these enhancements for your extension:

1. **Add French-specific class selectors**:
```javascript
const frenchPriceSelectors = [
  '.prix', '.produit-prix', '.prix-actuel',
  '.prix-promo', '.prix-barre',
  '.f-faPriceBox__price', // Fnac
  // ... others
];
```

2. **Enhanced Euro pattern with comma decimals**:
```javascript
EUR: /€\s?(\d{1,3}(?:[\s.]\d{3})*(?:,\d{2})?)/g
```

3. **Schema.org detection**:
```javascript
function getPriceFromSchema() {
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent);
      if (data.offers?.price) {
        return {
          price: parseFloat(data.offers.price),
          currency: data.offers.priceCurrency || 'EUR'
        };
      }
    } catch(e) {}
  }

  const microdata = document.querySelector('[itemprop="price"]');
  if (microdata) {
    return {
      price: parseFloat(microdata.getAttribute('content') || microdata.textContent),
      currency: document.querySelector('[itemprop="priceCurrency"]')?.getAttribute('content') || 'EUR'
    };
  }
}
```

4. **Data attribute detection**:
```javascript
function getPriceFromDataAttr(element) {
  const priceAttr = element.getAttribute('data-price') ||
                    element.getAttribute('data-product-price') ||
                    element.getAttribute('data-price-value');
  if (priceAttr) {
    return parseFloat(priceAttr);
  }
}
```

---

## Sources and References

- Semrush Top Retail Websites in France (August 2025)
- ChannelEngine Top Marketplaces in France (2025)
- Marketing4eCommerce Most Visited eCommerce Sites in France
- Fevad (French E-commerce and Distance Selling Federation)
- Schema.org Product and Offer documentation
- Web scraping documentation for French retailers
- Browser DevTools inspection patterns

---

## Maintenance Notes

**Important**: E-commerce HTML structures change frequently. Recommendations:

1. **Regular updates**: Review selectors quarterly
2. **Fallback strategies**: Always have multiple detection methods
3. **Error handling**: Gracefully handle missing or changed selectors
4. **User feedback**: Implement reporting for undetected prices
5. **Logging**: Track which detection method succeeded for analytics

**Last Updated**: 2025-10-10
**Next Review**: 2026-01-10
