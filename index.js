const R = require('ramda');
const { Tuple } = require('ramda-fantasy');
const { logReject } = require('./src/logging/log');
const { apply } = require('./src/low-level/apply');
const { get } = require('./src/io/fetcher');
const { injectJquery, injectScript, injectUrlScript, injectRamda } = require('./src/inject/inject');
const { scrape, P } = require('./src/scrape/scrape');
const { makeDriver } = require('./src/selenium/selenium');

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
    P
};