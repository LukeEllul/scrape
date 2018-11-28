const { Tuple } = require('ramda-fantasy');

/**
 * logReject :: (v | (err -> v)) -> ((driver, a) -> Promise _ a)
 */
const logReject = v => (driver, a) => console.log(typeof v === 'function' ? v(a) : v) || Promise.reject(a);

/**
 * log :: (String?) -> Action
 */
const log = s => [
    Tuple(
        (_, v) => (console.log(s || v), v),
        logReject(`error occured while logging: ${s}`)
    )
];

module.exports = {
    log,
    logReject
};