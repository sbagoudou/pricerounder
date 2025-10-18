# Price Rounder Browser Extension

> Stop falling for psychological pricing! Automatically round prices like €29.99 to €30 so you can see the real cost at a glance.

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Manifest](https://img.shields.io/badge/manifest-v3-orange)

## 📖 Overview

**Price Rounder** is a browser extension that helps you make better purchasing decisions by revealing the true cost of items. It automatically detects and rounds psychological pricing (like €29.99, €54.90, $19.95) to whole numbers, making it easier to compare prices and budget accurately.

### Why Use Price Rounder?

Retailers use psychological pricing (ending prices in .99, .95, .90) to make products seem cheaper than they actually are. This extension cuts through that marketing trick by showing you the real, rounded price.

## ✨ Features

- ✅ **Automatic Price Detection** - Works on Amazon, Fnac, Cdiscount, Darty, Carrefour, and most e-commerce sites
- ✅ **Multi-Currency Support** - Handles €, $, £ with proper formatting
- ✅ **French Format Support** - Correctly processes European price formatting (1.234,56 €)
- ✅ **Multiple Rounding Modes**:
  - Round up (29.99 → 30)
  - Round to nearest (29.49 → 29, 29.50 → 30)
  - Round to nearest 5 (29.99 → 30, 32.99 → 35)
  - Round to nearest 10 (29.99 → 30, 34.99 → 40)
- ✅ **Show Original Prices** - Toggle display of original prices in small parentheses
- ✅ **Dynamic Content Support** - Works with AJAX/SPA sites
- ✅ **Clean UI** - Simple popup interface with intuitive controls

## 🚀 Installation

### Chrome/Edge/Brave

1. Download or clone this repository
2. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Enable **Developer mode** (toggle in top right corner)
4. Click **Load unpacked**
5. Select the `pricerounder` folder
6. The extension icon should appear in your toolbar!

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` file from the `pricerounder` folder
5. The extension is now active!

**Note**: For permanent installation in Firefox, the extension needs to be signed by Mozilla.

## 🎯 Usage

### Basic Usage

1. **Install the extension** (see above)
2. **Browse any e-commerce site** - The extension works automatically
3. **Prices are rounded** - You'll see prices like €29.99 displayed as €30

### Settings

Click the extension icon to open the settings popup:

#### Enable/Disable
Toggle the extension on or off without uninstalling it.

#### Rounding Mode
- **Round Up** - Always rounds to the next whole number (29.99 → 30)
- **Nearest** - Standard rounding (29.49 → 29, 29.50 → 30)
- **Nearest 5** - Rounds to nearest multiple of 5 (29.99 → 30, 32.99 → 35)
- **Nearest 10** - Rounds to nearest multiple of 10 (29.99 → 30, 34.99 → 40)

#### Show Original Price
Toggle to show/hide the original price in small parentheses next to the rounded price.

### Example

**Before:**
```
Product A: €29.99
Product B: €54.90
Product C: €19.95
```

**After (Round Up mode with "Show Original" enabled):**
```
Product A: €30 (€29.99)
Product B: €55 (€54.90)
Product C: €20 (€19.95)
```

## 🌍 Supported Sites

### Fully Tested
- ✅ **Amazon.fr / Amazon.com** - All price formats
- ✅ **Fnac.com** - Product listings and detail pages
- ✅ **Cdiscount.com** - Search results and products
- ✅ **Conforama.fr** - Furniture and home appliances
- ✅ **Darty.com** - Electronics pricing
- ✅ **Boulanger.com** - Appliances and tech
- ✅ **Carrefour.fr** - Online grocery
- ✅ **E.Leclerc** - Grocery and general merchandise

### Generic Support
The extension uses multiple detection methods and should work on most e-commerce sites:
- Standard price classes (`.price`, `.product-price`, etc.)
- Data attributes (`data-price`, `data-product-price`)
- Schema.org markup (`itemprop="price"`)
- French-specific patterns (`.prix`, `.prix-actuel`, etc.)

## 🛠️ Technical Details

### Files Structure

```
pricerounder/
├── manifest.json                          # Extension configuration (Manifest V3)
├── content.js                             # Main logic (modular architecture)
├── popup.html                             # Settings UI
├── popup.js                               # Popup functionality
├── icons/                                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── create_icons.html                      # Icon generator utility
├── README.md                              # This file
├── REFACTORING_SUMMARY.md                 # Code refactoring details
├── FRENCH_ECOMMERCE_PRICE_STRUCTURES.md   # Site analysis
├── IMPLEMENTATION_GUIDE_FR.md             # Developer guide
└── HTML_EXAMPLES_FR.md                    # Test cases
```

### How It Works

1. **Detection**: The extension scans the page for price elements using:
   - Amazon-specific selectors (`.a-price`, `.a-offscreen`)
   - French e-commerce selectors (`.prix`, `.f-faPriceBox__price`)
   - Generic patterns (`.price`, `[data-price]`)
   - Schema.org structured data

2. **Parsing**: Extracts price values handling:
   - Multiple currency formats (€, $, £)
   - French formatting (1.234,56 €)
   - US formatting ($1,234.56)
   - Non-breaking spaces

3. **Rounding**: Applies the selected rounding mode to psychological prices (.99, .95, .90)

4. **Display**: Replaces original prices with rounded versions while preserving:
   - Original formatting style
   - Currency symbols
   - Accessibility features

5. **Dynamic Monitoring**: Uses MutationObserver to handle AJAX-loaded content

### Code Architecture

The extension uses a modular architecture within a single file for optimal compatibility:

#### Modules

- **Config Module** - Centralized constants and configuration
  - Currency patterns and symbols
  - Site-specific selectors (Amazon, Cdiscount, Fnac, Darty)
  - Style configurations and thresholds

- **Utils Module** - Reusable utility functions
  - `normalizePrice()` - Handles EU/US number formatting
  - `roundPrice()` - Multiple rounding modes
  - `formatPrice()` - Display formatting
  - `createStyledPrice()` - DOM element creation
  - `detectDataAttributePrice()` - Data attribute parsing

- **Handlers Module** - Site-specific price processing
  - `BasePriceHandler` - Base class with shared functionality
  - `AmazonPriceHandler` - Amazon's complex structure
  - `CdiscountPriceHandler` - Split/standard formats
  - `FnacPriceHandler` - Fnac-specific handling
  - `SimplePriceHandler` - Generic price elements

- **Main Module** - Extension orchestration
  - Settings management
  - DOM element processing
  - MutationObserver setup
  - Event listeners

#### Benefits

- **No duplication** - Base class eliminates repeated code
- **Error handling** - Try-catch blocks throughout
- **Maintainability** - Easy to add new sites/currencies
- **Clear structure** - Each module has a single responsibility

See [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) for detailed architecture documentation.

### Supported Price Formats

| Format | Example | Currency | Region |
|--------|---------|----------|--------|
| Symbol prefix | €29.99 | EUR | Europe |
| Symbol suffix | 29.99€ | EUR | Europe |
| French format | 1.234,56 € | EUR | France |
| US format | $1,234.56 | USD | USA |
| UK format | £29.99 | GBP | UK |
| With spaces | 29 99 € | EUR | France |

### Detection Priority

The extension uses a prioritized detection strategy:

1. **Data attributes** (most reliable) - `data-price="29.99"`
2. **Site-specific handlers** - Amazon `.a-price`, Fnac `.f-faPriceBox__price`
3. **Schema.org markup** - `itemprop="price"`
4. **Generic selectors** - `.price`, `.prix`
5. **Text pattern matching** - Regex fallback

## 🔧 Configuration

### Default Settings

```javascript
{
  enabled: true,
  roundingMode: 'up',
  showOriginal: true
}
```

Settings are stored using `chrome.storage.sync` and persist across browser sessions.

## 🧪 Testing

### Manual Testing

1. Visit test sites:
   - Amazon.fr: https://www.amazon.fr
   - Fnac: https://www.fnac.com
   - Cdiscount: https://www.cdiscount.com

2. Search for any product

3. Verify prices ending in .99, .95, .90 are rounded

4. Test different rounding modes in the popup

5. Toggle "Show Original Price" to verify display changes

### Console Testing

Open browser DevTools (F12) and run:

```javascript
// Check how many prices were detected
console.log('Total .a-price elements:', document.querySelectorAll('.a-price').length);
console.log('Modified prices:', document.querySelectorAll('.price-rounder-modified').length);

// Test price normalization (paste into console)
function testNormalization() {
  const tests = [
    '29,99 €',      // French
    '$29.99',       // US
    '1.234,56 €',   // French with thousands
    '$1,234.56'     // US with thousands
  ];

  tests.forEach(price => {
    console.log(price, '→', normalizePrice(price));
  });
}
```

## 🐛 Troubleshooting

### Prices Not Rounding

1. **Check if extension is enabled**
   - Click the extension icon
   - Verify the "Enable Price Rounder" toggle is ON

2. **Reload the page**
   - The extension runs on page load
   - Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

3. **Check browser console for errors**
   - Open DevTools (F12)
   - Look for red error messages
   - Report issues with console output

4. **Verify the price format**
   - Extension only rounds prices ending in .99, .95, .90
   - Prices must include currency symbols (€, $, £)

### Duplicate Prices Showing

1. **Reload the extension**
   - Go to `chrome://extensions/`
   - Click the refresh icon on Price Rounder
   - Reload the webpage

2. **Check for conflicting extensions**
   - Disable other price-related extensions
   - Test if the issue persists

### Extension Not Loading

1. **Check Manifest V3 compatibility**
   - Chrome 88+, Edge 88+, Brave (current version)
   - Firefox requires MV3 support

2. **Verify file permissions**
   - Ensure all files are readable
   - Check manifest.json is valid JSON

3. **Review browser console**
   - Go to `chrome://extensions/`
   - Click "Errors" button on the extension card
   - Check for loading errors

## 🚧 Known Limitations

- **Unit Prices**: Currently may round unit prices (€/kg, €/L) - filter planned for future update
- **Eco-participation fees**: Separate eco-fees may be incorrectly rounded
- **Bundle pricing**: Complex bundle displays may show unexpected results
- **Currency conversion**: Does not perform currency conversion, only rounding
- **Subscription prices**: Monthly/yearly pricing may need special handling

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] Add unit price filtering (skip €/kg, €/L prices)
- [ ] Improve bundle pricing detection
- [ ] Add support for more currencies (¥, ₹, etc.)

