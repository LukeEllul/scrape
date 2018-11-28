const R = require('ramda');
const urlExists = require('url-exists');
const { Tuple } = require('ramda-fantasy');
const { logReject } = require('../logging/log');
const { trials } = require('../low-level/actions');

/**
 * simpleGet :: String -> Action
 */
const simpleGet = url => [
    Tuple(
        (_, v) => new Promise((res, rej) => urlExists(url, (err, exists) =>
            exists ? res(v) : rej(err))),
        logReject(`cannot reach ${url} because it doesn't exist`)
    ),
    Tuple(
        (driver, v) => driver.get(url).then(_ => v, err => Promise.reject(err)),
        logReject(`cannot get ${url}`)
    )
];

/**
 * get :: String -> Action
 * 
 * {url} url of site to get 
 */
const get = url => trials(3, ms => ms ? ms + 2000 : 3000, 
    simpleGet(url));

module.exports = {
    simpleGet,
    get
};