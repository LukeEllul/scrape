const { Tuple } = require('ramda-fantasy');

/**
 * logReject :: v -> ((driver, a) -> Promise _ a)
 */
const logReject = v => (driver, a) => console.log(v) || Promise.reject(a);

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