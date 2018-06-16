const R = require('ramda');
const { apply } = require('./src/low-level/apply');
const { get } = require('./src/io/fetcher');
const { injectJquery, injectScript, injectUrlScript, injectRamda } = require('./src/inject/inject');
const { scrape } = require('./src/scrape/scrape');
const { makeDriver } = require('./src/selenium/selenium');

const Driver = makeDriver('chrome');

apply(
    Driver,
    Promise.resolve(2),
    scrape(
        `https://www.bing.com/`,
        [],
        function(v, cb){
            cb(R.range(0, 56).map(n => n * v))
        }
    ),
    driver => promise => promise
)
    .then(v => console.log(v), err => console.log(err));