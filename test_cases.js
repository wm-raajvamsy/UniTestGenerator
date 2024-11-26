
import puppeteer from 'puppeteer';

(async () => {
    let browser;
    try {
        // Launch Puppeteer with headless mode disabled for better visibility during testing
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        
        // Navigate to the test URL
        await page.goto('https://www.wavemakeronline.com/run-ngnfytn5tb/testRN_master/rn-bundle/#/Main', { waitUntil: 'networkidle2' });

        // Test 1: Verify button click updates caption
        console.log('Test 1: Clicking Button1 should update its caption');
        await page.click('.button1'); // Assuming '.button1' is the class selector for button1
        const updatedCaption = await page.$eval('.button1', el => el.textContent);
        if (updatedCaption.includes('raaj')) {
            console.log('Test 1 Passed: Button1 caption updated successfully');
        } else {
            throw new Error('Test 1 Failed: Button1 caption not updated');
        }

        // Test 2: Verify text change updates datavalue
        console.log('Test 2: Changing Text1 should update its datavalue');
        await page.type('.text1', 'New Value'); // Assuming '.text1' is the class selector for text1
        const updatedDataValue = await page.$eval('.text1', el => el.getAttribute('data-value'));
        if (updatedDataValue === 'New Value') {
            console.log('Test 2 Passed: Text1 datavalue updated successfully');
        } else {
            throw new Error('Test 2 Failed: Text1 datavalue not updated');
        }

    } catch (error) {
        console.error('An error occurred during testing:', error);
    } finally {
        // Close the browser after tests
        if (browser) await browser.close();
    }
})();
