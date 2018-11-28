const { 
    H, get, makeDriver, apply, E, Tuple, logReject, wait, log,
    trials, injectRamda
} = require('../index');

const Driver = makeDriver('chrome');

const url = 'http://www.bing.com';

apply(
    Driver.build(),
    Promise.resolve(1),
    E([
        get(url),
        log('waiting'),
        wait(5000),
        log('done waiting'),
        injectRamda
    ]),
    _ => promise => promise
)
    .then(console.log, console.log)