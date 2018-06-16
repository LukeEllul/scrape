const R = require('ramda');
const { Tuple } = require('ramda-fantasy');
const { logReject } = require('../logging/log');
const { apply } = require('../low-level/apply');

/**
 * waitForDom :: (Number?, Number?) -> [Tuple((driver, a) -> b, (driver, c) -> d)]
 */
const waitForDom = (n = 100, trials = 0) => [
    Tuple(
        (driver, v) => driver.executeAsyncScript(function (n, cb) {
            const interval = setInterval(function () {
                if (document.readyState === 'complete') {
                    clearInterval(interval);
                    cb();
                }
            }, n)
        }, n)
            .then(_ => v, err => Promise.reject({ err, v })),
        (driver, { err, v }) => {
            console.log(err);
            console.log();
            console.log(`waiting again for ${n * 2}ms`);
            console.log(`trying for the ${trials + 1}th time`);
            console.log();
            return trials > 5 ? Promise.reject({err, v}) : apply(
                driver,
                Promise.resolve(v),
                waitForDom(n * 2, trials + 1),
                driver => promise => promise
            );
        }
    )];

/**
 * injectScript :: Number -> (v -> *a -> _) -> [d] -> [Tuple((driver, a) -> b, (driver, c) -> d)]
 */
const injectScript = R.curry((trials, f, d) => [
    ...waitForDom(),
    Tuple(
        (driver, v) => driver.executeAsyncScript(f, v, ...d).then(r => r || v, err => Promise.reject({ err, v })),
        (driver, { err, v }) => {
            console.log(err);
            console.log(`script ${f.toString()} cannot be injected`);
            if (trials === 0) return Promise.reject({err, v});
            console.log(`trying to inject script once more...`);
            return apply(
                driver,
                Promise.resolve(v),
                injectScript(trials - 1, f, d),
                driver => promise => promise
            );
        }
    )
]);

/**
 * injectUrlScript :: (string, Number?) -> [Tuple((driver, a) -> b, (driver, c) -> d)]
 */
const injectUrlScript = (url, trials = 0) => [
    ...waitForDom(),
    Tuple(
        (driver, v) => driver.executeAsyncScript(function (url, cb) {
            const script = document.createElement('script');
            script.onload = function () {
                setTimeout(function () { cb() }, 500);
            }
            script.src = url;
            script.crossOrigin = "anonymous";
            document.getElementsByTagName('head')[0].appendChild(script);
        }, url)
            .then(_ => v, err => Promise.reject({ err, v })),
        (driver, { err, v }) => {
            console.log(err);
            console.log(`URL script ${url} cannot be injected`);
            if (trials > 0) return Promise.reject({err, v});
            console.log('trying once more...');
            return apply(
                driver,
                Promise.resolve(v),
                injectUrlScript(url, trials + 1),
                driver => promise => promise
            );
        }
    ),
    ...waitForDom()
];

/**
 * injectJquery :: [Tuple(a -> b, c -> d)]
 */
const injectJquery = injectUrlScript("https://code.jquery.com/jquery-3.3.1.min.js");

/**
 * injectRamda :: [Tuple(a -> b, c -> d)]
 */
const injectRamda = injectUrlScript(`//cdn.jsdelivr.net/npm/ramda@latest/dist/ramda.min.js`);

module.exports = {
    waitForDom,
    injectScript,
    injectUrlScript,
    injectJquery,
    injectRamda
};