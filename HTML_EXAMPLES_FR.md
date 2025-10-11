# Real-World HTML Examples from French E-Commerce Sites

This document contains realistic HTML examples based on common patterns found on French e-commerce websites.

---

## Amazon.fr Examples

### Example 1: Search Results Price
```html
<div class="s-item-container">
  <span class="a-price" data-a-size="xl" data-a-color="base">
    <span class="a-offscreen">89,99 €</span>
    <span aria-hidden="true">
      <span class="a-price-symbol">€</span>
      <span class="a-price-whole">89<span class="a-price-decimal">,</span></span>
      <span class="a-price-fraction">99</span>
    </span>
  </span>
</div>
```

### Example 2: Product Detail Page
```html
<div id="corePrice_feature_div">
  <div class="a-section a-spacing-none aok-align-center">
    <span class="a-price a-text-price a-size-medium apexPriceToPay">
      <span class="a-offscreen">23,45 €</span>
      <span aria-hidden="true">
        <span class="a-price-symbol">€</span>
        <span class="a-price-whole">23<span class="a-price-decimal">,</span></span>
        <span class="a-price-fraction">45</span>
      </span>
    </span>
  </div>
  <div class="a-section a-spacing-small aok-align-center">
    <span class="a-size-small a-color-secondary aok-align-center basisPrice">
      <span class="a-price a-text-price">
        <span class="a-offscreen">26,90 €</span>
        <span aria-hidden="true">
          <del>26,90 €</del>
        </span>
      </span>
    </span>
  </div>
</div>
```

### Example 3: Legacy Product Page
```html
<div id="price" class="a-section a-spacing-small">
  <table class="a-lineitem">
    <tr>
      <td class="a-span12">
        <span id="priceblock_ourprice" class="a-size-medium a-color-price">89,99 €</span>
      </td>
    </tr>
  </table>
</div>
```

---

## Fnac.com Examples

### Example 1: Product Listing
```html
<article class="Article-wrapper">
  <div class="Article-price">
    <span class="f-faPriceBox__price userPrice checked">
      19,99 €
    </span>
  </div>
</article>
```

### Example 2: Product Detail with Discount
```html
<div class="f-buybox-price">
  <div class="f-priceBox">
    <span class="f-priceBox-price f-priceBox-price--old">
      <del>24,99 €</del>
    </span>
    <div class="f-priceBox-price-wrapper">
      <span class="f-priceBox-price f-priceBox-price--current userPrice">
        19,99 €
      </span>
      <span class="f-priceBox-price-savings">
        Économisez 5,00 €
      </span>
    </div>
  </div>
</div>
```

### Example 3: Marketplace Seller Price
```html
<div class="sellerOffer-price">
  <span class="price-container">
    <span class="price-value">89,99</span>
    <span class="price-currency">€</span>
  </span>
  <span class="price-info">+ 2,99 € de frais de port</span>
</div>
```

---

## Cdiscount.com Examples

### Example 1: Product Card
```html
<div class="prdtBILDetails">
  <div class="prdtPriceBox">
    <div class="price priceRed">
      <span class="price">89<sup>,99€</sup></span>
    </div>
    <div class="prdtPrice">
      <div class="priceBarred">
        <span>Prix de comparaison 99,99€</span>
      </div>
    </div>
  </div>
</div>
```

### Example 2: Flash Sale Product
```html
<div class="productPrice">
  <span class="price price--current" data-price="89.99">
    <span class="price-value">89<sup>,99</sup></span>
    <span class="price-currency">€</span>
  </span>
  <span class="price price--old">
    <del>99,99 €</del>
  </span>
  <span class="discount-badge">-10%</span>
</div>
```

### Example 3: Marketplace Product
```html
<div class="productPriceContainer">
  <div class="productPrice">
    <span class="productPriceStriked">99,99€</span>
    <span class="productPriceCurrent">
      <span class="fpPrice">89,99€</span>
    </span>
  </div>
  <p class="productShippingInfo">+ 5,99 € de frais de port</p>
</div>
```

---

## Darty.com Examples

### Example 1: Simple Product Price
```html
<div class="product-price" data-product-id="1234567">
  <div class="price-container">
    <span class="price-amount">489,99</span>
    <span class="price-currency">€</span>
  </div>
</div>
```

