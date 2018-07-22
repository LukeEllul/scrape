const R = require('ramda');
const { Tuple } = require('ramda-fantasy');
const { get } = require('../io/fetcher');
const { injectJquery, injectScript, injectRamda } = require('../inject/inject');
const { apply } = require('../low-level/apply');
const { logReject } = require('../logging/log');

/**
 * process :: (a -> a) -> Action
 */
const P = f => [
    Tuple(
        (_, v) => f(v),
        logReject(`error occured while using function ${f.toString()}`)
    )
];

/**
 * scrape :: String -> [a] -> (v -> *a -> _) -> [Tuple((driver, a) -> b, (driver, c) -> d)]
 */
const scrape = R.curry((url, args, f) => [
    Tuple(
        (driver, v) => apply(
            driver,
            Promise.resolve(v),
            [
                ...get(url),
                ...injectJquery,
                ...injectRamda,
                ...injectScript(3, f, args)
            ],
            driver => promise => promise
        ),
        logReject(`
            error occured while scraping ${url} with args ${args} and script:
            ${f}
        `)
    )
]);

module.exports = {
    scrape,
    P
};