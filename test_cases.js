
import puppeteer from 'puppeteer';
import { expect } from '@playwright/test';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the specified URL and wait for the global configuration to load
  await page.goto('http://localhost:19009/rn-bundle/index.html#/Main');

  // Wait for the global configuration to be available
  await page.waitForFunction(() => 
    typeof wm.App !== 'undefined' && 
    typeof wm.App.appConfig !== 'undefined' && 
    wm.App.appConfig.currentPage
  );
                
  // Test button1Tap event handling
  try {
    const initialCaption = await page.evaluate(() => {
      return wm.App.appConfig.currentPage.Widgets.button1.caption;
    });
    expect(initialCaption).toBe('Initial Button Caption');

    await page.evaluate(() => {
      wm.App.appConfig.currentPage.Widgets.button1.onTap();
    });

    const updatedCaption = await page.evaluate(() => {
      return wm.App.appConfig.currentPage.Widgets.button1.caption;
    });
    expect(updatedCaption).toBe('raaj');
  } catch (e) {
    console.error('Button1 Tap Event Handling Assertion Failed:', e.message);
  }

  // Test text1Change event handling
  try {
    const initialText = await page.evaluate(() => {
      return wm.App.appConfig.currentPage.Widgets.text1.datavalue;
    });
    expect(initialText).toBe('Initial Text');

    await page.evaluate((newVal) => {
      wm.App.appConfig.currentPage.Widgets.text1.onChange(null, null, newVal, 'Initial Text');
    }, 'test');

    const updatedText = await page.evaluate(() => {
      return wm.App.appConfig.currentPage.Widgets.text1.datavalue;
    });
    expect(updatedText).toBe('test');
  } catch (e) {
    console.error('Text1 Change Event Handling Assertion Failed:', e.message);
  }

  // Test checkbox1Change event handling
  try {
    const initialCaption = await page.evaluate(() => {
      return wm.App.appConfig.currentPage.Widgets.checkbox1.caption;
    });
    expect(initialCaption).toBe('Initial Checkbox Caption');

    await page.evaluate(() => {
      wm.App.appConfig.currentPage.Widgets.checkbox1.onChange(null, null, true, false);
    });

    const updatedCaption = await page.evaluate(() => {
      return wm.App.appConfig.currentPage.Widgets.checkbox1.caption;
    });
    expect(updatedCaption).toBe('Checked Checkbox Caption');

    await page.evaluate(() => {
      wm.App.appConfig.currentPage.Widgets.checkbox1.onChange(null, null, false, true);
    });

    const uncheckedCaption = await page.evaluate(() => {
      return wm.App.appConfig.currentPage.Widgets.checkbox1.caption;
    });
    expect(uncheckedCaption).toBe('Unchecked Checkbox Caption');
  } catch (e) {
    console.error('Checkbox1 Change Event Handling Assertion Failed:', e.message);
  }

  await browser.close();
})();
