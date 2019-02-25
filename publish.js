require('chromedriver');
require('dotenv').config();
const csv = require('csvtojson');
const path = require('path');

const csvFilePath = path.resolve("input", process.argv[2]);
 


const {Builder, By, Key, until} = require('selenium-webdriver');

(async function example() {

// Load input file into jsonArray
  const jsonArray = await csv().fromFile(csvFilePath);


  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get(process.env.PT_SITE);
    await driver.findElement(By.css('input[name="mail"]')).sendKeys(process.env.PT_USER);
    await driver.findElement(By.css('input[name="pass"]')).sendKeys(process.env.PT_PASSWORD);
    await driver.findElement(By.css('input[name="login"]')).click();
    await driver.wait(until.elementLocated(By.className('newEvent')));
    await driver.findElement(By.className('newEvent')).click();
      
      
      
      
      
//    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
//    await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
//    await driver.quit();
  }
})();
