const { Tuple } = require('ramda-fantasy');
const { logReject, log } = require('./src/logging/log');
const { apply } = require('./src/low-level/apply');
const { get, simpleGet } = require('./src/io/fetcher');
const { injectJquery, injectScript, injectUrlScript, injectRamda, I } = require('./src/inject/inject');
const { injectReadStream, injectStreamer } = require('./src/io/streams');
const { scrape, injectBasics, combine } = require('./src/scrape/scrape');
const { makeDriver, close } = require('./src/selenium/selenium');
const ActionFunctions = require('./src/low-level/actions');

const WebDriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

module.exports = {
    apply,
    get,
    simpleGet,
    log,
    injectJquery,
    injectScript,
    injectUrlScript,
    injectRamda,
    scrape,
    makeDriver,
    Tuple,
    logReject,
    injectBasics,
    combine,
    close,
    injectReadStream,
    injectStreamer,
    ...ActionFunctions,
    I,
    ...WebDriver,
    chrome
};