### Example 2: Product with Discount
```html
<div class="price-block">
  <div class="price-block__regular">
    <span class="price price--regular">
      <del>599,00 €</del>
    </span>
  </div>
  <div class="price-block__final">
    <span class="price price--final">
      <span class="amount">489,99 €</span>
    </span>
  </div>
  <div class="price-block__savings">
    <span class="savings-text">Dont 15,00 € d'éco-participation</span>
  </div>
</div>
```

### Example 3: Installment Payment
```html
<div class="product-pricing">
  <div class="main-price">
    <span class="price-value">1 299,99 €</span>
  </div>
  <div class="installment-price">
    <span class="installment-text">ou 4 x 325,00 €</span>
    <a class="installment-info" href="#">En savoir plus</a>
  </div>
  <div class="delivery-info">
    Livraison gratuite
  </div>
</div>
```

---

## Boulanger.com Examples

### Example 1: Product Listing
```html
<div class="product-price" data-product-sku="ABC123">
  <span class="price" data-price="299.99">
    <span class="value">299<sup>,99</sup></span>
    <span class="currency">€</span>
  </span>
</div>
```

### Example 2: With Loyalty Card Price
```html
<div class="price-container">
  <div class="standard-price">
    <span class="price-label">Prix:</span>
    <span class="price-value">299,99 €</span>
  </div>
  <div class="loyalty-price">
    <span class="card-icon"></span>
    <span class="loyalty-label">Prix carte B:</span>
    <span class="loyalty-value">284,99 €</span>
  </div>
  <div class="price-savings">
    <span>Soit 15,00 € d'économies</span>
  </div>
</div>
```

### Example 3: Promo Banner
```html
<div class="product-card">
  <div class="promo-flag">-10%</div>
  <div class="price-section">
    <span class="old-price"><del>329,00 €</del></span>
    <span class="new-price">299,99 €</span>
  </div>
</div>
```

---

## E.Leclerc / LeclercDrive Examples

### Example 1: Grocery Product
```html
<div class="product-price-container">
  <div class="main-price">
    <span class="price-euros">2</span>
    <sup class="price-cents">,99</sup>
    <span class="price-currency">€</span>
  </div>
  <div class="unit-price">
    <span class="unit-price-text">(14,95 €/kg)</span>
  </div>
</div>
```

### Example 2: Promo Product
```html
<div class="product-card">
  <div class="promo-badge">
    <span class="promo-text">-30%</span>
  </div>
  <div class="price-details">
    <div class="old-price">
      <span>4,27 €</span>
    </div>
    <div class="new-price">
      <span class="price">2,99 €</span>
    </div>
    <div class="unit-price">
      <span>(2,99 €/L)</span>
    </div>
  </div>
</div>
```

### Example 3: Bulk Pricing
```html
<div class="pricing-info">
  <div class="single-price">
    <span>Prix à l'unité: 3,50 €</span>
  </div>
  <div class="bulk-price">
    <div class="bulk-offer">
      <span class="offer-text">Lot de 3</span>
      <span class="offer-price">9,99 €</span>
    </div>
    <div class="unit-price-bulk">
      <span>(3,33 €/unité)</span>
    </div>
  </div>
</div>
```

---

## Carrefour.fr Examples

### Example 1: With Schema.org Microdata
```html
<div class="product" itemscope itemtype="https://schema.org/Product">
  <h1 itemprop="name">Nom du Produit</h1>
  <div class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <meta itemprop="priceCurrency" content="EUR">
    <span itemprop="price" content="12.99">12,99 €</span>
    <link itemprop="availability" href="https://schema.org/InStock">
    <meta itemprop="url" content="https://www.carrefour.fr/p/product-123">
  </div>
</div>
```

### Example 2: Simple Price with Data Attributes
```html
<div class="product-card" data-product-id="123456">
  <div class="product-price" data-price="12.99" data-currency="EUR">
    <span class="price-amount">12,99 €</span>
  </div>
  <div class="unit-price">
    <span>(6,50 €/kg)</span>
  </div>
</div>
```

### Example 3: Promotional Price
```html
<div class="price-wrapper">
  <div class="regular-price" data-regular-price="15.50">
    <span class="sr-only">Prix habituel</span>
    <del>15,50 €</del>
  </div>
  <div class="promo-price" data-price="12.99">
    <span class="price-label">Prix promo:</span>
    <span class="price-value">12,99 €</span>
  </div>
  <div class="promo-badge">
    <span>-16%</span>
  </div>
</div>
```

---

## Vinted.fr Examples

