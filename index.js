const R = require('ramda');
const { Tuple } = require('ramda-fantasy');
const { logReject, log } = require('./src/logging/log');
const { apply, D } = require('./src/low-level/apply');
const { get } = require('./src/io/fetcher');
const { injectJquery, injectScript, injectUrlScript, injectRamda } = require('./src/inject/inject');
const { scrape, P, injectBasics, combine, I, E, EP, wait } = require('./src/scrape/scrape');
const { makeDriver, close } = require('./src/selenium/selenium');

module.exports = {
    apply,
    get,
    injectJquery,
    injectScript,
    injectUrlScript,
    injectRamda,
    scrape,
    makeDriver,
    Tuple,
    logReject,
    P,
    injectBasics,
    combine,
    close,
    I,
    E,
    EP,
    D,
    wait,
    log
};