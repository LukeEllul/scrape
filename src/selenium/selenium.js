const R = require('ramda');
const { Builder } = require('selenium-webdriver');

/**
 * makeDriver :: String -> Driver
 */
const makeDriver = browser => new Builder().forBrowser(browser).usingServer(`http://localhost:4444/wd/hub`);

module.exports = {
    makeDriver
};