const R = require('ramda');
const { Tuple } = require('ramda-fantasy');
const { waitForDom } = require('../inject/inject');
const { apply } = require('../low-level/apply');

/**
 * get :: (String, Number?) -> [Tuple((driver, a) -> b, (driver, err) -> d)]
 */
const get = (url, wait=100, tries = 0) => [
    Tuple(
        (driver, v) => driver.get(url).then(_ => v, err => Promise.reject({ err, v })),
        (driver, { err, v }) => {
            console.log(err);
            console.log();
            console.log(`couldnt get ${url}`);
            if (tries > 5) return Promise.reject({err, v});
            console.log(`trying for ${tries}th time`);
            console.log();
            return apply(
                driver,
                Promise.resolve(v),
                get(url, wait, tries + 1),
                driver => promise => promise
            );
        }
    ),
    ...waitForDom(wait)
];

module.exports = {
    get
};