### Example 1: Item Listing
```html
<div class="item-box">
  <div class="item-price">
    <span class="price-text">15,00 €</span>
  </div>
  <div class="item-info">
    <span class="size">Taille: M</span>
  </div>
</div>
```

### Example 2: Item Detail with Shipping
```html
<div class="item-details">
  <div class="price-container">
    <div class="item-price">
      <h2 class="price-label">Prix</h2>
      <h3 class="price-value">15,00 €</h3>
    </div>
  </div>
  <div class="shipping-options">
    <div class="shipping-price">
      <span class="label">Frais de port:</span>
      <span class="value">5,00 €</span>
    </div>
    <div class="total-price">
      <span class="label">Total:</span>
      <span class="value">20,00 €</span>
    </div>
  </div>
</div>
```

---

## BackMarket.fr Examples (Refurbished Electronics)

### Example 1: Product Card with Condition-Based Pricing
```html
<div class="product-card">
  <div class="price-section">
    <div class="condition">
      <span class="condition-label">État: Excellent</span>
    </div>
    <div class="price">
      <span class="current-price">299,99 €</span>
      <span class="original-price"><del>399,00 €</del></span>
    </div>
    <div class="savings">
      <span class="savings-text">Économisez 99,01 €</span>
      <span class="savings-percent">(-25%)</span>
    </div>
  </div>
</div>
```

### Example 2: Multiple Condition Options
```html
<div class="pricing-options">
  <div class="condition-option" data-condition="excellent">
    <input type="radio" name="condition" value="excellent" checked>
    <label>
      <span class="condition-name">Excellent</span>
      <span class="condition-price">299,99 €</span>
    </label>
  </div>
  <div class="condition-option" data-condition="good">
    <input type="radio" name="condition" value="good">
    <label>
      <span class="condition-name">Très bon</span>
      <span class="condition-price">279,99 €</span>
    </label>
  </div>
  <div class="condition-option" data-condition="fair">
    <input type="radio" name="condition" value="fair">
    <label>
      <span class="condition-name">Bon</span>
      <span class="condition-price">259,99 €</span>
    </label>
  </div>
</div>
```

---

## La Redoute Examples (Fashion/Home)

### Example 1: Fashion Product
```html
<div class="product-price-block">
  <div class="price-container">
    <span class="price price--current" data-price="39.99">39,99 €</span>
  </div>
  <div class="price-details">
    <span class="tax-info">Dont 0,08 € d'éco-participation</span>
  </div>
</div>
```

### Example 2: Sale Item
```html
<div class="product-pricing">
  <div class="price-line">
    <span class="price price--old">
      <del>59,99 €</del>
    </span>
    <span class="discount-badge">-33%</span>
  </div>
  <div class="price-line">
    <span class="price price--sale">39,99 €</span>
  </div>
  <div class="price-line">
    <span class="price-info">Prix réduit déduit en panier</span>
  </div>
</div>
```

---

## Decathlon.fr Examples (Sports Equipment)

### Example 1: Simple Product Price
```html
<div class="product-price">
  <span class="price" data-price="19.99">
    <span class="price-value">19,99 €</span>
  </span>
</div>
```

### Example 2: Member Price
```html
<div class="pricing-section">
  <div class="standard-pricing">
    <div class="label">Prix public</div>
    <div class="price-value">24,99 €</div>
  </div>
  <div class="member-pricing">
    <div class="label">Prix membre</div>
    <div class="price-value member-price">19,99 €</div>
    <div class="savings">Économisez 5,00 €</div>
  </div>
</div>
```

---

## Common Edge Cases

### Example 1: Price with Eco-Participation Fee
```html
<div class="product-total-price">
  <div class="base-price">
    <span class="label">Prix produit:</span>
    <span class="value">489,99 €</span>
  </div>
  <div class="eco-fee">
    <span class="label">Éco-participation:</span>
    <span class="value">15,00 €</span>
  </div>
  <div class="total">
    <span class="label">Total:</span>
    <span class="value total-price">504,99 €</span>
  </div>
</div>
```

### Example 2: Price with Tax Breakdown
```html
<div class="price-breakdown">
  <div class="price-ht">
    <span>Prix HT: 416,66 €</span>
  </div>
  <div class="price-ttc">
    <span class="price">Prix TTC: 499,99 €</span>
  </div>
  <div class="tax-info">
    <span>TVA 20%: 83,33 €</span>
  </div>
</div>
```

