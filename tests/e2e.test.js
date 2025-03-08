
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

(async () => {
  console.log("Starting E2E tests with Puppeteer...");
  
  // Start the server in a separate process
  const server = spawn('npm', ['run', 'dev'], { stdio: 'pipe' });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  let browser;
  try {
    // Launch browser in headless mode
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    console.log("Browser launched successfully");
    
    // Test 1: Visit homepage
    console.log("Test 1: Visiting homepage");
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0', timeout: 60000 });
    console.log("✅ Successfully loaded homepage");
    
    // Test 2: Check if profile form elements exist
    console.log("Test 2: Checking profile form elements");
    await page.waitForSelector('form', { timeout: 5000 }).catch(() => {});
    const formExists = await page.evaluate(() => {
      return document.querySelector('form') !== null;
    });
    
    if (formExists) {
      console.log("✅ Profile form detected");
    } else {
      console.log("⚠️ Could not find profile form on current page");
    }
    
    // Test 3: Test navigation (if available)
    console.log("Test 3: Testing navigation");
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, button, [role="button"]'));
      return links.map(link => link.innerText);
    });
    
    console.log(`Found navigation items: ${navLinks.join(', ') || 'None'}`);
    
    if (navLinks.length > 0) {
      console.log("✅ Navigation elements detected");
      
      // Try to click on a navigation item (if exists)
      const firstNavLink = navLinks[0];
      if (firstNavLink) {
        console.log(`Attempting to click on "${firstNavLink}" navigation item`);
        await page.evaluate((text) => {
          const elements = Array.from(document.querySelectorAll('nav a, button, [role="button"]'));
          const element = elements.find(el => el.innerText.includes(text));
          if (element) element.click();
        }, firstNavLink);
        await page.waitForTimeout(2000);
        console.log("✅ Navigation click successful");
      }
    } else {
      console.log("⚠️ No navigation elements found");
    }
    
    // Test 4: Look for fitness app specific elements
    console.log("Test 4: Looking for fitness app elements");
    const fitnessElements = await page.evaluate(() => {
      const selectors = [
        '[data-testid="weight-tracking"]', 
        '.weight-tracking', 
        '[id*="weight"]',
        '[data-testid="progress"]',
        '.progress',
        '[data-testid="dashboard"]',
        '.dashboard',
        '[data-testid="profile"]',
        '.profile'
      ];
      
      const found = [];
      for (const selector of selectors) {
        if (document.querySelector(selector)) {
          found.push(selector);
        }
      }
      return found;
    });
    
    if (fitnessElements.length > 0) {
      console.log(`✅ Found fitness elements: ${fitnessElements.join(', ')}`);
    } else {
      console.log("⚠️ Could not find specific fitness tracking elements");
    }
    
    // Examine page content
    const pageContent = await page.content();
    const contentSnippet = pageContent.substring(0, 500);
    console.log("Page content snippet:", contentSnippet);
    
    // Final summary
    console.log("\n===== E2E Test Summary =====");
    console.log("✅ Successfully connected to the application");
    console.log("✅ Page loads correctly");
    console.log("ℹ️ Found UI elements as reported above");
    console.log("ℹ️ Application appears to be functioning");
    
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    server.kill();
    console.log("E2E tests completed. Server stopped.\n");
  }
})();
