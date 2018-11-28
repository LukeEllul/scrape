const R = require('ramda');
const { Tuple } = require('ramda-fantasy');
const { apply } = require('./apply');
const { log, logReject } = require('../logging/log');

/**
 * type Action = [Tuple((driver, v) -> b, (driver, v) -> d)]
 */

/**
 * P :: (a -> a) -> Action
 */
const P = f => [
    Tuple(
        (driver, v) => f(v, driver),
        (_, err) => Promise.reject(err)
    )
];

/**
 * Identity :: Action
 * 
 * Simply returns the current promise value.
 */
const Identity = [
    Tuple(
        (_, v) => v,
        (_, err) => Promise.reject(err)
    )
];

/**
 * ErrorIdentity :: Action
 * 
 * An action that will convert the result to an error no matter what.
 */
const ErrorIdentity = [
    Tuple(
        (_, v) => Promise.reject(v),
        (_, err) => Promise.reject(err)
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
        (_, err) => Promise.reject(err)
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
        logReject(err => `Error in EP: \n ${err}`)
    )
];

/**
 * badP :: (a -> a) -> Action
 * 
 * Like P but value is rejected.
 */
const badP = f => E([P(f), ErrorIdentity]);

/**
 * C :: (a -> Action) -> Action
 * 
 * {f} takes value returned from promise of previous action
 */
const C = f => [
    Tuple(
        (driver, v) => apply(
            driver,
            Promise.resolve(v),
            f(v),
            _ => promise => promise
        ),
        (_, v) => Promise.reject(v)
    )];

/**
 * D :: ((Driver, v) -> Driver) -> Action -> Action
 * 
 * Execute action in retured driver.
 */
const D = R.curry((driverF, action) => [
    Tuple(
        (driver, v) => apply(
            driverF(driver, v),
            Promise.resolve(v),
            action,
            _ => promise => promise
        ),
        logReject(err => `Error occured when injecting new Driver:\n ${err}`)
    )
]);

/**
 * Tap :: (a -> _) -> Action
 * 
 * Like P but return value is ignored
 */
const Tap = f => P(v => {
    const r = f(v);
    return r && r.then ? new Promise(res => r.then(() => res(v), () => res(v))) : v;
});

/**
 * wait :: Number -> Action
 */
const wait = ms => ms === 0 ? Identity : [
    Tuple(
        (_, v) => new Promise(res => setTimeout(() => res(v), ms)),
        (_, err) => Promise.reject(err)
    )
];

/**
 * H :: Action -> (err -> Action) -> Action
 * 
 * {action} action to handle
 * {fHandler} function that takes promise error and returns
 *  action to handle error
 * 
 * Second action will execute if the first action rejects a promise.
 */
const H = R.curry((action, fHandler) => [
    Tuple(
        (driver, v) => apply(
            driver,
            Promise.resolve(v),
            action,
            driver => promise => promise.then(
                R.identity,
                err => apply(
                    driver,
                    Promise.resolve(v),
                    fHandler(err),
                    _ => promise => promise
                )
            )
        ),
        (_, v) => Promise.reject(v)
    )
]);

/**
 * trials :: Number -> (Number | (Number, Number) -> Number) -> Action -> Action
 * 
 * {action} :: action to repeat
 * {n} number of trials
 * {s} number of milliseconds to wait between each trial OR
 * function that takes the previous milliseconds and trial and returns milliseconds
 */
const trials = R.curry((n, S, action) =>
    (s => H(action, err => n === 1 ? E([P(_ => err), ErrorIdentity]) :
        E([
            log(`waiting for ${s}ms...\n`),
            wait(s),
            trials(n - 1, typeof S === 'function' ? {f: S, ms: s} : S, action)
        ])))(
            typeof S === 'function' ? S(null, n) : 
            S.f ? S.f(S.ms, n) : S));

module.exports = {
    P,
    badP,
    Identity,
    ErrorIdentity,
    E,
    EP,
    C,
    D,
    Tap,
    wait,
    H,
    trials
};