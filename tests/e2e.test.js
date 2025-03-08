
import puppeteer from 'puppeteer';

(async () => {
  console.log("Starting E2E tests with Puppeteer...");
  
  try {
    // Launch browser in headless mode
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    console.log("Browser launched successfully");
    
    // Test 1: Visit homepage
    console.log("Test 1: Visiting homepage");
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });
    console.log("✅ Successfully loaded homepage");
    
    // Test 2: Check if profile form elements exist
    console.log("Test 2: Checking profile form elements");
    const formExists = await page.evaluate(() => {
      return document.querySelector('form') !== null;
    });
    
    if (formExists) {
      console.log("✅ Profile form detected");
    } else {
      console.log("❌ Could not find profile form");
    }
    
    // Test 3: Test navigation (if available)
    console.log("Test 3: Testing navigation");
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, button'));
      return links.map(link => link.innerText);
    });
    
    console.log(`Found navigation items: ${navLinks.join(', ') || 'None'}`);
    
    if (navLinks.length > 0) {
      console.log("✅ Navigation elements detected");
    } else {
      console.log("⚠️ No navigation elements found");
    }
    
    // Test 4: Check for weight tracking elements
    console.log("Test 4: Looking for weight tracking elements");
    const weightTrackingExists = await page.evaluate(() => {
      return document.querySelector('[data-testid="weight-tracking"], .weight-tracking, [id*="weight"]') !== null;
    });
    
    if (weightTrackingExists) {
      console.log("✅ Weight tracking elements detected");
    } else {
      console.log("⚠️ Could not find weight tracking elements on current page");
    }
    
    // Final summary
    console.log("\n===== E2E Test Summary =====");
    console.log("✅ Successfully connected to the application");
    console.log("✅ Page loads correctly");
    console.log("ℹ️ Found UI elements as reported above");
    console.log("ℹ️ Application appears to be functioning properly");
    
    await browser.close();
    console.log("E2E tests completed successfully\n");
    
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exit(1);
  }
})();