### Version 1.2 (Planned)
- [ ] Custom rounding rules per site
- [ ] Savings calculator (show how much .99 prices add up)
- [ ] Dark mode for popup UI
- [ ] Keyboard shortcuts

### Version 2.0 (Future)
- [ ] Price history tracking
- [ ] Price comparison across sites
- [ ] Budget alerts
- [ ] Statistics dashboard

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Report Bugs

1. Check if the issue already exists in [Issues](../../issues)
2. Create a new issue with:
   - Browser and version
   - Website URL where the bug occurs
   - Screenshots
   - Console errors (if any)

### Submit Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Add Support for New Sites

1. Analyze the site's HTML structure (see `IMPLEMENTATION_GUIDE_FR.md`)
2. Add site-specific selectors to `Config.FRENCH_PRICE_SELECTORS` in [content.js](content.js)
3. If needed, create a new handler class extending `BasePriceHandler`:
   ```javascript
   class NewSiteHandler extends BasePriceHandler {
     process(priceElement) {
       // Site-specific logic here
     }
   }
   ```
4. Register the handler in the `initialize()` function
5. Test thoroughly on the target site
6. Submit PR with examples and screenshots

## 📚 Documentation

- **[README.md](./README.md)** - This file (user guide and overview)
- **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Code architecture and refactoring details
- **[FRENCH_ECOMMERCE_PRICE_STRUCTURES.md](./FRENCH_ECOMMERCE_PRICE_STRUCTURES.md)** - Analysis of top 10 French e-commerce sites
- **[IMPLEMENTATION_GUIDE_FR.md](./IMPLEMENTATION_GUIDE_FR.md)** - Developer guide with code examples
- **[HTML_EXAMPLES_FR.md](./HTML_EXAMPLES_FR.md)** - Real-world HTML test cases

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2024 Price Rounder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- Thanks to all the e-commerce sites analyzed for this project
- Inspired by the psychology of pricing research
- Built with Manifest V3 for modern browser compatibility

## 📞 Support

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: support@pricerounder.com

## 🌟 Star History

If you find this extension useful, please consider giving it a star ⭐ on GitHub!

---

**Made with ❤️ to help you make smarter purchasing decisions**

*Stop falling for .99 pricing - see the real cost!*