### Example 3: Bundle/Pack Pricing
```html
<div class="pack-pricing">
  <div class="pack-header">
    <span class="pack-label">Pack de 3 articles</span>
  </div>
  <div class="pack-price">
    <div class="individual-total">
      <span>Prix unitaire total: 44,97 €</span>
    </div>
    <div class="pack-discount">
      <span class="pack-value">Prix du pack: 39,99 €</span>
      <span class="savings">Économisez 4,98 €</span>
    </div>
  </div>
</div>
```

### Example 4: Subscription/Recurring Pricing
```html
<div class="subscription-pricing">
  <div class="price-option">
    <input type="radio" name="pricing" value="onetime" checked>
    <label>
      <span class="option-label">Achat unique</span>
      <span class="option-price">29,99 €</span>
    </label>
  </div>
  <div class="price-option">
    <input type="radio" name="pricing" value="subscription">
    <label>
      <span class="option-label">Abonnement mensuel</span>
      <span class="option-price">24,99 € / mois</span>
      <span class="savings">(-17%)</span>
    </label>
  </div>
</div>
```

---

## JSON-LD Examples (Structured Data)

### Example 1: Simple Product
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Nom du Produit",
  "image": "https://example.fr/product.jpg",
  "description": "Description du produit",
  "sku": "ABC123",
  "brand": {
    "@type": "Brand",
    "name": "Marque"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.fr/produit",
    "priceCurrency": "EUR",
    "price": "89.99",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2025-12-31"
  }
}
</script>
```

### Example 2: Product with Multiple Offers
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Nom du Produit",
  "offers": [
    {
      "@type": "Offer",
      "price": "89.99",
      "priceCurrency": "EUR",
      "seller": {
        "@type": "Organization",
        "name": "Vendeur Principal"
      },
      "availability": "https://schema.org/InStock"
    },
    {
      "@type": "Offer",
      "price": "85.99",
      "priceCurrency": "EUR",
      "seller": {
        "@type": "Organization",
        "name": "Marketplace Seller 1"
      },
      "availability": "https://schema.org/InStock"
    }
  ]
}
</script>
```

### Example 3: Aggregate Offer (Price Range)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Nom du Produit",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "79.99",
    "highPrice": "99.99",
    "priceCurrency": "EUR",
    "offerCount": "12",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

---

## React/Vue Dynamic Pricing (Modern Frameworks)

### Example 1: React Component with Data Binding
```html
<div class="product-price" data-reactid=".0.1.2">
  <span class="price-container" data-price="89.99" data-currency="EUR">
    <span class="price-symbol">€</span>
    <span class="price-integer">89</span>
    <span class="price-decimal">,</span>
    <span class="price-cents">99</span>
  </span>
</div>
```

### Example 2: Vue.js Component
```html
<div id="price-component" data-v-5f3d2a10>
  <div class="price-display" data-v-5f3d2a10>
    <span class="price-amount" data-v-5f3d2a10>89,99 €</span>
  </div>
</div>
```

---

## Testing HTML Snippets

You can use these snippets for testing your extension:

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Test Page - French E-commerce Prices</title>
</head>
<body>
  <h1>Test des prix français</h1>

  <!-- Amazon-style -->
  <div class="a-price">
    <span class="a-offscreen">89,99 €</span>
  </div>

  <!-- Fnac-style -->
  <span class="f-faPriceBox__price userPrice">19,99 €</span>

  <!-- Simple price -->
  <div class="price">99,99 €</div>

  <!-- With data attribute -->
  <div class="product-price" data-price="89.99">89,99 €</div>

  <!-- Schema.org -->
  <div itemscope itemtype="https://schema.org/Product">
    <span itemprop="offers" itemscope itemtype="https://schema.org/Offer">
      <meta itemprop="priceCurrency" content="EUR">
      <span itemprop="price" content="89.99">89,99 €</span>
    </span>
  </div>

  <!-- Unit price (should be ignored) -->
  <div class="unit-price">(4,50 €/kg)</div>

  <!-- French formatting variations -->
  <p>Prix: 1 234,56 €</p>
  <p>Prix: €1.234,99</p>
  <p>Prix: 99,99€</p>
  <p>Prix: € 99,99</p>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Test Product",
    "offers": {
      "@type": "Offer",
      "price": "89.99",
      "priceCurrency": "EUR"
    }
  }
  </script>
</body>
</html>
```

---

**Last Updated**: 2025-10-10
**Purpose**: Testing and development reference for French e-commerce price detection
