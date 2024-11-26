
import puppeteer from 'puppeteer';
import { expect } from '@playwright/test';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the application and wait for global configuration to load
  await page.goto('http://localhost:19009/rn-bundle/index.html#/Main');
  await page.waitForFunction(() => 
    typeof wm.App !== 'undefined' && 
    typeof wm.App.appConfig !== 'undefined' && 
    wm.App.appConfig.currentPage
  );

  // Test Case 1: Validate Button Caption
  const buttonCaption = await page.evaluate(() => {
    return wm.App.appConfig.currentPage.Widgets.button1.caption;
  });
  expect(buttonCaption).toBe('Submit');

  // Test Case 2: Validate Text Widget Value
  const textWidgetValue = await page.evaluate(() => {
    return wm.App.appConfig.currentPage.Widgets.textWidget.datavalue;
  });
  expect(textWidgetValue).toBe('');

  // Test Case 3: Validate Button Click Event
  await page.evaluate(() => {
    wm.App.appConfig.currentPage.Widgets.button1.onTap();
  });
  const buttonClicked = await page.evaluate(() => {
    return wm.App.appConfig.currentPage.Widgets.labelWidget.caption;
  });
  expect(buttonClicked).toBe('Button Clicked');

  // Test Case 4: Validate Text Change Event
  await page.evaluate(() => {
    wm.App.appConfig.currentPage.Widgets.textWidget.onChange(null, null, 'Hello', '');
  });
  const textChanged = await page.evaluate(() => {
    return wm.App.appConfig.currentPage.Widgets.labelWidget.caption;
  });
  expect(textChanged).toBe('Text Changed: Hello');

  // Close the browser
  await browser.close();
})();
