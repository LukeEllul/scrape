const R = require('ramda');
const { apply } = require('../src/low-level/apply');
const { get } = require('../src/io/fetcher');
const { injectJquery, injectScript, injectUrlScript, injectRamda } = require('../src/inject/inject');
const { scrape, E, EP, P, I } = require('../src/scrape/scrape');
const { makeDriver } = require('../src/selenium/selenium');

const Driver = makeDriver('MicrosoftEdge');
const bing = 'https://www.bing.com';

apply(
    Driver.build(),
    Promise.resolve(2),
    EP([
        E([
            get(bing),
            P(v => v + 1),
            injectRamda,
            EP([
                I(function(v, cb){
                    cb(R.range(0, v))
                }),
                I(function(v, cb){
                    cb(R.range(0, v + 1))
                }),
            ])
        ])
    ]),
    driver => promise => promise
)
    .then(v => console.log(v), err => console.log(err));