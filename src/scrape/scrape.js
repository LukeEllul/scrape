const R = require('ramda');
const { Tuple } = require('ramda-fantasy');
const { get } = require('../io/fetcher');
const { injectJquery, injectScript, injectRamda } = require('../inject/inject');
const { apply } = require('../low-level/apply');
const { logReject } = require('../logging/log');

/**
 * P :: (a -> a) -> Action
 */
const P = f => [
    Tuple(
        (driver, v) => f(v, driver),
        logReject(`error occured while using function ${f.toString()}`)
    )
];

/**
 * I :: (v -> *a -> cb -> b) -> Action
 * 
 * Used to inject script quicky.
 */
const I = (f, args = [], trials = 3) => injectScript(trials, f, args);

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

/**
 * injectBasics :: Action
 */
const injectBasics = [
    Tuple(
        (driver, v) => apply(
            driver,
            Promise.resolve(v),
            [
                ...injectJquery,
                ...injectRamda
            ],
            _ => promise => promise.then(_ => v)
        ),
        logReject(`error while injecting basics`)
    )
];

/**
 * combine :: ([{f: (v -> *a -> _), args: [a]} | (v -> *a -> _)], ?(a -> [a] -> a)) -> Action
 */
const combine = (fs, f) => [
    Tuple(
        (driver, v) => Promise.all(fs.map(f => {
            if (Array.isArray(f)) {
                const functions = f;//R.flatten(f);
                const fn = functions[0];
                return apply(
                    driver,
                    Promise.resolve(v),
                    [
                        ...typeof fn === 'function' ? injectScript(3, fn, []) : injectScript(3, fn.f, fn.args),
                        ...R.tail(functions).map(f => typeof f !== 'function' ? f : Tuple(
                            (driver, v) => f(v, driver),
                            logReject(`error while calling function: ${f.toString()}`)
                        ))
                    ],
                    _ => promise => promise
                )
            } else {
                return apply(
                    driver,
                    Promise.resolve(v),
                    typeof f === 'function' ? injectScript(3, f, []) : injectScript(3, f.f, f.args),
                    _ => promise => promise
                );
            }
        }))
            .then(res => f ? f(v)(res) : res),
        logReject(`error while combining injection scripts: ${fs.map(f => f.toString())}`)
    )
];

/**
 * E :: [Action] -> Action
 * 
 * Execute actions in series.
 */
const E = actions => [
    Tuple(
        (driver, v) =>
            apply(
                driver,
                Promise.resolve(v),
                actions.reduce((actions, action) => actions.concat(action)),
                _ => promise => promise
            ),
        logReject(`error in E function with these actions: ${actions}`)
    )
];

/**
 * EP :: [Action] -> Action
 * 
 * Execute Actions in parallel.
 */
const EP = actions => [
    Tuple(
        (driver, v) => Promise.all(actions.map(action =>
            apply(
                driver,
                Promise.resolve(v),
                action,
                _ => promise => promise
            ))),
        logReject(`Error occured when exeuting EP!`)
    )
];

module.exports = {
    scrape,
    P,
    injectBasics,
    combine,
    E,
    EP,
    I
};