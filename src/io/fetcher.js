const R = require('ramda');
const { Tuple } = require('ramda-fantasy');
const { waitForDom } = require('../inject/inject');
const { apply } = require('../low-level/apply');

/**
 * get :: (String, Number?) -> [Tuple(a -> b, c -> d)]
 */
const get = (url, tries = 0) => [
    Tuple(
        (driver, v) => driver.get(url).then(_ => v, err => ({ err, v })),
        (driver, { err, v }) => {
            console.log(err);
            console.log(`couldnt get ${url}`);
            if (tries > 5) return Promise.reject(v);
            console.log(`trying for ${tries}th time`);
            return apply(
                driver,
                Promise.resolve(v),
                get(url, tries + 1),
                driver => promise => promise
            );
        }
    ),
    ...waitForDom()
];

module.exports = {
    get
};