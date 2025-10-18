# Contributing to Price Rounder

First off, thank you for considering contributing to Price Rounder! It's people like you that make Price Rounder such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples** - Include URLs where the bug occurs
* **Describe the behavior you observed** and what you expected to see
* **Include screenshots** if possible
* **Include your browser version** and extension version
* **Include console errors** (Open DevTools with F12 and check the Console tab)

#### Bug Report Template

```markdown
**Browser and Version:** Chrome 120.0.0
**Extension Version:** 1.0.0
**URL Where Bug Occurs:** https://example.com/product

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
A clear description of what you expected to happen.

**Actual Behavior:**
What actually happened.

**Screenshots:**
If applicable, add screenshots.

**Console Errors:**
Any errors from the browser console.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description** of the suggested enhancement
* **Provide specific examples** to demonstrate the steps
* **Describe the current behavior** and explain the behavior you'd like to see
* **Explain why this enhancement would be useful**

### Adding Support for New Sites

Want to add support for a new e-commerce site? Great! Here's how:

1. **Analyze the site's HTML structure**
   - Open DevTools (F12) and inspect price elements
   - Document the CSS selectors and structure
   - Check if prices are in one element or split (euros/cents)

2. **Determine if you need a custom handler**
   - Simple format? → Add selectors to `Config.FRENCH_PRICE_SELECTORS`
   - Complex format? → Create a new handler class

3. **Create a custom handler (if needed)**
   ```javascript
   class NewSiteHandler extends BasePriceHandler {
     process(priceElement) {
       if (this.shouldSkip(priceElement)) return;
       this.markProcessing(priceElement);

       try {
         // Your custom logic here
         const price = Utils.normalizePrice(priceStr);

         if (price !== null && Utils.shouldRoundPrice(price, this.settings.centsThreshold)) {
           const roundedPrice = Utils.roundPrice(price, this.settings.roundingMode);
           // Update the DOM
         }

         Utils.markAsProcessed(priceElement);
       } catch (error) {
         console.error('[Price Rounder] Error in NewSite handler:', error);
         Utils.unmarkAsProcessed(priceElement);
       }
     }
   }
   ```

4. **Register your handler**
   ```javascript
   // In initialize() function
   handlers = {
     // ... other handlers
     newsite: new NewSiteHandler(settings),
   };
   ```

5. **Test thoroughly**
   - Test on product listing pages
   - Test on product detail pages
   - Test with different price formats
   - Test with the extension enabled/disabled

6. **Document your changes**
   - Add examples to `HTML_EXAMPLES_FR.md`
   - Update `FRENCH_ECOMMERCE_PRICE_STRUCTURES.md`
   - Add the site to README.md

### Pull Request Process

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Use descriptive variable names
   - Keep functions focused and small

3. **Test your changes**
   - Load the extension in your browser
   - Test on multiple sites
   - Check the browser console for errors
   - Test different rounding modes

4. **Commit your changes**
   ```bash
   git commit -m "Add support for ExampleSite.com"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots/examples
   - Explain what you changed and why

#### Pull Request Template

```markdown
## Description
Brief description of your changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature (adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
Describe the tests you ran and how to reproduce them:
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Edge

## Screenshots (if applicable)
Add screenshots showing before/after.

## Checklist
- [ ] My code follows the code style of this project
- [ ] I have tested my changes
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings or errors
```

## Code Style Guidelines

### JavaScript

- Use **2 spaces** for indentation
- Use **single quotes** for strings (except in template literals)
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Use **UPPER_SNAKE_CASE** for constants
- Add **JSDoc comments** for functions
- Keep lines under **100 characters** when reasonable

### Code Organization

```javascript
// Good
class MyHandler extends BasePriceHandler {
  /**
   * Processes price elements
   * @param {HTMLElement} priceElement - The element to process
   */
  process(priceElement) {
    // Implementation
  }
}

// Bad
class myhandler {
  process(e) {
    // Implementation
  }
}
```

### Error Handling

Always wrap handler logic in try-catch blocks:

```javascript
try {
  // Your logic
  Utils.markAsProcessed(priceElement);
} catch (error) {
  console.error('[Price Rounder] Error in Handler:', priceElement, error);
  Utils.unmarkAsProcessed(priceElement);
}
```

### Comments

- Write clear, concise comments
- Explain **why**, not **what** (the code shows what)
- Document complex algorithms
- Add TODO comments for future improvements

```javascript
// Good
// Skip prices inside promotional banners as they may not be final prices
if (parent.classList.contains('promo-banner')) return;

// Bad
// Check if parent has class promo-banner
if (parent.classList.contains('promo-banner')) return;
```

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pricerounder.git
   cd pricerounder
   ```

2. **Load the extension in your browser**
   - **Chrome**: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", select the folder
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select `manifest.json`

3. **Make changes and reload**
   - Edit the files
   - Click the reload button in `chrome://extensions/`
   - Refresh the webpage you're testing on

4. **Check the console for errors**
   - Open DevTools (F12)
   - Look for errors in the Console tab
   - Check the extension background page console

## Testing

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Prices are detected and rounded correctly
- [ ] Original prices show/hide when toggled
- [ ] Different rounding modes work (up, nearest, nearest5, nearest10)
- [ ] Extension can be enabled/disabled
- [ ] Settings persist across browser restarts
- [ ] No duplicate prices appear
- [ ] Works on multiple e-commerce sites
- [ ] Works with dynamically loaded content (AJAX)
- [ ] No console errors

### Test Sites

Test your changes on these sites:
- Amazon.fr
- Fnac.com
- Cdiscount.com
- Conforama.fr
- (Add more as needed)

## Documentation

When adding new features or sites:

1. Update [README.md](README.md) - Add to supported sites list
2. Update [FRENCH_ECOMMERCE_PRICE_STRUCTURES.md](FRENCH_ECOMMERCE_PRICE_STRUCTURES.md) - Document HTML structure
3. Add examples to [HTML_EXAMPLES_FR.md](HTML_EXAMPLES_FR.md)
4. Update [IMPLEMENTATION_GUIDE_FR.md](IMPLEMENTATION_GUIDE_FR.md) if adding new patterns

## Questions?

Don't hesitate to ask questions by:
- Opening an issue with the "question" label
- Reaching out in discussions

## Recognition

Contributors will be recognized in:
- README.md acknowledgments section
- Release notes
- Git commit history

Thank you for contributing! 🎉
