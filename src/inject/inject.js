const R = require('ramda');
const { Tuple } = require('ramda-fantasy');
const { logReject } = require('../logging/log');
const { E, trials, H, P, badP, C, wait } = require('../low-level/actions');

/**
 * type Injection = (v -> *a -> cb -> b)
 */

/**
 * waitForDom :: (Number?) -> Action
 * 
 * {n} milliseconds to wait to check if DOM is loaded
 */
const waitForDom = (n = 100) => [
    Tuple(
        (driver, v) => driver.executeAsyncScript(function (n, cb) {
            const interval = setInterval(function () {
                if (document.readyState === 'complete') {
                    clearInterval(interval);
                    cb();
                }
            }, n);
        }, n)
            .then(_ => v, err => Promise.reject(err)),
        logReject('error occured while waiting for dom')
    )
];

/**
 * injectScript :: Number -> [a] -> Injection -> Action
 * 
 * {triess} no of trials
 * {args} args to injection
 * {injection} injection function
 */
const injectScript = R.curry((tries, args, injection) =>
    trials(tries, ms => ms ? ms + 500 : 500, E([
        waitForDom(),
        [
            Tuple(
                (driver, v) => driver.executeAsyncScript(injection, v, ...args)
                    .then(r => r || v, err => Promise.reject(err)),
                logReject(err => `Error injecting script:\n ${err}`)
            )
        ],
        waitForDom()
    ])));

/**
 * I :: Injection -> Action
 * 
 * Used to inject script quicky.
 */
const I = (f, args = [], tries = 3) => injectScript(tries, args, f);

/**
 * injectUrlScript :: String -> Action
 * 
 * Imp: Fails with the passed value.
 */
const injectUrlScript = (url, n = 0) => H(
    E([
        I(function (v, url, cb) {
            if (!navigator.onLine) {
                cb({v, m: 'not online'});
                return;
            }
            const script = document.createElement('script');
            script.onload = function () {
                setTimeout(function () { cb(v) }, 500);
            }
            script.src = url;
            script.crossOrigin = "anonymous";
            document.getElementsByTagName('head')[0].appendChild(script);
        }, [url]),
        C(v => {
            if(v && v.m === 'not online'){
                console.log(`${url} cannot be reached because no internet`);
                if(n === 1) return badP(_ => v.v);
                console.log('trying once more...');
                return E([
                    P(_ => v.v),
                    wait(5000),
                    injectUrlScript(url, 1)
                ]);
            }
            else return P(_ => v);
        })
    ]),
    err => badP(_ => err)
);

/**
 * injectJquery :: Action
 */
const injectJquery = injectUrlScript("https://code.jquery.com/jquery-3.3.1.min.js");

/**
 * injectRamda :: Action
 */
const injectRamda = injectUrlScript(`//cdn.jsdelivr.net/npm/ramda@latest/dist/ramda.min.js`);

module.exports = {
    waitForDom,
    injectScript,
    injectUrlScript,
    injectJquery,
    injectRamda,
    I
};