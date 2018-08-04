const R = require('ramda');
const { Builder } = require('selenium-webdriver');
const { Tuple } = require('ramda-fantasy');

/**
 * makeDriver :: String -> Driver
 */
const makeDriver = (browser) =>
    new Builder()
        .forBrowser(browser)
        .usingServer(`http://localhost:4444/wd/hub`);

/**
 * close :: Action
 */
const close = [
    Tuple(
        (driver, v) => driver.close().then(_ => v),
        (driver, err) => driver.close().then(_ => Promise.reject(err))
    )
]

module.exports = {
    makeDriver,
    close
};