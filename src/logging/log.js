const log = v => console.log(v) || v;

const logReject = v => log(v) || Promise.reject(v);

module.exports = {
    log,
    logReject
};